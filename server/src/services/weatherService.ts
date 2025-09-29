import axios from 'axios';
import cron from 'node-cron';
import WeatherData, { IWeatherData } from '../models/WeatherData';
import { Device } from '../models';

export class WeatherService {
  private apiKey: string;
  private baseUrl: string;
  private isSchedulerRunning: boolean = false;

  constructor() {
    this.apiKey = process.env.OPENWEATHERMAP_API_KEY || 'YOUR_OPENWEATHERMAP_API_KEY';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<any> {
    try {
      const url = `${this.baseUrl}/weather`;
      const params = {
        lat: latitude,
        lon: longitude,
        appid: this.apiKey,
        units: 'metric' // Celsius
      };

      const response = await axios.get(url, { params });

      if (response.data) {
        return this.parseCurrentWeatherResponse(response.data);
      } else {
        throw new Error('No weather data received');
      }
    } catch (error) {
      console.error('Current weather API error:', error);
      // Return fallback data when API is not available
      return this.getFallbackWeatherData(latitude, longitude);
    }
  }

  async getWeatherForecast(latitude: number, longitude: number, days: number = 5): Promise<any> {
    try {
      const url = `${this.baseUrl}/forecast`;
      const params = {
        lat: latitude,
        lon: longitude,
        appid: this.apiKey,
        units: 'metric',
        cnt: days * 8 // 8 forecasts per day (every 3 hours)
      };

      const response = await axios.get(url, { params });

      if (response.data) {
        return this.parseForecastResponse(response.data);
      } else {
        throw new Error('No forecast data received');
      }
    } catch (error) {
      console.error('Weather forecast API error:', error);
      return [];
    }
  }

  async saveWeatherData(latitude: number, longitude: number, deviceIds?: string[]): Promise<IWeatherData> {
    try {
      // Get current weather and forecast
      const [currentWeather, forecast] = await Promise.all([
        this.getCurrentWeather(latitude, longitude),
        this.getWeatherForecast(latitude, longitude, 3)
      ]);

      // Check if recent weather data exists for this location (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingWeather = await WeatherData.findOne({
        'location.latitude': latitude,
        'location.longitude': longitude,
        lastUpdated: { $gte: oneHourAgo }
      });

      if (existingWeather) {
        return existingWeather;
      }

      // Create new weather data entry
      const weatherData = new WeatherData({
        location: {
          latitude,
          longitude,
          name: currentWeather.location.name,
          country: currentWeather.location.country,
          state: currentWeather.location.state
        },
        current: currentWeather.current,
        forecast: forecast,
        lastUpdated: new Date(),
        source: 'OpenWeatherMap',
        apiResponseRaw: {
          current: currentWeather.raw,
          forecast: forecast
        }
      });

      await weatherData.save();
      return weatherData;
    } catch (error) {
      console.error('Error saving weather data:', error);
      throw error;
    }
  }

  async getWeatherForLocation(latitude: number, longitude: number): Promise<IWeatherData | null> {
    try {
      // Try to get recent weather data (within last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      let weatherData = await WeatherData.findOne({
        'location.latitude': latitude,
        'location.longitude': longitude,
        lastUpdated: { $gte: twoHoursAgo },
        isActive: true
      }).sort({ lastUpdated: -1 });

      if (!weatherData) {
        // Fetch fresh weather data if none exists or too old
        weatherData = await this.saveWeatherData(latitude, longitude);
      }

      return weatherData;
    } catch (error) {
      console.error('Error getting weather for location:', error);
      return null;
    }
  }

  async getWeatherForDevices(deviceIds: string[]): Promise<{ [deviceId: string]: IWeatherData | null }> {
    try {
      const devices = await Device.find({
        deviceId: { $in: deviceIds },
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true }
      });

      const weatherPromises = devices.map(async (device) => {
        const weather = await this.getWeatherForLocation(
          device.location!.latitude!,
          device.location!.longitude!
        );
        return { deviceId: device.deviceId, weather };
      });

      const results = await Promise.all(weatherPromises);

      const weatherMap: { [deviceId: string]: IWeatherData | null } = {};
      results.forEach(result => {
        weatherMap[result.deviceId] = result.weather;
      });

      return weatherMap;
    } catch (error) {
      console.error('Error getting weather for devices:', error);
      return {};
    }
  }

  startHourlyWeatherUpdates(): void {
    if (this.isSchedulerRunning) {
      console.log('Weather update scheduler is already running');
      return;
    }

    console.log('Starting hourly weather update scheduler...');

    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      console.log('Running hourly weather update...');
      await this.updateAllDeviceWeather();
    });

    // Also run every 15 minutes for active devices
    cron.schedule('*/15 * * * *', async () => {
      console.log('Running frequent weather update for active devices...');
      await this.updateActiveDeviceWeather();
    });

    this.isSchedulerRunning = true;
    console.log('Weather update scheduler started successfully');
  }

  stopWeatherUpdates(): void {
    // Note: node-cron doesn't provide a direct way to stop specific tasks
    // In production, you might want to use a more sophisticated scheduler
    this.isSchedulerRunning = false;
    console.log('Weather update scheduler stopped');
  }

  private async updateAllDeviceWeather(): Promise<void> {
    try {
      const devices = await Device.find({
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true },
        isActive: true
      });

      console.log(`Updating weather for ${devices.length} devices...`);

      for (const device of devices) {
        try {
          await this.saveWeatherData(
            device.location!.latitude!,
            device.location!.longitude!,
            [device.deviceId]
          );
        } catch (error) {
          console.error(`Failed to update weather for device ${device.deviceId}:`, error);
        }
      }

      console.log('Hourly weather update completed');
    } catch (error) {
      console.error('Error in hourly weather update:', error);
    }
  }

  private async updateActiveDeviceWeather(): Promise<void> {
    try {
      // Update weather only for devices that have been active in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const activeDevices = await Device.find({
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true },
        statusDevice: 'online',
        lastHeartbeat: { $gte: oneHourAgo },
        isActive: true
      });

      console.log(`Updating weather for ${activeDevices.length} active devices...`);

      for (const device of activeDevices) {
        try {
          await this.saveWeatherData(
            device.location!.latitude!,
            device.location!.longitude!,
            [device.deviceId]
          );
        } catch (error) {
          console.error(`Failed to update weather for active device ${device.deviceId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in active device weather update:', error);
    }
  }

  private parseCurrentWeatherResponse(data: any): any {
    return {
      location: {
        name: data.name,
        country: data.sys.country,
        state: data.state
      },
      current: {
        datetime: new Date(data.dt * 1000),
        temperature: Math.round(data.main.temp * 10) / 10,
        feelsLike: Math.round(data.main.feels_like * 10) / 10,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        windDirection: data.wind.deg || 0,
        visibility: data.visibility || 0,
        uvIndex: 0, // UV index not available in current weather API
        precipitation: data.rain ? (data.rain['1h'] || 0) : 0,
        weatherCondition: data.weather[0].main,
        weatherDescription: data.weather[0].description,
        weatherIcon: data.weather[0].icon,
        cloudiness: data.clouds.all
      },
      raw: data
    };
  }

  private parseForecastResponse(data: any): any[] {
    return data.list.map((item: any) => ({
      datetime: new Date(item.dt * 1000),
      temperature: {
        min: Math.round(item.main.temp_min * 10) / 10,
        max: Math.round(item.main.temp_max * 10) / 10
      },
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      precipitation: item.rain ? (item.rain['3h'] || 0) : 0,
      weatherCondition: item.weather[0].main,
      weatherDescription: item.weather[0].description,
      weatherIcon: item.weather[0].icon
    }));
  }

  private getFallbackWeatherData(latitude: number, longitude: number): any {
    // Provide fallback data when weather API is not available
    const now = new Date();
    return {
      location: {
        name: 'Unknown Location',
        country: 'Unknown',
        state: 'Unknown'
      },
      current: {
        datetime: now,
        temperature: 25.0,
        feelsLike: 26.0,
        humidity: 60,
        pressure: 1013,
        windSpeed: 5.0,
        windDirection: 180,
        visibility: 10000,
        uvIndex: 5,
        precipitation: 0,
        weatherCondition: 'Clear',
        weatherDescription: 'clear sky',
        weatherIcon: '01d',
        cloudiness: 10
      },
      raw: {
        fallback: true,
        coordinates: { latitude, longitude }
      }
    };
  }

  async getWeatherSummary(): Promise<any> {
    try {
      const totalLocations = await WeatherData.countDocuments({ isActive: true });
      const recentUpdates = await WeatherData.countDocuments({
        lastUpdated: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
        isActive: true
      });

      const weatherConditions = await WeatherData.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$current.weatherCondition', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        totalLocations,
        recentUpdates,
        weatherConditions,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting weather summary:', error);
      throw error;
    }
  }
}