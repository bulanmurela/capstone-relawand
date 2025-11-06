# MQTT Integration Guide - RelaWand IoT System

## 🎉 System Overview

Your RelaWand application now has **dual MQTT listeners** for optimal real-time performance:

### Architecture

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│             │         │                  │         │              │
│  STM32 IoT  ├────────>│  MQTT Broker     │<────────┤   Backend    │
│   Device    │         │  (test.mosquitto │         │  (Express)   │
│             │         │     .org)        │         │              │
└─────────────┘         └──────────────────┘         └──────┬───────┘
                                │                            │
                                │                            │ Saves to
                                │                            ▼
                                │                    ┌──────────────┐
                                └───────────────────>│   MongoDB    │
                                                     └──────────────┘

                                         Listens directly
                                         (no backend spam)
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │   Frontend   │
                                        │   (Next.js)  │
                                        └──────────────┘
```

### Benefits of Dual Listeners

1. **Backend Listener**: Saves all sensor data to MongoDB for historical analysis
2. **Frontend Listener**: Gets real-time updates directly from MQTT (no API polling)
3. **Efficiency**: Frontend fetches historical data from API, live data from MQTT
4. **Reduced Load**: No need to constantly hit the backend for updates

---

## 🚀 Quick Start

### 1. Backend Setup

The backend is **already configured** and running! It:
- Listens to MQTT messages
- Saves sensor data to MongoDB
- Auto-creates devices if they don't exist
- Handles alarms and alerts

**Environment Variables** (in `server/.env`):
```env
MQTT_BROKER=test.mosquitto.org
MQTT_PORT=1883
MQTT_TOPIC=/topic
DEFAULT_DEVICE_ID=STM32-001
```

### 2. Frontend Setup

**Environment Variables** (in `client/.env.local`):
```env
NEXT_PUBLIC_MQTT_BROKER=test.mosquitto.org
NEXT_PUBLIC_MQTT_PORT=1883
NEXT_PUBLIC_MQTT_TOPIC=/topic
```

**Usage in Components**:
```tsx
import { useMqttContext } from '@/contexts/MqttContext';

function MyComponent() {
  const { data, isConnected, error, lastUpdate } = useMqttContext();

  return (
    <div>
      {data && (
        <p>Temperature: {data.temperature}°C</p>
        <p>Humidity: {data.humidity}%</p>
        <p>Gas: {data.gas_ppm} ppm</p>
      )}
    </div>
  );
}
```

---

## 📊 Data Format

Your STM32 device sends data in this format:

```json
{
  "temperature": 23.9,
  "humidity": 67.3,
  "gas_adc": 459,
  "gas_ppm": 1121,
  "voltage": 0.370,
  "alarm": false,
  "device_id": "STM32-001"  // optional
}
```

### Database Mapping

The backend maps this to your `SensorData` model:
```typescript
{
  deviceId: "STM32-001",
  timestamp: new Date(),
  temperature: 23.9,
  humidity: 67.3,
  co: 0,
  co2: 1121,  // from gas_ppm
  lpg: 1121   // from gas_ppm
}
```

---

## 🔧 Configuration Options

### For Local Network Setup

If your IoT device and laptop are on the **same WiFi**:

1. **Find your local IP**:
   ```bash
   ipconfig  # Windows
   ifconfig  # Linux/Mac
   ```

2. **Update both `.env` files**:

   **Backend** (`server/.env`):
   ```env
   MQTT_BROKER=192.168.1.100  # Your local IP
   MQTT_TOPIC=/relawand/sensor
   ```

   **Frontend** (`client/.env.local`):
   ```env
   NEXT_PUBLIC_MQTT_BROKER=192.168.1.100
   NEXT_PUBLIC_MQTT_TOPIC=/relawand/sensor
   ```

3. **Configure your STM32** to publish to `192.168.1.100:1883`

---

## 🧪 Testing

### Test Backend MQTT Listener

```bash
cd server
npm run mqtt:listen
```

### Test Publishing Messages

```bash
cd server
npm run mqtt:publish
```

Or from your terminal with mosquitto:
```bash
mosquitto_pub -h test.mosquitto.org -t "/topic" -m '{"temperature":25,"humidity":60,"gas_ppm":1000,"gas_adc":450,"voltage":0.37,"alarm":false}'
```

### Test Frontend (Dev Mode)

```bash
cd client
npm run dev
```

Visit `http://localhost:3000` and add the `RealTimeSensorDisplay` component to any page to see live data.

---

## 📁 Files Created

### Backend
- `server/src/services/mqttService.ts` - Production MQTT service
- `server/src/services/mqttListener.ts` - Simple listener (for testing)
- `server/src/test-mqtt.ts` - Test listener script
- `server/src/test-mqtt-publish.ts` - Test publisher script

### Frontend
- `client/src/hooks/useMqtt.ts` - React hook for MQTT
- `client/src/contexts/MqttContext.tsx` - Context provider
- `client/src/components/RealTimeSensorDisplay.tsx` - Example display component

---

## 🎨 Using MQTT in Your Frontend Components

### Option 1: Use the Context (Recommended)

```tsx
'use client';
import { useMqttContext } from '@/contexts/MqttContext';

export default function Dashboard() {
  const { data, isConnected } = useMqttContext();

  return (
    <div>
      <h1>Live Dashboard</h1>
      {isConnected && data && (
        <div>
          <p>Temp: {data.temperature}°C</p>
          <p>Humidity: {data.humidity}%</p>
        </div>
      )}
    </div>
  );
}
```

### Option 2: Use the Hook Directly

```tsx
'use client';
import { useMqtt } from '@/hooks/useMqtt';

export default function CustomMonitor() {
  const { data, isConnected, error } = useMqtt({
    topic: '/custom/topic',  // Optional: override default
    enabled: true
  });

  // Your component logic...
}
```

### Option 3: Use the Example Component

```tsx
import RealTimeSensorDisplay from '@/components/RealTimeSensorDisplay';

export default function Page() {
  return (
    <div>
      <h1>Monitoring</h1>
      <RealTimeSensorDisplay />
    </div>
  );
}
```

---

## 🔥 Features

### Backend MQTT Service Features

✅ Auto-connects on server startup
✅ Auto-creates devices if not in database
✅ Updates device status to "online" on each message
✅ Saves sensor data to MongoDB
✅ Handles alarms and creates alerts
✅ Alert levels: NORMAL, SIAGA, DARURAT (based on gas_ppm)
✅ Automatic reconnection on disconnect

### Frontend MQTT Hook Features

✅ Auto-connects when component mounts
✅ Automatic reconnection
✅ TypeScript typed data
✅ Connection status tracking
✅ Error handling
✅ Last update timestamp
✅ Clean disconnection on unmount

---

## 🛠️ Troubleshooting

### Backend Not Receiving Messages

1. Check server logs: Look for `[MQTT] ✅ Connected to broker`
2. Verify env variables in `server/.env`
3. Check MongoDB connection
4. Test with: `npm run mqtt:publish` from server directory

### Frontend Not Receiving Messages

1. Open browser console (F12)
2. Look for `[MQTT Client] ✅ Connected`
3. Verify env variables in `client/.env.local`
4. Check that topic matches backend and device
5. Restart frontend dev server after changing .env

### Connection Timeouts

- Public brokers like `test.mosquitto.org` can be slow
- Consider running a local Mosquitto broker for production
- Check firewall settings for port 1883

### Data Not Saving to Database

1. Check MongoDB connection in backend logs
2. Verify device exists or auto-creation is working
3. Check sensor data format matches expected schema
4. Look for errors in backend console

---

## 📡 Production Deployment

### Option 1: Public Broker (Current Setup)
- Good for: Testing, demos
- Limitations: No security, shared with others
- Current: `test.mosquitto.org`

### Option 2: Local Broker
- Good for: Private networks, IoT devices on same WiFi
- Setup: Install Mosquitto on a server/laptop
- Configure: Use local IP (e.g., `192.168.1.100`)

### Option 3: Cloud MQTT Broker
- Good for: Production, remote access
- Options:
  - HiveMQ Cloud (free tier available)
  - AWS IoT Core
  - Azure IoT Hub
  - CloudMQTT

---

## 🎯 Next Steps

1. **Test the System**: Send data from your STM32 and verify both backend saves to DB and frontend displays it
2. **Integrate Display**: Add `RealTimeSensorDisplay` to your dashboard page
3. **Customize UI**: Modify the display component to match your design
4. **Add Charts**: Combine MQTT real-time data with historical data from API
5. **Configure Alerts**: Set thresholds for gas_ppm to trigger different alert levels
6. **Deploy**: Choose production MQTT broker setup

---

## 📝 NPM Scripts

### Backend
```bash
npm run dev           # Start server with MQTT
npm run mqtt:listen   # Test MQTT listener only
npm run mqtt:publish  # Publish test messages
```

### Frontend
```bash
npm run dev          # Start Next.js dev server with MQTT
npm run build        # Build for production
npm run start        # Start production server
```

---

## 🤝 Support

For issues or questions:
- Check the troubleshooting section above
- Review console logs (both backend and frontend)
- Verify environment variables are set correctly
- Test with the provided test scripts

Happy monitoring! 🚀
