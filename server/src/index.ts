import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { WeatherService } from './services/weatherService';
import { RealtimeService } from './services/realtimeService';
import { setRealtimeService } from './controllers/realtimeController';
import { setRealtimeService as setHardwareRealtimeService } from './controllers/hardwareController';
import sensorRoutes from './routes/sensor';
import userRoutes from './routes/user';
import deviceRoutes from './routes/device';
import imageCaptureRoutes from './routes/imageCapture';
import alertLogRoutes from './routes/alertLog';
import hardwareRoutes from './routes/hardware';
import weatherRoutes from './routes/weather';
import mapsRoutes from './routes/maps';
import realtimeRoutes from './routes/realtime';
import loginRoute from './routes/loginRoute';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/image-captures', imageCaptureRoutes);
app.use('/api/alerts', alertLogRoutes);
app.use('/api/hardware', hardwareRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use("/api/login", loginRoute);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RelaWand API is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
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