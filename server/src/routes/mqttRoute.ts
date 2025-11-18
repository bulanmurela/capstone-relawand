import express from 'express';
import { publishMqttMessage, getMqttStatus } from '../controllers/mqttController';

const router = express.Router();

// POST /api/mqtt/publish - Publish a message to MQTT broker
router.post('/publish', publishMqttMessage);

// GET /api/mqtt/status - Get MQTT broker status
router.get('/status', getMqttStatus);

export default router;
