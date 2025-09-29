import express from 'express';
import {
  getRealtimeStats,
  startSimulatedStream,
  stopSimulatedStream,
  getGraphData,
  getMultiDeviceGraphData,
  getRealtimeSnapshot
} from '../controllers/realtimeController';

const router = express.Router();

// Realtime statistics
router.get('/stats', getRealtimeStats);

// Graph data endpoints
router.get('/graph/:deviceId', getGraphData);
router.post('/graph/multi-device', getMultiDeviceGraphData);

// Realtime snapshot of all devices
router.get('/snapshot', getRealtimeSnapshot);

// Simulated data stream management (for testing)
router.post('/simulate/start', startSimulatedStream);
router.delete('/simulate/stop/:deviceId', stopSimulatedStream);

export default router;