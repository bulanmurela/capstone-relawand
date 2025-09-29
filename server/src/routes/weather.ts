import express from 'express';
import {
  getCurrentWeatherByCoordinates,
  getWeatherByDeviceId,
  getWeatherForMultipleDevices,
  refreshWeatherData,
  getWeatherHistory,
  getWeatherSummary,
  deleteOldWeatherData,
  getWeatherAlerts,
  startWeatherScheduler,
  stopWeatherScheduler
} from '../controllers/weatherController';

const router = express.Router();

// Get current weather by coordinates
router.get('/current/:latitude/:longitude', getCurrentWeatherByCoordinates);

// Get weather for specific device
router.get('/device/:deviceId', getWeatherByDeviceId);

// Get weather for multiple devices
router.post('/devices', getWeatherForMultipleDevices);

// Refresh weather data for coordinates
router.post('/refresh', refreshWeatherData);

// Get weather history for location
router.get('/history/:latitude/:longitude', getWeatherHistory);

// Get weather summary/statistics
router.get('/summary', getWeatherSummary);

// Get weather alerts for location
router.get('/alerts/:latitude/:longitude', getWeatherAlerts);

// Scheduler management
router.post('/scheduler/start', startWeatherScheduler);
router.post('/scheduler/stop', stopWeatherScheduler);

// Cleanup old data
router.delete('/cleanup', deleteOldWeatherData);

export default router;