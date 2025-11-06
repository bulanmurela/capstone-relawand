import SensorData from '../models/SensorData';
import Device, { IDevice } from '../models/Device';

export class DummyDataGenerator {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Generate random sensor value
  private randomValue(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate one reading for a device
  private async generateReading(device: IDevice) {
    const gas_ppm = this.randomValue(400, 1200);
    const reading = new SensorData({
      deviceId: device._id.toString(),
      timestamp: new Date(),
      temperature: this.randomValue(23, 30),
      humidity: this.randomValue(60, 85),
      gas_adc: this.randomValue(350, 500),
      gas_ppm: gas_ppm,
      voltage: Math.round((0.25 + Math.random() * 0.2) * 1000) / 1000, // 0.25-0.45V
      alarm: gas_ppm >= 1000 // Alarm if gas >= 1000 ppm (SIAGA threshold)
    });

    await reading.save();
    console.log(`📊 Generated reading for ${device.deviceName}`);
  }

  // Start generating dummy data every X minutes
  async start(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.log('⚠️  Dummy data generator already running');
      return;
    }

    console.log(`🚀 Starting dummy data generator (every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Generate immediately on start
    await this.generateBatch();

    // Then generate periodically
    this.interval = setInterval(async () => {
      await this.generateBatch();
    }, intervalMinutes * 60 * 1000);
  }

  // Generate readings for all devices
  private async generateBatch() {
    try {
      const devices = await Device.find({ isActive: true }) as IDevice[];
      
      if (devices.length === 0) {
        console.log('⚠️  No active devices found, skipping data generation');
        return;
      }

      for (const device of devices) {
        await this.generateReading(device); // ✅ Correct: pass device object
        }
      
      console.log(`✅ Generated ${devices.length} readings at ${new Date().toLocaleString('id-ID')}`);
    } catch (error) {
      console.error('❌ Error generating dummy data:', error);
    }
  }

  // Seed historical data for testing (24 hours of data)
  async seedHistoricalData(hours: number = 24) {
    try {
      const devices = await Device.find({ isActive: true }) as IDevice[];
      
      if (devices.length === 0) {
        console.log('⚠️  No active devices found');
        return;
      }

      console.log(`🌱 Seeding ${hours} hours of historical data...`);

      const now = new Date();
      const dataPoints = (hours * 60) / 30; // Every 30 minutes

      for (const device of devices) {
        const readings = [];

        for (let i = dataPoints - 1; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * 30 * 60 * 1000));
          const gas_ppm = this.randomValue(400, 1200);

          readings.push({
            deviceId: device._id.toString(),
            timestamp,
            temperature: this.randomValue(23, 30),
            humidity: this.randomValue(60, 85),
            gas_adc: this.randomValue(350, 500),
            gas_ppm: gas_ppm,
            voltage: Math.round((0.25 + Math.random() * 0.2) * 1000) / 1000,
            alarm: gas_ppm >= 1000 // Alarm if gas >= 1000 ppm (SIAGA threshold)
          });
        }

        await SensorData.insertMany(readings);
        console.log(`✅ Seeded ${readings.length} readings for ${device.deviceName}`);
      }

      console.log('🎉 Historical data seeding complete!');
    } catch (error) {
      console.error('❌ Error seeding data:', error);
    }
  }

  // Stop generator
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Dummy data generator stopped');
    }
  }
}