// server/src/routes/alertRoute.ts
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import Alert from '../models/Alert';
import Device from '../models/Device';

const router = express.Router();

// Get all alerts (optionally filter by viewed status)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 50, level, viewed } = req.query;

    // Build query
    const query: any = {};

    // Filter by level if provided
    if (level && level !== 'ALL') {
      query.level = level;
    } else {
      // Exclude NORMAL alerts by default
      query.level = { $in: ['SIAGA', 'DARURAT'] };
    }

    // Filter by viewed status if provided
    if (viewed === 'true') {
      query.isViewed = true;
    } else if (viewed === 'false') {
      query.isViewed = false;
    }

    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Get viewed alerts (history)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const alerts = await Alert.find({
      isViewed: true,
      level: { $in: ['SIAGA', 'DARURAT'] }
    })
      .sort({ viewedAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching alert history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert history'
    });
  }
});

// Get alerts by device
router.get('/device/:deviceId', authMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 20 } = req.query;

    const alerts = await Alert.find({
      deviceId,
      level: { $in: ['SIAGA', 'DARURAT'] }
    })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    console.error('Error fetching device alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch device alerts'
    });
  }
});

// Mark alert as viewed (when popup is shown)
router.post('/mark-viewed', authMiddleware, async (req, res) => {
  try {
    const { deviceId, level, temperature, humidity, gasConcentration, deviceName } = req.body;

    // Find or create device
    let device = await Device.findOne({ deviceId });
    if (!device) {
      // If device not found by deviceId string, search by name
      device = await Device.findOne({ deviceName });
    }

    // Create a new alert entry marked as viewed
    const alert = await Alert.create({
      deviceId: device?._id || deviceId, // Use device._id if found, otherwise use string deviceId
      deviceName: deviceName || device?.deviceName || deviceId,
      level,
      temperature: temperature || 0,
      humidity: humidity || 0,
      gasConcentration,
      timestamp: new Date(),
      isViewed: true,
      viewedAt: new Date()
    });

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error marking alert as viewed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as viewed'
    });
  }
});

// Update existing alert as viewed
router.patch('/:alertId/view', authMiddleware, async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        isViewed: true,
        viewedAt: new Date()
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert'
    });
  }
});

export default router;