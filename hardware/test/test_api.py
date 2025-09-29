#!/usr/bin/env python3
"""
Test script for RelaWand Hardware API endpoints
This script simulates an STM32 device sending data to the RelaWand API
"""

import requests
import json
import time
import random
from datetime import datetime

# Configuration
SERVER_URL = "http://localhost:5000"
DEVICE_ID = "STM32_TEST_001"
DEVICE_NAME = "Test Forest Monitor"
FIRMWARE_VERSION = "1.0.0"

class RelaWandTestClient:
    def __init__(self, server_url, device_id):
        self.server_url = server_url
        self.device_id = device_id
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def register_device(self):
        """Register the test device"""
        url = f"{self.server_url}/api/hardware/register"
        payload = {
            "deviceId": self.device_id,
            "deviceName": DEVICE_NAME,
            "firmwareVersion": FIRMWARE_VERSION
        }

        try:
            response = self.session.post(url, json=payload)
            print(f"Device Registration: {response.status_code}")
            print(f"Response: {response.json()}")
            return response.status_code == 201 or response.status_code == 200
        except Exception as e:
            print(f"Error registering device: {e}")
            return False

    def send_heartbeat(self):
        """Send heartbeat to server"""
        url = f"{self.server_url}/api/hardware/heartbeat/{self.device_id}"
        payload = {
            "batteryLevel": random.randint(70, 100),
            "signalStrength": random.randint(-80, -50),
            "firmwareVersion": FIRMWARE_VERSION
        }

        try:
            response = self.session.post(url, json=payload)
            print(f"Heartbeat: {response.status_code} - {datetime.now().strftime('%H:%M:%S')}")
            return response.status_code == 200
        except Exception as e:
            print(f"Error sending heartbeat: {e}")
            return False

    def send_sensor_data(self, temperature=None, humidity=None, gas_level=None):
        """Send sensor data to server"""
        url = f"{self.server_url}/api/hardware/sensor-data/{self.device_id}"

        # Generate realistic sensor data if not provided
        if temperature is None:
            temperature = round(random.uniform(20.0, 45.0), 1)
        if humidity is None:
            humidity = round(random.uniform(25.0, 80.0), 1)
        if gas_level is None:
            gas_level = random.randint(100, 400)

        payload = {
            "temperature": temperature,
            "humidity": humidity,
            "pressure": round(random.uniform(1010.0, 1020.0), 2),
            "voltage": round(random.uniform(3.0, 3.3), 2),
            "current": round(random.uniform(0.10, 0.20), 3),
            "dht": {
                "temperature": temperature,
                "humidity": humidity
            },
            "mq": {
                "gasLevel": gas_level,
                "ppm": round(gas_level * 0.1, 1)
            },
            "location": {
                "latitude": -6.2088,
                "longitude": 106.8456
            },
            "batteryLevel": random.randint(70, 100),
            "signalStrength": random.randint(-80, -50)
        }

        try:
            response = self.session.post(url, json=payload)
            print(f"Sensor Data: {response.status_code} - T:{temperature}°C, H:{humidity}%, G:{gas_level}ppm")
            if response.status_code != 201:
                print(f"Error response: {response.text}")
            return response.status_code == 201
        except Exception as e:
            print(f"Error sending sensor data: {e}")
            return False

    def report_error(self, error_code, error_message, severity=5):
        """Report device error"""
        url = f"{self.server_url}/api/hardware/error/{self.device_id}"
        payload = {
            "errorCode": error_code,
            "errorMessage": error_message,
            "severity": severity
        }

        try:
            response = self.session.post(url, json=payload)
            print(f"Error Report: {response.status_code} - {error_code}")
            return response.status_code == 200
        except Exception as e:
            print(f"Error reporting device error: {e}")
            return False

    def get_config(self):
        """Get device configuration from server"""
        url = f"{self.server_url}/api/hardware/config/{self.device_id}"

        try:
            response = self.session.get(url)
            print(f"Config Fetch: {response.status_code}")
            if response.status_code == 200:
                config = response.json()
                print(f"Config: {json.dumps(config['data'], indent=2)}")
                return config['data']
            return None
        except Exception as e:
            print(f"Error fetching config: {e}")
            return None

def test_normal_operation():
    """Test normal device operation"""
    print("=== Testing Normal Operation ===")
    client = RelaWandTestClient(SERVER_URL, DEVICE_ID)

    # Register device
    if not client.register_device():
        print("Failed to register device!")
        return

    # Get initial config
    config = client.get_config()

    # Send some normal sensor data
    for i in range(3):
        client.send_sensor_data()
        client.send_heartbeat()
        time.sleep(2)

def test_alert_conditions():
    """Test alert-triggering conditions"""
    print("\n=== Testing Alert Conditions ===")
    client = RelaWandTestClient(SERVER_URL, DEVICE_ID)

    # Test high temperature alert (SIAGA)
    print("Testing high temperature alert...")
    client.send_sensor_data(temperature=36.0, humidity=60.0, gas_level=150)
    time.sleep(1)

    # Test critical temperature alert (DARURAT)
    print("Testing critical temperature alert...")
    client.send_sensor_data(temperature=42.0, humidity=30.0, gas_level=180)
    time.sleep(1)

    # Test low humidity alert (SIAGA)
    print("Testing low humidity alert...")
    client.send_sensor_data(temperature=30.0, humidity=32.0, gas_level=160)
    time.sleep(1)

    # Test critical humidity alert (DARURAT)
    print("Testing critical humidity alert...")
    client.send_sensor_data(temperature=35.0, humidity=20.0, gas_level=170)
    time.sleep(1)

    # Test gas level alert (SIAGA)
    print("Testing gas level alert...")
    client.send_sensor_data(temperature=30.0, humidity=50.0, gas_level=260)
    time.sleep(1)

    # Test critical gas level alert (DARURAT)
    print("Testing critical gas level alert...")
    client.send_sensor_data(temperature=40.0, humidity=25.0, gas_level=320)
    time.sleep(1)

def test_error_conditions():
    """Test error reporting"""
    print("\n=== Testing Error Conditions ===")
    client = RelaWandTestClient(SERVER_URL, DEVICE_ID)

    # Test various error conditions
    client.report_error("DHT_ERROR", "DHT22 sensor not responding", 6)
    time.sleep(1)

    client.report_error("MQ_ERROR", "MQ sensor reading out of range", 5)
    time.sleep(1)

    client.report_error("POWER_LOW", "Battery level critically low", 8)
    time.sleep(1)

    client.report_error("NETWORK_ERROR", "WiFi connection unstable", 4)

def test_api_health():
    """Test API health endpoint"""
    print("=== Testing API Health ===")
    try:
        response = requests.get(f"{SERVER_URL}/api/health")
        print(f"Health Check: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def main():
    print("RelaWand Hardware API Test Script")
    print("==================================")

    # Test API health first
    if not test_api_health():
        print("API is not available. Please start the server first.")
        return

    # Run tests
    test_normal_operation()
    test_alert_conditions()
    test_error_conditions()

    print("\n=== Test Completed ===")
    print("Check the web application dashboard to see the generated data!")

if __name__ == "__main__":
    main()