# RelaWand Database & Backend Setup

## Overview

This document provides a complete guide to set up the RelaWand IoT system database and backend according to the ERD specifications.

## Database Schema

The system includes the following collections:

### 1. Users Collection
- `username` (unique)
- `email` (unique)
- `password`
- `firstName`, `lastName`
- `role` (admin/user)
- `isActive`
- `lastLogin`

### 2. Devices Collection
- `deviceId` (unique)
- `deviceName`
- `deviceType`
- `location` (latitude, longitude, address)
- `statusDevice` (offline/online/error)
- `lastHeartbeat`
- `firmwareVersion`
- `batteryLevel`
- `signalStrength`
- `userId` (reference to Users)

### 3. Sensor Data Collection
- `deviceId`
- `timestamp`
- `temperature`, `humidity`, `pressure`
- `voltage`, `current`, `power`
- `dht` (DHT sensor data object)
- `mq` (MQ sensor data object)
- `location`
- `metadata`
- `userId` (reference to Users)

### 4. Image Captures Collection
- `deviceId`
- `imageUrl`, `imagePath`, `fileName`
- `triggeredBy` (manual/alert/scheduled)
- `captureTime`
- `scheduledTime`
- `alertId` (reference to AlertLog)
- `userId` (reference to Users)
- `metadata`

### 5. Alert Logs Collection
- `deviceId`
- `alertType`
- `status` (SIAGA/DARURAT)
- `message`
- `sensorData`
- `thresholdValues`
- `alertTime`
- `resolvedTime`
- `isResolved`
- `resolvedBy` (reference to Users)
- `severity` (1-10)
- `userId` (reference to Users)

## Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Database Configuration
```bash
# Interactive setup wizard
npm run setup-db

# Or manually copy and edit .env
cp .env.example .env
# Edit .env file with your MongoDB URI
```

### 3. Initialize Database with Sample Data
```bash
npm run init-db
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### User Management
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Device Management
- `POST /api/devices` - Create device
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `GET /api/devices/deviceId/:deviceId` - Get device by deviceId
- `PUT /api/devices/:id` - Update device
- `PATCH /api/devices/status/:deviceId` - Update device status
- `DELETE /api/devices/:id` - Delete device
- `GET /api/devices/summary/status` - Get device status summary

### Sensor Data
- `POST /api/sensors` - Create sensor data
- `GET /api/sensors` - Get sensor data (with filtering)
- `GET /api/sensors/latest/:deviceId` - Get latest data for device
- `GET /api/sensors/devices` - Get list of all devices

### Image Captures
- `POST /api/image-captures` - Create image capture record
- `GET /api/image-captures` - Get all image captures
- `GET /api/image-captures/:id` - Get image capture by ID
- `GET /api/image-captures/device/:deviceId` - Get captures for device
- `GET /api/image-captures/summary` - Get capture summary
- `PUT /api/image-captures/:id` - Update image capture
- `DELETE /api/image-captures/:id` - Delete image capture

### Alert Management
- `POST /api/alerts` - Create alert log
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `GET /api/alerts/active` - Get active alerts
- `GET /api/alerts/device/:deviceId` - Get alerts for device
- `GET /api/alerts/summary` - Get alert summary
- `PATCH /api/alerts/resolve/:id` - Resolve alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Hardware Integration
- `POST /api/hardware/register` - Register new device
- `POST /api/hardware/heartbeat/:deviceId` - Send device heartbeat
- `POST /api/hardware/sensor-data/:deviceId` - Send sensor data
- `POST /api/hardware/error/:deviceId` - Report device error
- `GET /api/hardware/config/:deviceId` - Get device configuration

## Sample Data

After running `npm run init-db`, the following sample data will be created:

### Users
- **Admin**: admin@relawand.com / admin123
- **User**: user1@relawand.com / user123

### Devices
- **STM32_001**: Forest Monitor A1 (online)
- **STM32_002**: Forest Monitor B2 (offline)
- **STM32_003**: Forest Monitor C3 (error)

### Sample sensor data, alerts, and image captures will also be created.

## Alert Thresholds

The system automatically creates alerts based on these thresholds:

### Temperature
- **SIAGA** (Warning): ≥ 35.0°C
- **DARURAT** (Critical): ≥ 40.0°C

### Humidity
- **SIAGA** (Warning): ≤ 35.0%
- **DARURAT** (Critical): ≤ 25.0%

### Gas Level (MQ Sensor)
- **SIAGA** (Warning): ≥ 250 ppm
- **DARURAT** (Critical): ≥ 300 ppm

## Hardware Integration

### STM32 Connection Example
```cpp
// Send sensor data
POST /api/hardware/sensor-data/STM32_001
{
  "temperature": 28.5,
  "humidity": 65.2,
  "dht": {"temperature": 28.5, "humidity": 65.2},
  "mq": {"gasLevel": 150, "ppm": 12.5},
  "batteryLevel": 85,
  "signalStrength": -65
}
```

### Testing Hardware API
```bash
# Test with Python script
cd hardware/test
python test_api.py

# Test with cURL
curl -X POST http://localhost:5000/api/hardware/sensor-data/STM32_001 \
  -H "Content-Type: application/json" \
  -d '{"temperature": 25.5, "humidity": 60.2}'
```

## MongoDB Configuration Options

### Option 1: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/relawand
```

### Option 2: MongoDB Atlas (Cloud)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/relawand?retryWrites=true&w=majority
```

### Option 3: MongoDB with Authentication
```env
MONGODB_URI=mongodb://username:password@localhost:27017/relawand?authSource=admin
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Setup database
npm run setup-db

# Initialize with sample data
npm run init-db

# Seed database (alias for init-db)
npm run db:seed
```

## Testing API

You can test the API using:
1. **Postman** - Import the API endpoints
2. **cURL** - Command-line testing
3. **Python script** - `hardware/test/test_api.py`
4. **Web browser** - GET endpoints

## Security Notes

1. Change default passwords in production
2. Use HTTPS in production environments
3. Implement proper authentication/authorization
4. Validate all input data
5. Monitor for suspicious device behavior
6. Use environment variables for sensitive data

## Troubleshooting

### Common Issues
1. **MongoDB connection error**: Check MongoDB URI and service status
2. **Port 5000 already in use**: Change PORT in .env file
3. **CORS errors**: Update CLIENT_URL in .env file
4. **Device not found**: Register device first using hardware API

### Logs
The server logs all API requests and database operations. Check console output for debugging information.

## Next Steps

1. Set up MongoDB (local or Atlas)
2. Run the setup scripts
3. Test API endpoints
4. Connect your STM32 hardware
5. Build the frontend dashboard
6. Deploy to production environment