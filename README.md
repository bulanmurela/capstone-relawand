# CAPSTONE - RelaWand: Tongkat Sensor IoT untuk Pemantauan dan Peringatan Dini Kebakaran Hutan

**Capstone Design Tahun 2025**

**Group F01: National Heritage and Conservation**
- Yitzhak Edmund Tio Manalu
- Hanif Rabbani Sakha
- Raudha Nur Hidayatullah Susanto
- Bulan Aprilia Putri Murela

---

## 🌐 Web Application

A modern IoT web application for monitoring and managing sensor data from STM32 microcontrollers. Built with React Next.js frontend, Express.js backend, and MongoDB database.

### 🏗️ Architecture

```
relawand-app/
├── client/          # Next.js React frontend
├── server/          # Express.js backend API
├── shared/          # Shared utilities and types
├── scripts/         # Setup and utility scripts
└── docker-compose.yml # Database services
```

### 🚀 Features

- **Real-time IoT Data**: Collect and display sensor data from STM32 devices
- **RESTful API**: Well-structured API endpoints for sensor data management
- **Responsive UI**: Modern React-based frontend with Tailwind CSS
- **MongoDB Integration**: Efficient storage and querying of sensor data
- **Docker Support**: Easy database setup with Docker Compose
- **TypeScript**: Full type safety across the application

### 📊 Supported Sensor Data

- Temperature, Humidity, Pressure
- Light intensity and Motion detection
- Electrical measurements (Voltage, Current, Power, Energy)
- Power quality metrics (Frequency, Power Factor)
- Location data (GPS coordinates)
- Device metadata (Battery level, Signal strength, Firmware version)

### ⚡ Quick Start

#### Prerequisites

- Node.js 18+ and npm
- MongoDB (see MongoDB Setup options below)
- Git

#### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd capstone-relawand
   ```

2. **Setup without Docker (Recommended)**
   ```bash
   npm run setup:no-docker
   ```

3. **Setup with Docker (Optional)**
   ```bash
   # On Windows
   scripts\setup.bat
   
   # On macOS/Linux
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

4. **Manual setup alternative**
   ```bash
   npm run install:all
   cp server/.env.example server/.env
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

#### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017/relawand

### 🛠️ Development

#### Available Scripts

```bash
# Development
npm run dev          # Start both client and server
npm run client:dev   # Start only frontend
npm run server:dev   # Start only backend

# Production
npm run build        # Build both applications
npm run start        # Start production servers

# Database
npm run docker:up    # Start MongoDB and Redis
npm run docker:down  # Stop database services

# Utilities
npm run install:all  # Install all dependencies
npm run clean        # Clean all node_modules and build files
```

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensors` | Create new sensor data |
| GET | `/api/sensors` | Get sensor data (with filtering) |
| GET | `/api/sensors/devices` | Get list of all devices |
| GET | `/api/sensors/latest/:deviceId` | Get latest data for device |
| GET | `/api/health` | API health check |

#### Example API Usage

**Send sensor data from STM32:**
```bash
curl -X POST http://localhost:5000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "STM32_001",
    "temperature": 25.5,
    "humidity": 60.2,
    "voltage": 3.3,
    "current": 0.15
  }'
```

### 🔧 Configuration

#### Environment Variables

Copy `server/.env.example` to `server/.env` and configure:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/relawand
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 🗄️ MongoDB Setup Options

Choose one of the following MongoDB setup methods:

#### Option 1: MongoDB Atlas (Cloud - Recommended for beginners)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `MONGODB_URI` in `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/relawand?retryWrites=true&w=majority
   ```

#### Option 2: Local MongoDB Installation
1. **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. **macOS**: `brew install mongodb-community`
3. **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/administration/install-on-linux/)
4. Start MongoDB service:
   ```bash
   # Windows (as service, usually auto-starts)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option 3: Docker Setup (Optional)
```bash
# Start only MongoDB with Docker
docker-compose up -d mongodb

# View logs
docker-compose logs mongodb

# Stop services
docker-compose down
```

### 📱 STM32 Integration

To send data from your STM32 device, configure it to make HTTP POST requests to:
```
http://your-server-ip:5000/api/sensors
```

Example JSON payload:
```json
{
  "deviceId": "STM32_001",
  "temperature": 25.5,
  "humidity": 60.2,
  "pressure": 1013.25,
  "voltage": 3.3,
  "current": 0.15,
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456
  }
}
```

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### 📄 License

This project is licensed under the ISC License.
