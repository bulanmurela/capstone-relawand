#!/usr/bin/env ts-node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Device from '../models/Device';
import SensorData from '../models/SensorData';
import MqttLog from '../models/MqttLog';
import Alert from '../models/Alert';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

async function migrateData() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          Device Data Migration Script                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the devices
    const relawand1 = await Device.findOne({ deviceName: 'RelaWand 1' });
    const stm32Device = await Device.findOne({ deviceId: 'STM32-001' });

    if (!relawand1) {
      console.error('❌ RelaWand 1 device not found!');
      process.exit(1);
    }

    console.log('Found devices:');
    console.log(`  - RelaWand 1: deviceId = ${(relawand1 as any).deviceId}`);
    console.log(`  - STM32-001: ${stm32Device ? 'exists' : 'not found'}\n`);

    const oldDeviceId = (relawand1 as any).deviceId as string;
    const targetDeviceId = 'STM32-001';

    // Step 1: Count existing data
    console.log('Counting existing data...');
    const sensorCountOld = await SensorData.countDocuments({ deviceId: oldDeviceId });
    const sensorCountNew = await SensorData.countDocuments({ deviceId: targetDeviceId });
    const mqttLogsOld = await MqttLog.countDocuments({ deviceId: oldDeviceId });
    const mqttLogsNew = await MqttLog.countDocuments({ deviceId: targetDeviceId });
    const alertsOld = await Alert.countDocuments({ deviceId: relawand1._id });

    console.log(`  - SensorData with ${oldDeviceId}: ${sensorCountOld}`);
    console.log(`  - SensorData with ${targetDeviceId}: ${sensorCountNew}`);
    console.log(`  - MqttLogs with ${oldDeviceId}: ${mqttLogsOld}`);
    console.log(`  - MqttLogs with ${targetDeviceId}: ${mqttLogsNew}`);
    console.log(`  - Alerts for RelaWand 1: ${alertsOld}\n`);

    // Step 1: Delete the auto-created STM32-001 device first to avoid duplicate key error
    if (stm32Device) {
      console.log('Step 1: Deleting auto-created STM32-001 device to prevent duplicate...');
      await Device.deleteOne({ _id: stm32Device._id });
      console.log('✅ Deleted auto-created device\n');
    }

    // Step 2: Update RelaWand 1's deviceId
    console.log(`Step 2: Updating RelaWand 1 deviceId from ${oldDeviceId} to ${targetDeviceId}...`);
    (relawand1 as any).deviceId = targetDeviceId;
    await relawand1.save();
    console.log('✅ RelaWand 1 deviceId updated\n');

    // Step 3: Update old SensorData records to use new deviceId
    if (sensorCountOld > 0) {
      console.log(`Step 3: Migrating ${sensorCountOld} SensorData records...`);
      const sensorUpdateResult = await SensorData.updateMany(
        { deviceId: oldDeviceId },
        { $set: { deviceId: targetDeviceId } }
      );
      console.log(`✅ Updated ${sensorUpdateResult.modifiedCount} SensorData records\n`);
    }

    // Step 4: Update old MqttLog records
    if (mqttLogsOld > 0) {
      console.log(`Step 4: Migrating ${mqttLogsOld} MqttLog records...`);
      const mqttUpdateResult = await MqttLog.updateMany(
        { deviceId: oldDeviceId },
        { $set: { deviceId: targetDeviceId, deviceName: 'RelaWand 1' } }
      );
      console.log(`✅ Updated ${mqttUpdateResult.modifiedCount} MqttLog records\n`);
    }

    // Step 5: Update MqttLogs for STM32-001 to use correct device name
    if (mqttLogsNew > 0) {
      console.log(`Step 5: Updating ${mqttLogsNew} MqttLog records for STM32-001...`);
      const mqttUpdateResult = await MqttLog.updateMany(
        { deviceId: targetDeviceId, deviceName: { $ne: 'RelaWand 1' } },
        { $set: { deviceName: 'RelaWand 1' } }
      );
      console.log(`✅ Updated ${mqttUpdateResult.modifiedCount} MqttLog records\n`);
    }

    // Final count
    console.log('Final data count:');
    const finalSensorCount = await SensorData.countDocuments({ deviceId: targetDeviceId });
    const finalMqttCount = await MqttLog.countDocuments({ deviceId: targetDeviceId });
    console.log(`  - Total SensorData for ${targetDeviceId}: ${finalSensorCount}`);
    console.log(`  - Total MqttLogs for ${targetDeviceId}: ${finalMqttCount}`);

    console.log('\n✅ Migration completed successfully!');
    console.log(`\nRelaWand 1 now uses deviceId: ${targetDeviceId}`);
    console.log('All sensor data has been consolidated.\n');

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

migrateData();
