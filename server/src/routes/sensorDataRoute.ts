import express from 'express';
import { 
  getSensorData, 
  getLatestSensorData, 
  createSensorData 
} from '../controllers/sensorDataController';

const router = express.Router();

// GET /api/sensor-data/:deviceId - Get historical data
router.get('/:deviceId', getSensorData);

// GET /api/sensor-data/:deviceId/latest - Get latest reading
router.get('/:deviceId/latest', getLatestSensorData);

// POST /api/sensor-data - Create new sensor reading
router.post('/', createSensorData);

export default router;