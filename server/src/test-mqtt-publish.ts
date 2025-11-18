#!/usr/bin/env ts-node

import mqtt from 'mqtt';

// Configuration
const MQTT_BROKER = process.env.MQTT_BROKER || 'broker.hivemq.com';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'Relawand_F01/sensor/data';
const MQTT_PORT = parseInt(process.env.MQTT_PORT || '8884', 10);

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║          RelaWand MQTT Publisher Test                     ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('Configuration:');
console.log(`  Broker: ${MQTT_BROKER}:${MQTT_PORT}`);
console.log(`  Topic:  ${MQTT_TOPIC}\n`);

// Sample sensor data
const sampleData = [
  {
    device_id: 'STM32-001',
    temperature: 25.5,
    humidity: 60.2,
    pressure: 1013.25,
    timestamp: new Date().toISOString()
  },
  {
    device_id: 'STM32-001',
    temperature: 26.1,
    humidity: 58.7,
    pressure: 1013.30,
    timestamp: new Date().toISOString()
  },
  {
    device_id: 'STM32-002',
    temperature: 24.8,
    humidity: 62.5,
    pressure: 1012.98,
    timestamp: new Date().toISOString()
  }
];

// Connect to broker
console.log('Connecting to broker...');
const protocol = MQTT_PORT === 8883 ? 'mqtts://' : 'mqtt://';
const client = mqtt.connect(`${protocol}${MQTT_BROKER}:${MQTT_PORT}`, {
  clientId: `relawand_publisher_${Math.random().toString(16).substring(2, 8)}`,
  clean: true,
  connectTimeout: 10000,
  keepalive: 60
});

client.on('connect', () => {
  console.log('✅ Connected to broker\n');
  console.log('Publishing test messages...\n');

  // Publish each sample data with a delay
  let index = 0;
  const publishInterval = setInterval(() => {
    if (index >= sampleData.length) {
      console.log('\n✅ All messages published successfully!');
      console.log('Check the listener terminal to see the received messages.\n');

      // Disconnect after a short delay
      setTimeout(() => {
        client.end();
        process.exit(0);
      }, 1000);

      clearInterval(publishInterval);
      return;
    }

    const data = sampleData[index];
    const message = JSON.stringify(data);

    client.publish(MQTT_TOPIC, message, { qos: 0 }, (err) => {
      if (err) {
        console.error(`❌ Error publishing message ${index + 1}:`, err);
      } else {
        console.log(`📤 Message ${index + 1}/${sampleData.length} published:`);
        console.log(`   ${message}\n`);
      }
    });

    index++;
  }, 2000); // 2 second delay between messages
});

client.on('error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n[SHUTDOWN] Received interrupt signal');
  client.end();
  process.exit(0);
});
