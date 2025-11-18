#!/usr/bin/env ts-node

import MqttListener from './services/mqttListener';

// Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'broker.emqx.io';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'Relawand_F01/sensor/data';
const MQTT_PORT = parseInt(process.env.MQTT_PORT || '1883', 10);

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║          RelaWand MQTT Listener Test                      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('Configuration:');
console.log(`  Broker: ${MQTT_BROKER}:${MQTT_PORT}`);
console.log(`  Topic:  ${MQTT_TOPIC}`);
console.log('');

// Create MQTT listener
const listener = new MqttListener({
  broker: MQTT_BROKER,
  port: MQTT_PORT,
  topic: MQTT_TOPIC,
  onMessage: (topic, message) => {
    // You can add custom processing here
    // For example, save to database or trigger events
  },
  onError: (error) => {
    console.error('MQTT Error occurred:', error.message);
  }
});

// Connect to broker
listener.connect();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n[SHUTDOWN] Received interrupt signal');
  listener.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n[SHUTDOWN] Received termination signal');
  listener.disconnect();
  process.exit(0);
});

// Keep the script running
console.log('Press Ctrl+C to stop...\n');
