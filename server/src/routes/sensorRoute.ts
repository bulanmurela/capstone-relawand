// server/src/routes/sensorRoute.ts
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Server-Sent Events untuk real-time monitoring
router.get('/stream/:locationId', (req, res) => {
  const { locationId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Simulate sensor data stream
  const interval = setInterval(() => {
    const sensorData = {
      locationId,
      deviceName: 'RelaWand 1',
      temperature: Math.floor(Math.random() * 30) + 25,
      humidity: Math.floor(Math.random() * 40) + 30,
      gasConcentration: Math.floor(Math.random() * 800),
      timestamp: new Date().toISOString()
    };

    res.write(`data: ${JSON.stringify(sensorData)}\n\n`);
  }, 5000); // Send data every 5 seconds

  req.on('close', () => {
    clearInterval(interval);
  });
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

// TODO: Query dari database
    // const data = await SensorModel.find({ locationId, type: 'temp-humidity' })
    //   .sort({ timestamp: -1 })
    //   .limit(7);