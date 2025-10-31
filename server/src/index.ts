import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { connectDB } from './config/database';
import { WeatherService } from './services/weatherService';
import { RealtimeService } from './services/realtimeService';
import { setRealtimeService } from './controllers/realtimeController';
import { setRealtimeService as setHardwareRealtimeService } from './controllers/hardwareController';
import sensorRoute from './routes/sensorRoute';
import userRoutes from './routes/user';
import imageCaptureRoutes from './routes/imageCapture';
import alertLogRoutes from './routes/alertRoute';
import hardwareRoutes from './routes/hardware';
import weatherRoutes from './routes/weather';
import mapsRoutes from './routes/maps';
import realtimeRoutes from './routes/realtime';
import loginRoute from './routes/loginRoute';
import deviceRoute from './routes/deviceRoute';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// CORS - MUST be before other middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// FIXED: Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'relawand-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/relawand',
    touchAfter: 24 * 3600 // lazy session update (24 hours)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
}));

// Routes
app.use('/login', loginRoute);

// FIXED: Add API auth routes that map to login controller
app.get('/api/auth/check', (req, res, next) => {
  // Delegate to the login route controller
  req.url = '/check';
  loginRoute(req, res, next);
});

app.post('/api/auth/logout', (req, res, next) => {
  // Delegate to the login route controller
  req.url = '/logout';
  loginRoute(req, res, next);
});
app.use('/devices', deviceRoute); // Changed to plural for consistency

// FIXED: Register all other routes
app.use('/api/sensors', sensorRoute);
app.use('/api/users', userRoutes);
app.use('/api/images', imageCaptureRoutes);
app.use('/api/alerts', alertLogRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/realtime', realtimeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RelaWand API is running' });
});

// FIXED: Handle 404 with JSON response (not HTML)
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  
  // FIXED: Always return JSON, never HTML
  res.status(err.status || 500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message 
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Initialize weather service and start scheduler
    const weatherService = new WeatherService();
    weatherService.startHourlyWeatherUpdates();

    // Initialize real-time service
    const realtimeService = new RealtimeService(httpServer);
    setRealtimeService(realtimeService);
    setHardwareRealtimeService(realtimeService);

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔐 Auth endpoints ready at /api/auth/*`);
      console.log(`📍 Maps API ready (configure GOOGLE_MAPS_API_KEY)`);
      console.log(`🌤️  Weather API ready (configure OPENWEATHERMAP_API_KEY)`);
      console.log(`⏰ Weather scheduler started - updates every hour`);
      console.log(`📡 Real-time WebSocket server ready`);
      console.log(`📊 Graph data streaming enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// FIXED: Add TypeScript declaration for session
declare module 'express-session' {
  interface SessionData {
    user: {
      id: string;
      email: string;
      name?: string;
    };
  }
}