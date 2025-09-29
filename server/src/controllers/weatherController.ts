import { Request, Response } from 'express';
import { WeatherService } from '../services/weatherService';
import WeatherData, { IWeatherData } from '../models/WeatherData';

const weatherService = new WeatherService();

export const getCurrentWeatherByCoordinates = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.params;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    const weatherData = await weatherService.getWeatherForLocation(lat, lng);

    if (!weatherData) {
      return res.status(404).json({
        success: false,
        message: 'Weather data not available for this location'
      });
    }

    res.json({
      success: true,
      data: weatherData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data',
      error: error.message
    });
  }
};

export const getWeatherByDeviceId = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const weatherData = await weatherService.getWeatherForDevices([deviceId]);

    if (!weatherData[deviceId]) {
      return res.status(404).json({
        success: false,
        message: 'Weather data not available for this device'
      });
    }

    res.json({
      success: true,
      data: weatherData[deviceId]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data for device',
      error: error.message
    });
  }
};

export const getWeatherForMultipleDevices = async (req: Request, res: Response) => {
  try {
    const { deviceIds } = req.body;

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Device IDs array is required'
      });
    }

    const weatherData = await weatherService.getWeatherForDevices(deviceIds);

    res.json({
      success: true,
      data: weatherData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data for devices',
      error: error.message
    });
  }
};

export const refreshWeatherData = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const weatherData = await weatherService.saveWeatherData(latitude, longitude);

    res.json({
      success: true,
      data: weatherData,
      message: 'Weather data refreshed successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing weather data',
      error: error.message
    });
  }
};

export const getWeatherHistory = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.params;
    const { startDate, endDate, limit = 100, page = 1 } = req.query;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    const query: any = {
      'location.latitude': lat,
      'location.longitude': lng,
      isActive: true
    };

    if (startDate || endDate) {
      query.lastUpdated = {};
      if (startDate) query.lastUpdated.$gte = new Date(startDate as string);
      if (endDate) query.lastUpdated.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const weatherHistory = await WeatherData
      .find(query)
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await WeatherData.countDocuments(query);

    res.json({
      success: true,
      data: weatherHistory,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather history',
      error: error.message
    });
  }
};

export const getWeatherSummary = async (req: Request, res: Response) => {
  try {
    const summary = await weatherService.getWeatherSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weather summary',
      error: error.message
    });
  }
};

export const deleteOldWeatherData = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const result = await WeatherData.deleteMany({
      lastUpdated: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} old weather records`,
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting old weather data',
      error: error.message
    });
  }
};

export const getWeatherAlerts = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.params;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    const weatherData = await weatherService.getWeatherForLocation(lat, lng);

    if (!weatherData) {
      return res.status(404).json({
        success: false,
        message: 'Weather data not available'
      });
    }

    // Generate weather-based alerts
    const alerts = [];
    const current = weatherData.current;

    // High temperature alert
    if (current.temperature >= 35) {
      alerts.push({
        type: 'high_temperature',
        severity: current.temperature >= 40 ? 'critical' : 'warning',
        message: `High temperature detected: ${current.temperature}°C`,
        value: current.temperature,
        threshold: 35
      });
    }

    // Low humidity alert
    if (current.humidity <= 30) {
      alerts.push({
        type: 'low_humidity',
        severity: current.humidity <= 20 ? 'critical' : 'warning',
        message: `Low humidity detected: ${current.humidity}%`,
        value: current.humidity,
        threshold: 30
      });
    }

    // High wind speed alert
    if (current.windSpeed >= 15) {
      alerts.push({
        type: 'high_wind',
        severity: current.windSpeed >= 25 ? 'critical' : 'warning',
        message: `High wind speed detected: ${current.windSpeed} m/s`,
        value: current.windSpeed,
        threshold: 15
      });
    }

    // Extreme weather conditions
    const extremeConditions = ['Thunderstorm', 'Snow', 'Tornado'];
    if (extremeConditions.includes(current.weatherCondition)) {
      alerts.push({
        type: 'extreme_weather',
        severity: 'critical',
        message: `Extreme weather condition: ${current.weatherDescription}`,
        value: current.weatherCondition,
        threshold: 'any'
      });
    }

    res.json({
      success: true,
      data: {
        location: weatherData.location,
        alerts,
        alertCount: alerts.length,
        lastUpdated: weatherData.lastUpdated
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating weather alerts',
      error: error.message
    });
  }
};

export const startWeatherScheduler = async (req: Request, res: Response) => {
  try {
    weatherService.startHourlyWeatherUpdates();

    res.json({
      success: true,
      message: 'Weather update scheduler started successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error starting weather scheduler',
      error: error.message
    });
  }
};

export const stopWeatherScheduler = async (req: Request, res: Response) => {
  try {
    weatherService.stopWeatherUpdates();

    res.json({
      success: true,
      message: 'Weather update scheduler stopped successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error stopping weather scheduler',
      error: error.message
    });
  }
};