import express from 'express';
import {
  registerDevice,
  sendHeartbeat,
  sendSensorData,
  reportDeviceError,
  getDeviceConfig
} from '../controllers/hardwareController';

const router = express.Router();

router.post('/register', registerDevice);
router.post('/heartbeat/:deviceId', sendHeartbeat);
router.post('/sensor-data/:deviceId', sendSensorData);
router.post('/error/:deviceId', reportDeviceError);
router.get('/config/:deviceId', getDeviceConfig);

export default router;