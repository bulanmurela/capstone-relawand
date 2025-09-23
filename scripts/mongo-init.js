// MongoDB initialization script
db = db.getSiblingDB('relawand');

// Create collections
db.createCollection('sensordatas');

// Create indexes for better performance
db.sensordatas.createIndex({ "deviceId": 1, "timestamp": -1 });
db.sensordatas.createIndex({ "timestamp": -1 });
db.sensordatas.createIndex({ "deviceId": 1 });

// Insert sample data for testing
db.sensordatas.insertMany([
  {
    deviceId: "STM32_001",
    timestamp: new Date(),
    temperature: 25.5,
    humidity: 60.2,
    pressure: 1013.25,
    light: 450,
    motion: false,
    voltage: 3.3,
    current: 0.15,
    power: 0.495,
    energy: 12.5,
    frequency: 50.0,
    powerFactor: 0.95,
    location: {
      latitude: -6.2088,
      longitude: 106.8456,
      altitude: 10
    },
    metadata: {
      firmwareVersion: "v1.0.0",
      batteryLevel: 85,
      signalStrength: -45
    }
  },
  {
    deviceId: "STM32_002",
    timestamp: new Date(),
    temperature: 22.1,
    humidity: 55.8,
    pressure: 1012.8,
    light: 380,
    motion: true,
    voltage: 3.2,
    current: 0.18,
    power: 0.576,
    energy: 15.2,
    frequency: 49.8,
    powerFactor: 0.92,
    location: {
      latitude: -6.2150,
      longitude: 106.8450,
      altitude: 15
    },
    metadata: {
      firmwareVersion: "v1.0.0",
      batteryLevel: 78,
      signalStrength: -52
    }
  }
]);

print('Database initialized with sample sensor data');