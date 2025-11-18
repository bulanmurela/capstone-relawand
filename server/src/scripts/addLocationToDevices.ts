import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Device from '../models/Device';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function addLocationToDevices() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!\n');

    // Find devices without location data
    const devicesWithoutLocation = await Device.find({
      $or: [
        { 'location.latitude': { $exists: false } },
        { 'location.longitude': { $exists: false } },
        { 'location.latitude': null },
        { 'location.longitude': null }
      ]
    });

    console.log(`Found ${devicesWithoutLocation.length} devices without location data\n`);

    if (devicesWithoutLocation.length === 0) {
      console.log('All devices already have location data!');
      return;
    }

    // Add locations to devices (spreading them around Yogyakarta)
    // Base location: -7.8257448, 110.6734842
    const locations = [
      { latitude: -7.8257448, longitude: 110.6734842, address: 'Sleman, Yogyakarta' },
      { latitude: -7.8300000, longitude: 110.6800000, address: 'Caturtunggal, Depok, Sleman' },
      { latitude: -7.8200000, longitude: 110.6700000, address: 'Condongcatur, Depok, Sleman' },
      { latitude: -7.8350000, longitude: 110.6750000, address: 'Maguwoharjo, Depok, Sleman' },
    ];

    for (let i = 0; i < devicesWithoutLocation.length; i++) {
      const device = devicesWithoutLocation[i];
      const location = locations[i % locations.length];

      await Device.findByIdAndUpdate(device._id, {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        }
      });

      console.log(`✓ Updated ${device.deviceName}:`);
      console.log(`  Location: ${location.latitude}, ${location.longitude}`);
      console.log(`  Address: ${location.address}\n`);
    }

    console.log('All devices updated successfully!');

    // Display all devices with locations
    const allDevices = await Device.find().lean();
    console.log('\nAll devices with locations:');
    allDevices.forEach((device: any, index) => {
      console.log(`${index + 1}. ${device.deviceName}`);
      console.log(`   Location: ${device.location?.latitude || 'N/A'}, ${device.location?.longitude || 'N/A'}`);
      console.log(`   Address: ${device.location?.address || 'N/A'}\n`);
    });

  } catch (error) {
    console.error('Error updating devices:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the function
addLocationToDevices();
