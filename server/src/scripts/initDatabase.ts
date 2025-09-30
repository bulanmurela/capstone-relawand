import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Device, SensorData, ImageCapture, AlertLog, WeatherData, LocationData } from '../models';

dotenv.config();

const initDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/relawand';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    await Device.deleteMany({});
    await SensorData.deleteMany({});
    await ImageCapture.deleteMany({});
    await AlertLog.deleteMany({});
    await WeatherData.deleteMany({});
    await LocationData.deleteMany({});
    console.log('🧹 Cleared existing data');

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@relawand.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'RelaWand',
      role: 'admin'
    });

    // const normalUser = await User.create({
    //   username: 'user1',
    //   email: 'user1@relawand.com',
    //   password: 'user123',
    //   firstName: 'John',
    //   lastName: 'Doe',
    //   role: 'user'
    // });

    console.log('👤 Created sample users');

    const device1 = await Device.create({
      deviceId: 'STM32_001',
      deviceName: 'Forest Monitor A1',
      deviceType: 'STM32',
      location: {
        latitude: -6.2088,
        longitude: 106.8456,
        address: 'Jakarta Forest Reserve Area A1'
      },
      statusDevice: 'online',
      lastHeartbeat: new Date(),
      firmwareVersion: '1.2.3',
      batteryLevel: 85,
      signalStrength: -65,
      userId: adminUser._id
    });

    const device2 = await Device.create({
      deviceId: 'STM32_002',
      deviceName: 'Forest Monitor B2',
      deviceType: 'STM32',
      location: {
        latitude: -6.2100,
        longitude: 106.8470,
        address: 'Jakarta Forest Reserve Area B2'
      },
      statusDevice: 'offline',
      lastHeartbeat: new Date(Date.now() - 30 * 60 * 1000),
      firmwareVersion: '1.2.2',
      batteryLevel: 45,
      signalStrength: -75,
      userId: adminUser._id
    });

    const device3 = await Device.create({
      deviceId: 'STM32_003',
      deviceName: 'Forest Monitor C3',
      deviceType: 'STM32',
      location: {
        latitude: -6.2120,
        longitude: 106.8490,
        address: 'Jakarta Forest Reserve Area C3'
      },
      statusDevice: 'error',
      lastHeartbeat: new Date(Date.now() - 60 * 60 * 1000),
      firmwareVersion: '1.2.1',
      batteryLevel: 20,
      signalStrength: -85,
      userId: adminUser._id
    });

    console.log('📱 Created sample devices');

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    await SensorData.create({
      deviceId: 'STM32_001',
      timestamp: now,
      temperature: 28.5,
      humidity: 65.2,
      pressure: 1013.25,
      voltage: 3.3,
      current: 0.15,
      dht: { temperature: 28.5, humidity: 65.2 },
      mq: { gasLevel: 150, ppm: 12.5 },
      location: {
        latitude: -6.2088,
        longitude: 106.8456
      },
      metadata: {
        firmwareVersion: '1.2.3',
        batteryLevel: 85,
        signalStrength: -65
      },
      userId: adminUser._id
    });

    await SensorData.create({
      deviceId: 'STM32_001',
      timestamp: oneHourAgo,
      temperature: 27.8,
      humidity: 68.1,
      pressure: 1012.8,
      voltage: 3.2,
      current: 0.14,
      dht: { temperature: 27.8, humidity: 68.1 },
      mq: { gasLevel: 145, ppm: 11.8 },
      userId: adminUser._id
    });

    await SensorData.create({
      deviceId: 'STM32_002',
      timestamp: twoHoursAgo,
      temperature: 35.2,
      humidity: 45.3,
      pressure: 1011.5,
      voltage: 3.1,
      current: 0.12,
      dht: { temperature: 35.2, humidity: 45.3 },
      mq: { gasLevel: 280, ppm: 25.6 },
      userId: adminUser._id
    });

    console.log('📊 Created sample sensor data');

    const alertLog1 = await AlertLog.create({
      deviceId: 'STM32_001',
      alertType: 'Temperature Warning',
      status: 'SIAGA',
      message: 'Temperature above normal threshold detected',
      sensorData: {
        temperature: 35.2,
        humidity: 45.3,
        dht: { temperature: 35.2, humidity: 45.3 },
        mq: { gasLevel: 180, ppm: 18.5 }
      },
      thresholdValues: {
        temperatureThreshold: 35.0,
        humidityThreshold: 50.0
      },
      alertTime: oneHourAgo,
      severity: 6,
      userId: adminUser._id
    });

    const alertLog2 = await AlertLog.create({
      deviceId: 'STM32_002',
      alertType: 'Fire Risk',
      status: 'DARURAT',
      message: 'Critical fire risk detected - immediate action required',
      sensorData: {
        temperature: 42.5,
        humidity: 30.1,
        dht: { temperature: 42.5, humidity: 30.1 },
        mq: { gasLevel: 350, ppm: 35.8 }
      },
      thresholdValues: {
        temperatureThreshold: 40.0,
        humidityThreshold: 35.0,
        mqThreshold: 300
      },
      alertTime: twoHoursAgo,
      severity: 9,
      userId: adminUser._id
    });

    console.log('🚨 Created sample alert logs');

    await ImageCapture.create({
      deviceId: 'STM32_001',
      imageUrl: '/uploads/images/STM32_001_manual_20240929_120000.jpg',
      imagePath: '/uploads/images/',
      fileName: 'STM32_001_manual_20240929_120000.jpg',
      fileSize: 2048576,
      mimeType: 'image/jpeg',
      triggeredBy: 'manual',
      captureTime: now,
      userId: adminUser._id,
      metadata: {
        resolution: '1920x1080',
        quality: 85
      }
    });

    await ImageCapture.create({
      deviceId: 'STM32_002',
      imageUrl: '/uploads/images/STM32_002_alert_20240929_100000.jpg',
      imagePath: '/uploads/images/',
      fileName: 'STM32_002_alert_20240929_100000.jpg',
      fileSize: 1843200,
      mimeType: 'image/jpeg',
      triggeredBy: 'alert',
      captureTime: twoHoursAgo,
      alertId: alertLog2._id,
      userId: adminUser._id,
      metadata: {
        resolution: '1920x1080',
        quality: 80
      }
    });

    await ImageCapture.create({
      deviceId: 'STM32_001',
      imageUrl: '/uploads/images/STM32_001_scheduled_20240929_080000.jpg',
      imagePath: '/uploads/images/',
      fileName: 'STM32_001_scheduled_20240929_080000.jpg',
      fileSize: 1920000,
      mimeType: 'image/jpeg',
      triggeredBy: 'scheduled',
      captureTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      scheduledTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      userId: adminUser._id,
      metadata: {
        resolution: '1920x1080',
        quality: 75
      }
    });

    console.log('📸 Created sample image capture records');

    // Create sample weather data
    const weatherData1 = await WeatherData.create({
      location: {
        latitude: -6.2088,
        longitude: 106.8456,
        name: 'Jakarta',
        country: 'Indonesia',
        state: 'DKI Jakarta'
      },
      current: {
        datetime: now,
        temperature: 28.5,
        feelsLike: 31.2,
        humidity: 75,
        pressure: 1012,
        windSpeed: 8.5,
        windDirection: 180,
        visibility: 10000,
        uvIndex: 6,
        precipitation: 0,
        weatherCondition: 'Partly Cloudy',
        weatherDescription: 'partly cloudy',
        weatherIcon: '02d',
        cloudiness: 40
      },
      forecast: [
        {
          datetime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
          temperature: { min: 26.0, max: 32.0 },
          humidity: 70,
          windSpeed: 7.2,
          precipitation: 0.5,
          weatherCondition: 'Rain',
          weatherDescription: 'light rain',
          weatherIcon: '10d'
        },
        {
          datetime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
          temperature: { min: 24.0, max: 29.0 },
          humidity: 85,
          windSpeed: 12.1,
          precipitation: 2.3,
          weatherCondition: 'Rain',
          weatherDescription: 'moderate rain',
          weatherIcon: '10d'
        }
      ],
      lastUpdated: now,
      source: 'Sample Data'
    });

    const weatherData2 = await WeatherData.create({
      location: {
        latitude: -6.2100,
        longitude: 106.8470,
        name: 'Jakarta Forest Area B2',
        country: 'Indonesia',
        state: 'DKI Jakarta'
      },
      current: {
        datetime: now,
        temperature: 35.2,
        feelsLike: 38.5,
        humidity: 45,
        pressure: 1010,
        windSpeed: 12.5,
        windDirection: 225,
        visibility: 8000,
        uvIndex: 8,
        precipitation: 0,
        weatherCondition: 'Clear',
        weatherDescription: 'clear sky',
        weatherIcon: '01d',
        cloudiness: 10
      },
      lastUpdated: now,
      source: 'Sample Data'
    });

    console.log('🌤️ Created sample weather data');

    // Create sample location data
    const locationData1 = await LocationData.create({
      coordinates: {
        latitude: -6.2088,
        longitude: 106.8456
      },
      address: {
        formatted: 'Jakarta Forest Reserve Area A1, Jakarta, Indonesia',
        street: 'Forest Reserve Road',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        postalCode: '10340'
      },
      geocoding: {
        source: 'Sample Data',
        accuracy: 'ROOFTOP'
      },
      mapData: {
        zoom: 15,
        mapType: 'satellite'
      },
      metadata: {
        timezone: 'Asia/Jakarta',
        elevation: 8,
        nearbyLandmarks: ['Monas', 'National Museum', 'Merdeka Square']
      },
      deviceIds: ['STM32_001'],
      lastUpdated: now
    });

    const locationData2 = await LocationData.create({
      coordinates: {
        latitude: -6.2100,
        longitude: 106.8470
      },
      address: {
        formatted: 'Jakarta Forest Reserve Area B2, Jakarta, Indonesia',
        street: 'Forest Monitoring Station Road',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        postalCode: '10341'
      },
      geocoding: {
        source: 'Sample Data',
        accuracy: 'ROOFTOP'
      },
      mapData: {
        zoom: 15,
        mapType: 'hybrid'
      },
      metadata: {
        timezone: 'Asia/Jakarta',
        elevation: 12,
        nearbyLandmarks: ['Jakarta Bay', 'Ancol Beach', 'Dunia Fantasi']
      },
      deviceIds: ['STM32_002'],
      lastUpdated: now
    });

    const locationData3 = await LocationData.create({
      coordinates: {
        latitude: -6.2120,
        longitude: 106.8490
      },
      address: {
        formatted: 'Jakarta Forest Reserve Area C3, Jakarta, Indonesia',
        street: 'Conservation Area Access Road',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        country: 'Indonesia',
        postalCode: '10342'
      },
      geocoding: {
        source: 'Sample Data',
        accuracy: 'ROOFTOP'
      },
      mapData: {
        zoom: 15,
        mapType: 'terrain'
      },
      metadata: {
        timezone: 'Asia/Jakarta',
        elevation: 15,
        nearbyLandmarks: ['Ragunan Zoo', 'Kemang Village', 'Blok M Square']
      },
      deviceIds: ['STM32_003'],
      lastUpdated: now
    });

    console.log('📍 Created sample location data');

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Sample data created:');
    console.log('  - 2 Users (admin, user1)');
    console.log('  - 3 Devices (STM32_001, STM32_002, STM32_003)');
    console.log('  - 3 Sensor data entries');
    console.log('  - 2 Alert logs');
    console.log('  - 3 Image capture records');
    console.log('  - 2 Weather data entries');
    console.log('  - 3 Location data entries');
    console.log('\n🔐 Default credentials:');
    console.log('  - Admin: admin@relawand.com / admin123');
    console.log('  - User:  user1@relawand.com / user123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

if (require.main === module) {
  initDatabase();
}

export default initDatabase;