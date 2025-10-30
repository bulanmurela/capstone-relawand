// server/src/routes/sensorRoute.ts
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Get temperature & humidity data
router.get('/temperature-humidity/:locationId', authMiddleware, async (req, res) => {
  try {
    const { locationId } = req.params;
    
    // TODO: Query dari database
    // const data = await SensorModel.find({ locationId, type: 'temp-humidity' })
    //   .sort({ timestamp: -1 })
    //   .limit(7);
    
    res.json({
      success: true,
      data: [
        // Data dari database
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data' });
  }
});

// Get gas concentration data
router.get('/gas-concentration/:locationId', authMiddleware, async (req, res) => {
  // Similar structure
});

// Capture camera image
router.post('/camera/capture/:locationId', authMiddleware, async (req, res) => {
  // Trigger camera capture and return image URL
});

export default router;