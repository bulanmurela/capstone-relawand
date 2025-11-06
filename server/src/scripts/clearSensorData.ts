#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import SensorData from '../models/SensorData';
import Alert from '../models/Alert';

dotenv.config();

async function clearSensorData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Count existing documents
    const sensorCount = await SensorData.countDocuments();
    const alertCount = await Alert.countDocuments();

    console.log('📊 Current data:');
    console.log(`   - Sensor data records: ${sensorCount}`);
    console.log(`   - Alert records: ${alertCount}\n`);

    if (sensorCount === 0 && alertCount === 0) {
      console.log('✨ Collections are already empty!');
      process.exit(0);
    }

    // Ask for confirmation
    console.log('⚠️  WARNING: This will delete all sensor data and alerts!');
    console.log('   This action cannot be undone.\n');

    // Clear sensor data
    console.log('🗑️  Deleting sensor data...');
    const sensorResult = await SensorData.deleteMany({});
    console.log(`✅ Deleted ${sensorResult.deletedCount} sensor data records`);

    // Clear alerts
    console.log('🗑️  Deleting alerts...');
    const alertResult = await Alert.deleteMany({});
    console.log(`✅ Deleted ${alertResult.deletedCount} alert records\n`);

    // Verify cleanup
    const newSensorCount = await SensorData.countDocuments();
    const newAlertCount = await Alert.countDocuments();

    console.log('📊 After cleanup:');
    console.log(`   - Sensor data records: ${newSensorCount}`);
    console.log(`   - Alert records: ${newAlertCount}\n`);

    console.log('✨ Database collections reset successfully!');
    console.log('🚀 Ready for fresh MQTT data collection.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing sensor data:', error);
    process.exit(1);
  }
}

clearSensorData();
