import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Device from '../models/Device';
import SensorData from '../models/SensorData';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function removeUnwantedDevices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!\n');

    // Device IDs to remove (keeping only RelaWand 1 with deviceId: DEVICE-1762166351045)
    const devicesToRemove = [
      'STM32-001',
      'STM32-002',
      '6908864feefad0e348b4f6ee'
    ];

    console.log('Devices to remove:', devicesToRemove);
    console.log('\n');

    // Find and display the devices before deletion
    const devices = await Device.find({ deviceId: { $in: devicesToRemove } });
    console.log('Found devices to delete:');
    devices.forEach((device: any) => {
      console.log(`  - ${device.deviceName} (ID: ${device.deviceId})`);
    });
    console.log('\n');

    // Delete sensor data associated with these devices
    console.log('Deleting sensor data for these devices...');
    const sensorDataResult = await SensorData.deleteMany({
      deviceId: { $in: devicesToRemove }
    });
    console.log(`✓ Deleted ${sensorDataResult.deletedCount} sensor data records\n`);

    // Delete the devices themselves
    console.log('Deleting devices...');
    const deviceResult = await Device.deleteMany({
      deviceId: { $in: devicesToRemove }
    });
    console.log(`✓ Deleted ${deviceResult.deletedCount} devices\n`);

    // Show remaining devices
    const remainingDevices = await Device.find().lean();
    console.log('Remaining devices in database:');
    if (remainingDevices.length === 0) {
      console.log('  No devices remaining!');
    } else {
      remainingDevices.forEach((device: any, index) => {
        console.log(`  ${index + 1}. ${device.deviceName} (ID: ${device.deviceId})`);
        console.log(`     Status: ${device.statusDevice}, Active: ${device.isActive}`);
        if (device.location) {
          console.log(`     Location: ${device.location.latitude}, ${device.location.longitude}`);
        }
      });
    }
    console.log(`\nTotal remaining devices: ${remainingDevices.length}`);

    // Count remaining sensor data
    const remainingSensorData = await SensorData.countDocuments();
    console.log(`Total remaining sensor data records: ${remainingSensorData}`);

  } catch (error) {
    console.error('Error removing devices:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

// Run the function
removeUnwantedDevices();
