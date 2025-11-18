import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import SensorData from '../models/SensorData';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function cleanFakeSensorData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || '';
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!\n');

    // Count total fake sensor data
    const totalCount = await SensorData.countDocuments();
    console.log(`Total sensor data records before cleanup: ${totalCount}`);

    // Show breakdown by deviceId
    const uniqueDeviceIds = await SensorData.distinct('deviceId');
    console.log('\nRecords per deviceId:');
    for (const deviceId of uniqueDeviceIds) {
      const count = await SensorData.countDocuments({ deviceId });
      console.log(`  ${deviceId}: ${count} records`);
    }

    // Delete all sensor data (all are fake/dummy data)
    console.log('\n🗑️  Deleting all fake sensor data...');
    const deleteResult = await SensorData.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} fake sensor data records\n`);

    // Verify cleanup
    const remainingCount = await SensorData.countDocuments();
    console.log(`Remaining sensor data records: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('\n✅ Database cleaned successfully! Ready for real sensor data.');
    } else {
      console.log(`\n⚠️  Warning: ${remainingCount} records still remain.`);
    }

  } catch (error) {
    console.error('Error cleaning sensor data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
  }
}

// Run the function
cleanFakeSensorData();
