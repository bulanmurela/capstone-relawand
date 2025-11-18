import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Device from '../models/Device';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function countSensors() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!\n');

    // Count total devices
    const totalDevices = await Device.countDocuments();
    console.log(`Total devices/sensors: ${totalDevices}`);

    // Count by status
    const onlineDevices = await Device.countDocuments({ statusDevice: 'online' });
    const offlineDevices = await Device.countDocuments({ statusDevice: 'offline' });
    const errorDevices = await Device.countDocuments({ statusDevice: 'error' });

    console.log('\nBreakdown by status:');
    console.log(`  - Online: ${onlineDevices}`);
    console.log(`  - Offline: ${offlineDevices}`);
    console.log(`  - Error: ${errorDevices}`);

    // Count active vs inactive
    const activeDevices = await Device.countDocuments({ isActive: true });
    const inactiveDevices = await Device.countDocuments({ isActive: false });

    console.log('\nBreakdown by active status:');
    console.log(`  - Active: ${activeDevices}`);
    console.log(`  - Inactive: ${inactiveDevices}`);

    // List all devices
    const devices = await Device.find().lean();

    if (devices.length > 0) {
      console.log('\nAll devices:');
      devices.forEach((device: any, index) => {
        console.log(`  ${index + 1}. ${device.deviceName || 'Unnamed'} (ID: ${device.deviceId || device._id})`);
        console.log(`     Type: ${device.deviceType}, Status: ${device.statusDevice}, Active: ${device.isActive}`);
      });
    }

  } catch (error) {
    console.error('Error counting sensors:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

// Run the function
countSensors();
