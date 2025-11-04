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
    const reading = new SensorData({
      deviceId: device._id.toString(),
      timestamp: new Date(),
      temperature: this.randomValue(25, 35),
      humidity: this.randomValue(60, 90),
      co: this.randomValue(50, 150),
      co2: this.randomValue(400, 800),
      lpg: this.randomValue(20, 100)
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

          readings.push({
            deviceId: device._id.toString(),
            timestamp,
            temperature: this.randomValue(25, 35),
            humidity: this.randomValue(60, 90),
            co: this.randomValue(50, 150),
            co2: this.randomValue(400, 800),
            lpg: this.randomValue(20, 100)
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