#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://your-server-ip:5000";
const String deviceId = "STM32_001";
const String deviceName = "Forest Monitor A1";
const String firmwareVersion = "1.2.3";

// Pin definitions
#define DHT_PIN 2
#define DHT_TYPE DHT22
#define MQ_PIN A0
#define LED_PIN 13

// Sensor objects
DHT dht(DHT_PIN, DHT_TYPE);

// Timing variables
unsigned long lastHeartbeat = 0;
unsigned long lastDataSend = 0;
unsigned long lastConfigFetch = 0;

// Configuration from server
int reportingInterval = 60000;  // 60 seconds
int heartbeatInterval = 30000;  // 30 seconds

// Sensor data structure
struct SensorData {
  float temperature;
  float humidity;
  int gasLevel;
  float voltage;
  float current;
  int batteryLevel;
  int signalStrength;
};

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  dht.begin();

  setupWiFi();
  registerDevice();
  fetchDeviceConfig();

  Serial.println("RelaWand STM32 Device Started");
  Serial.println("Device ID: " + deviceId);
}

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, reconnecting...");
    setupWiFi();
    return;
  }

  // Read sensor data
  SensorData data = readSensors();

  // Send heartbeat
  if (millis() - lastHeartbeat > heartbeatInterval) {
    sendHeartbeat(data);
    lastHeartbeat = millis();
  }

  // Send sensor data
  if (millis() - lastDataSend > reportingInterval) {
    sendSensorData(data);
    lastDataSend = millis();
  }

  // Fetch config every 10 minutes
  if (millis() - lastConfigFetch > 600000) {
    fetchDeviceConfig();
    lastConfigFetch = millis();
  }

  // Check alert conditions
  checkAlertConditions(data);

  delay(1000);
}

void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, HIGH);
  } else {
    Serial.println();
    Serial.println("WiFi connection failed!");
    digitalWrite(LED_PIN, LOW);
  }
}

SensorData readSensors() {
  SensorData data;

  // Read DHT22
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();

  // Read MQ sensor
  int mqRaw = analogRead(MQ_PIN);
  data.gasLevel = map(mqRaw, 0, 1023, 0, 500);

  // Read system stats
  data.voltage = 3.3; // Assume 3.3V system
  data.current = 0.15; // Estimated current consumption
  data.batteryLevel = getBatteryLevel();
  data.signalStrength = WiFi.RSSI();

  // Check for sensor errors
  if (isnan(data.temperature) || isnan(data.humidity)) {
    Serial.println("DHT22 reading error!");
    reportError("DHT_ERROR", "DHT22 sensor not responding", 6);
    data.temperature = -999;
    data.humidity = -999;
  }

  return data;
}

void registerDevice() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/register");
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(1024);
    doc["deviceId"] = deviceId;
    doc["deviceName"] = deviceName;
    doc["firmwareVersion"] = firmwareVersion;

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Device registration response: " + response);
    } else {
      Serial.println("Error registering device: " + String(httpResponseCode));
    }

    http.end();
  }
}

void sendHeartbeat(SensorData data) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/heartbeat/" + deviceId);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(512);
    doc["batteryLevel"] = data.batteryLevel;
    doc["signalStrength"] = data.signalStrength;
    doc["firmwareVersion"] = firmwareVersion;

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 200) {
      Serial.println("Heartbeat sent successfully");
      digitalWrite(LED_PIN, HIGH);
    } else {
      Serial.println("Error sending heartbeat: " + String(httpResponseCode));
      digitalWrite(LED_PIN, LOW);
    }

    http.end();
  }
}

void sendSensorData(SensorData data) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/sensor-data/" + deviceId);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(1024);
    doc["temperature"] = data.temperature;
    doc["humidity"] = data.humidity;
    doc["voltage"] = data.voltage;
    doc["current"] = data.current;

    JsonObject dhtObj = doc.createNestedObject("dht");
    dhtObj["temperature"] = data.temperature;
    dhtObj["humidity"] = data.humidity;

    JsonObject mqObj = doc.createNestedObject("mq");
    mqObj["gasLevel"] = data.gasLevel;
    mqObj["ppm"] = data.gasLevel * 0.1;

    doc["batteryLevel"] = data.batteryLevel;
    doc["signalStrength"] = data.signalStrength;

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 201) {
      Serial.println("Sensor data sent successfully");
      Serial.println("Temp: " + String(data.temperature) + "°C, Humidity: " + String(data.humidity) + "%, Gas: " + String(data.gasLevel));
    } else {
      Serial.println("Error sending sensor data: " + String(httpResponseCode));
    }

    http.end();
  }
}

void reportError(String errorCode, String errorMessage, int severity) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/error/" + deviceId);
    http.addHeader("Content-Type", "application/json");

    DynamicJsonDocument doc(512);
    doc["errorCode"] = errorCode;
    doc["errorMessage"] = errorMessage;
    doc["severity"] = severity;

    String payload;
    serializeJson(doc, payload);

    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 200) {
      Serial.println("Error reported: " + errorMessage);
    } else {
      Serial.println("Failed to report error: " + String(httpResponseCode));
    }

    http.end();
  }
}

void fetchDeviceConfig() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(String(serverURL) + "/api/hardware/config/" + deviceId);

    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String response = http.getString();

      DynamicJsonDocument doc(1024);
      deserializeJson(doc, response);

      if (doc["success"] == true) {
        JsonObject config = doc["data"];
        reportingInterval = config["reportingInterval"] | 60000;
        heartbeatInterval = config["heartbeatInterval"] | 30000;

        Serial.println("Configuration updated:");
        Serial.println("  Reporting interval: " + String(reportingInterval) + "ms");
        Serial.println("  Heartbeat interval: " + String(heartbeatInterval) + "ms");
      }
    } else {
      Serial.println("Error fetching config: " + String(httpResponseCode));
    }

    http.end();
  }
}

void checkAlertConditions(SensorData data) {
  static bool tempAlertSent = false;
  static bool humidityAlertSent = false;
  static bool gasAlertSent = false;

  // Temperature alerts
  if (data.temperature >= 40.0 && !tempAlertSent) {
    Serial.println("CRITICAL TEMPERATURE ALERT: " + String(data.temperature) + "°C");
    tempAlertSent = true;
  } else if (data.temperature < 35.0) {
    tempAlertSent = false;
  }

  // Humidity alerts
  if (data.humidity <= 25.0 && !humidityAlertSent) {
    Serial.println("CRITICAL LOW HUMIDITY ALERT: " + String(data.humidity) + "%");
    humidityAlertSent = true;
  } else if (data.humidity > 35.0) {
    humidityAlertSent = false;
  }

  // Gas level alerts
  if (data.gasLevel >= 300 && !gasAlertSent) {
    Serial.println("CRITICAL GAS LEVEL ALERT: " + String(data.gasLevel) + "ppm");
    gasAlertSent = true;
  } else if (data.gasLevel < 250) {
    gasAlertSent = false;
  }
}

int getBatteryLevel() {
  // Implement battery level reading based on your hardware
  // This is a placeholder implementation
  return random(20, 100);
}