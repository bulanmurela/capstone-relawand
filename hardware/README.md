# RelaWand Hardware Integration

This directory contains example code and documentation for integrating STM32 microcontrollers with the RelaWand IoT web application.

## Hardware Requirements

- STM32 microcontroller (any model with Wi-Fi capability)
- DHT22 temperature and humidity sensor
- MQ-series gas sensor (MQ-2, MQ-4, or MQ-135 recommended)
- ESP32-CAM or compatible camera module (optional)
- Wi-Fi module (if not built-in)

## API Endpoints for Hardware

### Device Registration
```
POST /api/hardware/register
Content-Type: application/json

{
  "deviceId": "STM32_001",
  "deviceName": "Forest Monitor A1",
  "firmwareVersion": "1.2.3",
  "userId": "user_object_id"
}
```

### Heartbeat
```
POST /api/hardware/heartbeat/{deviceId}
Content-Type: application/json

{
  "batteryLevel": 85,
  "signalStrength": -65,
  "firmwareVersion": "1.2.3"
}
```

### Send Sensor Data
```
POST /api/hardware/sensor-data/{deviceId}
Content-Type: application/json

{
  "temperature": 28.5,
  "humidity": 65.2,
  "pressure": 1013.25,
  "voltage": 3.3,
  "current": 0.15,
  "dht": {
    "temperature": 28.5,
    "humidity": 65.2
  },
  "mq": {
    "gasLevel": 150,
    "ppm": 12.5
  },
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456
  },
  "batteryLevel": 85,
  "signalStrength": -65
}
```

### Report Device Error
```
POST /api/hardware/error/{deviceId}
Content-Type: application/json

{
  "errorCode": "SENSOR_FAIL",
  "errorMessage": "DHT22 sensor not responding",
  "severity": 7
}
```

### Get Device Configuration
```
GET /api/hardware/config/{deviceId}
```

## Alert Thresholds

The system monitors the following thresholds:

### Temperature
- **Warning (SIAGA)**: ≥ 35.0°C
- **Critical (DARURAT)**: ≥ 40.0°C

### Humidity
- **Warning (SIAGA)**: ≤ 35.0%
- **Critical (DARURAT)**: ≤ 25.0%

### Gas Level (MQ Sensor)
- **Warning (SIAGA)**: ≥ 250 ppm
- **Critical (DARURAT)**: ≥ 300 ppm

## Example STM32 Code Structure

```c
// Main loop structure
void loop() {
  // Read sensors
  float temperature = readDHT22Temperature();
  float humidity = readDHT22Humidity();
  int gasLevel = readMQSensor();

  // Send heartbeat every 30 seconds
  if (millis() - lastHeartbeat > 30000) {
    sendHeartbeat();
    lastHeartbeat = millis();
  }

  // Send sensor data every 60 seconds
  if (millis() - lastDataSend > 60000) {
    sendSensorData(temperature, humidity, gasLevel);
    lastDataSend = millis();
  }

  // Check for errors
  if (sensorError) {
    reportError("SENSOR_FAIL", "Sensor not responding", 7);
    sensorError = false;
  }

  delay(1000);
}
```

## Wi-Fi Setup

```c
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://your-server-ip:5000";

void setupWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected!");
}
```

## HTTP Request Functions

```c
void sendHeartbeat() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/heartbeat/" + deviceId);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"batteryLevel\":" + String(getBatteryLevel()) + ",";
    payload += "\"signalStrength\":" + String(WiFi.RSSI()) + ",";
    payload += "\"firmwareVersion\":\"" + firmwareVersion + "\"";
    payload += "}";

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Heartbeat sent: " + response);
    } else {
      Serial.println("Error sending heartbeat");
    }

    http.end();
  }
}

void sendSensorData(float temp, float hum, int gas) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/sensor-data/" + deviceId);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"temperature\":" + String(temp) + ",";
    payload += "\"humidity\":" + String(hum) + ",";
    payload += "\"voltage\":" + String(getVoltage()) + ",";
    payload += "\"current\":" + String(getCurrent()) + ",";
    payload += "\"dht\":{";
    payload += "\"temperature\":" + String(temp) + ",";
    payload += "\"humidity\":" + String(hum);
    payload += "},";
    payload += "\"mq\":{";
    payload += "\"gasLevel\":" + String(gas) + ",";
    payload += "\"ppm\":" + String(gas * 0.1);
    payload += "},";
    payload += "\"batteryLevel\":" + String(getBatteryLevel()) + ",";
    payload += "\"signalStrength\":" + String(WiFi.RSSI());
    payload += "}";

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Sensor data sent: " + response);
    } else {
      Serial.println("Error sending sensor data");
    }

    http.end();
  }
}
```

## Testing

You can test the hardware integration using tools like:

1. **Postman** - For testing API endpoints
2. **Arduino Serial Monitor** - For debugging STM32 code
3. **cURL** - For command-line testing

Example cURL commands:

```bash
# Register device
curl -X POST http://localhost:5000/api/hardware/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "STM32_TEST",
    "deviceName": "Test Device",
    "firmwareVersion": "1.0.0"
  }'

# Send sensor data
curl -X POST http://localhost:5000/api/hardware/sensor-data/STM32_TEST \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25.5,
    "humidity": 60.2,
    "dht": {"temperature": 25.5, "humidity": 60.2},
    "mq": {"gasLevel": 120, "ppm": 12.0}
  }'
```

## Troubleshooting

1. **Device not found error**: Make sure to register the device first
2. **Wi-Fi connection issues**: Check SSID and password
3. **HTTP request failures**: Verify server URL and network connectivity
4. **Sensor reading errors**: Check sensor connections and power supply

## Security Notes

1. Use HTTPS in production environments
2. Implement device authentication tokens
3. Validate all sensor data on the server side
4. Monitor for unusual device behavior