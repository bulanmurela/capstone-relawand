// server/src/routes/mqttLogRoute.ts
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import MqttLog from '../models/MqttLog';

const router = express.Router();

// Get all MQTT logs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, type, deviceId } = req.query;

    // Build query
    const query: any = {};

    // Filter by type if provided
    if (type && (type === 'SENT' || type === 'RECEIVED')) {
      query.type = type;
    }

    // Filter by device if provided
    if (deviceId) {
      query.deviceId = deviceId;
    }

    const logs = await MqttLog.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching MQTT logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch MQTT logs'
    });
  }
});

// Get logs by device
router.get('/device/:deviceId', authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 100 } = req.query;

    const logs = await MqttLog.find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    console.error('Error fetching device logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device logs'
    });
  }
});

// Get log statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const total = await MqttLog.countDocuments();
    const received = await MqttLog.countDocuments({ type: 'RECEIVED' });
    const sent = await MqttLog.countDocuments({ type: 'SENT' });
    const errors = await MqttLog.countDocuments({ status: 'error' });

    res.json({
      success: true,
      stats: {
        total,
        received,
        sent,
        errors
      }
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch log statistics'
    });
  }
});

export default router;
