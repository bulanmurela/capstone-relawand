# MQTT Listener Setup Guide

This guide will help you set up and test the MQTT listener for the RelaWand IoT application.

## Prerequisites

- Node.js and npm installed
- Access to an MQTT broker (default: test.mosquitto.org)

## Installation Steps

### 1. Install MQTT Package

Navigate to the server directory and install the mqtt package:

```bash
cd server
npm install mqtt
npm install --save-dev @types/mqtt
```

### 2. Test the MQTT Listener

Run the test script to see the data flow:

```bash
# Option 1: Using ts-node directly
npx ts-node src/test-mqtt.ts

# Option 2: Using npm script (add to package.json first)
npm run mqtt:test
```

### 3. Configure Environment Variables (Optional)

Create a `.env` file in the server directory or set environment variables:

```env
MQTT_BROKER=test.mosquitto.org
MQTT_TOPIC=pX7bH4gQvWm2L9sNj3ZfYcE1tU8dKrTq
MQTT_PORT=1883
```

### 4. Send Test Messages

Open another terminal and publish test messages using mosquitto_pub:

```bash
# Send a simple text message
mosquitto_pub -h test.mosquitto.org -t "pX7bH4gQvWm2L9sNj3ZfYcE1tU8dKrTq" -m "Hello from RelaWand!"

# Send JSON sensor data
mosquitto_pub -h test.mosquitto.org -t "pX7bH4gQvWm2L9sNj3ZfYcE1tU8dKrTq" -m '{"temperature":25.5,"humidity":60,"timestamp":"2025-11-05T10:30:00Z"}'

# Send multiple messages
mosquitto_pub -h test.mosquitto.org -t "pX7bH4gQvWm2L9sNj3ZfYcE1tU8dKrTq" -m '{"sensor":"temp","value":23.4}'
mosquitto_pub -h test.mosquitto.org -t "pX7bH4gQvWm2L9sNj3ZfYcE1tU8dKrTq" -m '{"sensor":"humid","value":58.2}'
```

## Running in Background

### Option 1: Using PM2 (Recommended for Production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the MQTT listener
pm2 start npx --name "mqtt-listener" -- ts-node src/test-mqtt.ts

# View logs
pm2 logs mqtt-listener

# Stop the listener
pm2 stop mqtt-listener

# Remove from PM2
pm2 delete mqtt-listener
```

### Option 2: Using nohup (Linux/Mac)

```bash
nohup npx ts-node src/test-mqtt.ts > mqtt.log 2>&1 &

# View the process
ps aux | grep test-mqtt

# View logs
tail -f mqtt.log

# Stop the process
kill <PID>
```

### Option 3: Using Windows Background Task

```bash
# Start in background (Windows)
start /B npx ts-node src\test-mqtt.ts > mqtt.log 2>&1

# View processes
tasklist | findstr node

# Stop the process
taskkill /F /PID <PID>
```

### Option 4: Using screen (Linux/Mac)

```bash
# Start a new screen session
screen -S mqtt-listener

# Run the listener
npx ts-node src/test-mqtt.ts

# Detach: Press Ctrl+A then D

# Reattach later
screen -r mqtt-listener

# Kill the screen session
screen -X -S mqtt-listener quit
```

## Network Configuration

### Local Network MQTT Broker

If you're running a local MQTT broker (like Mosquitto):

1. **Find your local IP address:**
   ```bash
   # Windows
   ipconfig

   # Linux/Mac
   ifconfig
   # or
   ip addr show
   ```

2. **Update the environment variables:**
   ```env
   MQTT_BROKER=192.168.1.XXX  # Your local IP
   MQTT_TOPIC=/relawand/sensor
   MQTT_PORT=1883
   ```

3. **Ensure firewall allows MQTT traffic** (port 1883)

### Using a Different Broker

Popular public MQTT brokers for testing:
- `test.mosquitto.org` (no authentication)
- `broker.hivemq.com` (no authentication)
- `mqtt.eclipseprojects.io` (no authentication)

For production, consider:
- AWS IoT Core
- Azure IoT Hub
- HiveMQ Cloud
- CloudMQTT
- Self-hosted Mosquitto broker

## Troubleshooting

### Connection Issues

1. Check if the broker is accessible:
   ```bash
   # Test with mosquitto_sub
   mosquitto_sub -h test.mosquitto.org -t "pX7bH4gQvWm2L9sNj3ZfYcE1tU8dKrTq" -v
   ```

2. Verify firewall settings allow outbound connections on port 1883

3. Check if the broker requires authentication

### No Messages Received

1. Verify you're subscribed to the correct topic
2. Check topic permissions (some brokers restrict topics)
3. Ensure publisher and subscriber use the same topic format

## Next Steps

Once the listener is working correctly, you can integrate it into your Express.js application by:

1. Importing the MqttListener class in your main server file
2. Connecting to the broker on server startup
3. Processing incoming messages and saving to MongoDB
4. Broadcasting updates via Socket.IO to connected clients
