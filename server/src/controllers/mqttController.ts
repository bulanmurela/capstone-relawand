import { Request, Response } from 'express';
import mqtt from 'mqtt';

const MQTT_BROKER = process.env.MQTT_BROKER || '103.197.188.247';
const MQTT_PORT = parseInt(process.env.MQTT_PORT || '1883', 10);

// Publish MQTT message
export const publishMqttMessage = async (req: Request, res: Response) => {
  try {
    const { topic, message } = req.body;

    if (!topic || !message) {
      return res.status(400).json({
        success: false,
        message: 'Topic and message are required'
      });
    }

    // Connect to MQTT broker
    const client = mqtt.connect(`mqtt://${MQTT_BROKER}:${MQTT_PORT}`);

    client.on('connect', () => {
      console.log(`Connected to MQTT broker for publishing: ${MQTT_BROKER}:${MQTT_PORT}`);

      // Publish the message
      client.publish(topic, message, { qos: 1 }, (error) => {
        if (error) {
          console.error('Error publishing message:', error);
          client.end();
          return res.status(500).json({
            success: false,
            message: 'Failed to publish message',
            error: error.message
          });
        }

        console.log(`Published to topic ${topic}:`, message);
        client.end();

        res.json({
          success: true,
          message: 'Message published successfully',
          data: {
            topic,
            message: JSON.parse(message)
          }
        });
      });
    });

    client.on('error', (error) => {
      console.error('MQTT connection error:', error);
      client.end();
      res.status(500).json({
        success: false,
        message: 'MQTT connection error',
        error: error.message
      });
    });

    // Set timeout for connection
    setTimeout(() => {
      if (!client.connected) {
        client.end();
        res.status(504).json({
          success: false,
          message: 'Connection timeout'
        });
      }
    }, 10000);

  } catch (error: any) {
    console.error('Error in publishMqttMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get MQTT broker status
export const getMqttStatus = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        broker: MQTT_BROKER,
        port: MQTT_PORT,
        topic: process.env.MQTT_TOPIC || 'Relawand'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting MQTT status',
      error: error.message
    });
  }
};
