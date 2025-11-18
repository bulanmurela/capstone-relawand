#!/usr/bin/env ts-node

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Device from '../models/Device';
import SensorData from '../models/SensorData';
import Alert from '../models/Alert';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

async function createDemoData() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║          Create Demo Data Script                          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Create demo devices
    console.log('Creating demo devices...');

    const demoDevices = [
      {
        deviceId: 'DEMO-001',
        deviceName: 'Demo Sensor Gunung Merapi',
        deviceType: 'STM32',
        location: {
          latitude: -7.5407,
          longitude: 110.4458,
          address: 'Gunung Merapi, Yogyakarta'
        },
        statusDevice: 'online',
        lastHeartbeat: new Date(),
        isActive: true,
        isDemo: true
      },
      {
        deviceId: 'DEMO-002',
        deviceName: 'Demo Sensor Gunung Kelud',
        deviceType: 'STM32',
        location: {
          latitude: -7.9307,
          longitude: 112.3083,
          address: 'Gunung Kelud, Kediri'
        },
        statusDevice: 'online',
        lastHeartbeat: new Date(),
        isActive: true,
        isDemo: true
      },
      {
        deviceId: 'DEMO-003',
        deviceName: 'Demo Sensor Gunung Semeru',
        deviceType: 'STM32',
        location: {
          latitude: -8.1081,
          longitude: 112.9225,
          address: 'Gunung Semeru, Lumajang'
        },
        statusDevice: 'offline',
        lastHeartbeat: new Date(Date.now() - 3600000), // 1 hour ago
        isActive: true,
        isDemo: true
      }
    ];

    // Delete existing demo devices
    await Device.deleteMany({ isDemo: true });
    console.log('Deleted existing demo devices\n');

    // Insert new demo devices
    const insertedDevices = await Device.insertMany(demoDevices);
    console.log(`✅ Created ${insertedDevices.length} demo devices\n`);

    // Generate demo sensor data for the past 7 days
    console.log('Generating demo sensor data...');
    const demoSensorData = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Generate data for DEMO-001 and DEMO-002 (online devices)
    for (const deviceId of ['DEMO-001', 'DEMO-002']) {
      // Generate data every 30 minutes for 7 days
      for (let time = sevenDaysAgo.getTime(); time <= now.getTime(); time += 30 * 60 * 1000) {
        const timestamp = new Date(time);

        // Create realistic sensor data with some variation
        const baseTemp = deviceId === 'DEMO-001' ? 28 : 27;
        const baseHumidity = deviceId === 'DEMO-001' ? 55 : 60;
        const baseGas = deviceId === 'DEMO-001' ? 1200 : 1100;

        const tempVariation = (Math.random() - 0.5) * 4;
        const humidityVariation = (Math.random() - 0.5) * 10;
        const gasVariation = (Math.random() - 0.5) * 400;

        const temperature = parseFloat((baseTemp + tempVariation).toFixed(1));
        const humidity = parseFloat((baseHumidity + humidityVariation).toFixed(1));
        const gas_ppm = Math.round(baseGas + gasVariation);
        const gas_adc = Math.round(gas_ppm * 0.4);
        const voltage = parseFloat((gas_adc / 1241).toFixed(3));
        const alarm = gas_ppm > 1500;

        demoSensorData.push({
          deviceId,
          timestamp,
          temperature,
          humidity,
          gas_adc,
          gas_ppm,
          voltage,
          alarm,
          isDemo: true
        });
      }
    }

    // Delete existing demo sensor data
    await SensorData.deleteMany({ isDemo: true });
    console.log('Deleted existing demo sensor data\n');

    // Insert demo sensor data in batches
    const batchSize = 1000;
    for (let i = 0; i < demoSensorData.length; i += batchSize) {
      const batch = demoSensorData.slice(i, i + batchSize);
      await SensorData.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(demoSensorData.length / batchSize)}`);
    }

    console.log(`\n✅ Created ${demoSensorData.length} demo sensor data records\n`);

    // Create some demo alerts
    console.log('Creating demo alerts...');
    const demoAlerts = [];

    // Find demo devices by deviceId
    const demo001 = await Device.findOne({ deviceId: 'DEMO-001' });
    const demo002 = await Device.findOne({ deviceId: 'DEMO-002' });

    // Create alerts for the past week
    const alertDates = [
      new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    ];

    for (const alertDate of alertDates) {
      demoAlerts.push({
        deviceId: demo001!._id,
        deviceName: 'Demo Sensor Gunung Merapi',
        level: 'SIAGA',
        temperature: 30 + Math.random() * 2,
        humidity: 50 + Math.random() * 5,
        gasConcentration: 1200 + Math.random() * 300,
        timestamp: alertDate,
        isDemo: true
      });
    }

    // Add one DARURAT alert
    demoAlerts.push({
      deviceId: demo002!._id,
      deviceName: 'Demo Sensor Gunung Kelud',
      level: 'DARURAT',
      temperature: 32,
      humidity: 45,
      gasConcentration: 1800,
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isDemo: true
    });

    // Delete existing demo alerts
    await Alert.deleteMany({ isDemo: true });
    console.log('Deleted existing demo alerts\n');

    // Insert demo alerts
    await Alert.insertMany(demoAlerts);
    console.log(`✅ Created ${demoAlerts.length} demo alerts\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('Demo Data Summary:');
    console.log(`  - Devices: ${insertedDevices.length}`);
    console.log(`  - Sensor Data: ${demoSensorData.length}`);
    console.log(`  - Alerts: ${demoAlerts.length}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('✅ Demo data created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

createDemoData();
