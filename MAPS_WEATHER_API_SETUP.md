# RelaWand Maps & Weather API Integration

## Overview

This document provides comprehensive setup and usage instructions for Google Maps API and OpenWeatherMap API integration in the RelaWand IoT system. These APIs provide location mapping and real-time weather data for device monitoring.

## API Requirements

### 1. Google Maps API
- **Purpose**: Device location mapping, geocoding, static map generation
- **Key Features**:
  - Display device locations on interactive maps
  - Generate static map images with device markers
  - Geocoding coordinates to addresses
  - Reverse geocoding addresses to coordinates
  - Find nearby places and landmarks

### 2. OpenWeatherMap API
- **Purpose**: Real-time weather data and forecasting
- **Key Features**:
  - Current weather conditions
  - Hourly weather updates (automated)
  - Weather forecasts (3-day)
  - Weather-based alerts
  - Location-specific weather data

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Google Maps API Key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# OpenWeatherMap API Key
OPENWEATHERMAP_API_KEY=your-openweathermap-api-key-here
```

### 2. Getting API Keys

#### Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
   - Maps Static API
4. Create credentials (API key)
5. Restrict the API key (recommended for production)

#### OpenWeatherMap API Key
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Choose a plan (free tier available)
3. Get your API key from the dashboard
4. Note: Free tier has usage limits

### 3. Install Dependencies

```bash
cd server
npm install axios node-cron
npm install --save-dev @types/node-cron
```

## Database Models

### Weather Data Schema
```typescript
{
  location: {
    latitude: number,
    longitude: number,
    name: string,
    country: string,
    state: string
  },
  current: {
    datetime: Date,
    temperature: number,        // Celsius
    humidity: number,          // Percentage
    windSpeed: number,         // m/s
    precipitation: number,     // mm
    weatherCondition: string,  // Clear, Rain, etc.
    weatherDescription: string,
    weatherIcon: string
  },
  forecast: [...],
  lastUpdated: Date,
  source: string
}
```

### Location Data Schema
```typescript
{
  coordinates: {
    latitude: number,
    longitude: number
  },
  address: {
    formatted: string,
    street: string,
    city: string,
    state: string,
    country: string
  },
  geocoding: {
    source: string,
    accuracy: string,
    placeId: string
  },
  deviceIds: [string],
  lastUpdated: Date
}
```

## API Endpoints

### Weather API Endpoints

#### Get Current Weather
```http
GET /api/weather/current/:latitude/:longitude
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "location": {
      "latitude": -6.2088,
      "longitude": 106.8456,
      "name": "Jakarta",
      "country": "Indonesia"
    },
    "current": {
      "datetime": "2024-09-29T10:00:00.000Z",
      "temperature": 28.5,
      "humidity": 75,
      "windSpeed": 8.5,
      "precipitation": 0,
      "weatherCondition": "Partly Cloudy",
      "weatherDescription": "partly cloudy",
      "weatherIcon": "02d"
    },
    "lastUpdated": "2024-09-29T10:00:00.000Z"
  }
}
```

#### Get Weather by Device
```http
GET /api/weather/device/:deviceId
```

#### Get Weather for Multiple Devices
```http
POST /api/weather/devices
Content-Type: application/json

{
  "deviceIds": ["STM32_001", "STM32_002"]
}
```

#### Refresh Weather Data
```http
POST /api/weather/refresh
Content-Type: application/json

{
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

#### Get Weather History
```http
GET /api/weather/history/:latitude/:longitude?startDate=2024-09-01&endDate=2024-09-30&limit=100&page=1
```

#### Get Weather Alerts
```http
GET /api/weather/alerts/:latitude/:longitude
```

#### Weather Scheduler Management
```http
POST /api/weather/scheduler/start
POST /api/weather/scheduler/stop
```

### Maps API Endpoints

#### Geocode Coordinates
```http
GET /api/maps/geocode/:latitude/:longitude
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "address": {
      "formatted": "Jakarta Forest Reserve Area A1, Jakarta, Indonesia",
      "street": "Forest Reserve Road",
      "city": "Jakarta",
      "state": "DKI Jakarta",
      "country": "Indonesia"
    },
    "geocoding": {
      "source": "Google Maps",
      "accuracy": "ROOFTOP",
      "placeId": "ChIJ..."
    }
  }
}
```

#### Reverse Geocode Address
```http
POST /api/maps/reverse-geocode
Content-Type: application/json

{
  "address": "Jakarta, Indonesia"
}
```

#### Get Device Locations
```http
GET /api/maps/devices?deviceIds=STM32_001,STM32_002
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "deviceId": "STM32_001",
      "deviceName": "Forest Monitor A1",
      "coordinates": {
        "latitude": -6.2088,
        "longitude": 106.8456
      },
      "address": "Jakarta Forest Reserve Area A1",
      "status": "online",
      "lastHeartbeat": "2024-09-29T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Generate Static Map
```http
GET /api/maps/static/:latitude/:longitude?zoom=15&size=600x400&mapType=roadmap
```

#### Get Device Map
```http
GET /api/maps/device/:deviceId?zoom=15&size=600x400
```

#### Get All Devices Map
```http
GET /api/maps/all-devices?zoom=10&size=800x600
```

#### Find Nearby Places
```http
GET /api/maps/nearby/:latitude/:longitude?radius=5000&type=hospital
```

## Weather Update Scheduler

The system automatically updates weather data:

- **Hourly Updates**: Every hour for all device locations
- **Frequent Updates**: Every 15 minutes for active devices
- **Auto-start**: Scheduler starts automatically with the server

### Manual Scheduler Control
```bash
# Start scheduler
curl -X POST http://localhost:5000/api/weather/scheduler/start

# Stop scheduler
curl -X POST http://localhost:5000/api/weather/scheduler/stop
```

## Frontend Integration Examples

### Displaying Device on Map (JavaScript)
```javascript
// Get device locations
fetch('/api/maps/devices')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(device => {
      // Add marker to map
      const marker = new google.maps.Marker({
        position: device.coordinates,
        map: map,
        title: device.deviceName,
        icon: getDeviceIcon(device.status)
      });
    });
  });

function getDeviceIcon(status) {
  const icons = {
    online: 'green-marker.png',
    offline: 'gray-marker.png',
    error: 'red-marker.png'
  };
  return icons[status] || icons.offline;
}
```

### Displaying Weather Data
```javascript
// Get weather for device
fetch(`/api/weather/device/${deviceId}`)
  .then(response => response.json())
  .then(data => {
    const weather = data.data.current;
    document.getElementById('temperature').textContent = `${weather.temperature}°C`;
    document.getElementById('humidity').textContent = `${weather.humidity}%`;
    document.getElementById('condition').textContent = weather.weatherDescription;
    document.getElementById('wind').textContent = `${weather.windSpeed} m/s`;
  });
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const DeviceWeatherCard = ({ deviceId }) => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Fetch weather and location data
    Promise.all([
      fetch(`/api/weather/device/${deviceId}`).then(r => r.json()),
      fetch(`/api/maps/device/${deviceId}`).then(r => r.json())
    ]).then(([weatherData, locationData]) => {
      setWeather(weatherData.data?.current);
      setLocation(locationData.data);
    });
  }, [deviceId]);

  if (!weather || !location) return <div>Loading...</div>;

  return (
    <div className="weather-card">
      <h3>{location.deviceName}</h3>
      <p>{location.address}</p>

      <div className="weather-info">
        <div>Temperature: {weather.temperature}°C</div>
        <div>Humidity: {weather.humidity}%</div>
        <div>Wind: {weather.windSpeed} m/s</div>
        <div>Condition: {weather.weatherDescription}</div>
      </div>

      <img
        src={location.mapUrl}
        alt="Device location map"
        className="location-map"
      />
    </div>
  );
};
```

## Weather Alerts System

The system automatically generates weather-based alerts:

### Alert Thresholds
- **High Temperature**: ≥35°C (Warning), ≥40°C (Critical)
- **Low Humidity**: ≤30% (Warning), ≤20% (Critical)
- **High Wind**: ≥15 m/s (Warning), ≥25 m/s (Critical)
- **Extreme Weather**: Thunderstorm, Snow, Tornado (Critical)

### Getting Weather Alerts
```javascript
fetch(`/api/weather/alerts/${latitude}/${longitude}`)
  .then(response => response.json())
  .then(data => {
    const alerts = data.data.alerts;
    alerts.forEach(alert => {
      if (alert.severity === 'critical') {
        showCriticalAlert(alert.message);
      } else {
        showWarningAlert(alert.message);
      }
    });
  });
```

## Production Considerations

### 1. API Key Security
- Use environment variables
- Restrict API keys by domain/IP
- Implement rate limiting
- Monitor API usage

### 2. Caching Strategy
- Cache weather data for 1 hour
- Cache location data until coordinates change
- Implement Redis for distributed caching

### 3. Error Handling
- Graceful fallback when APIs are unavailable
- Retry mechanisms for failed requests
- User notifications for service disruptions

### 4. Performance Optimization
- Batch API requests when possible
- Use efficient database queries
- Implement pagination for large datasets
- Compress map images

## Testing

### Test Weather API
```bash
# Test current weather
curl "http://localhost:5000/api/weather/current/-6.2088/106.8456"

# Test weather alerts
curl "http://localhost:5000/api/weather/alerts/-6.2088/106.8456"

# Test weather refresh
curl -X POST "http://localhost:5000/api/weather/refresh" \
  -H "Content-Type: application/json" \
  -d '{"latitude": -6.2088, "longitude": 106.8456}'
```

### Test Maps API
```bash
# Test geocoding
curl "http://localhost:5000/api/maps/geocode/-6.2088/106.8456"

# Test device locations
curl "http://localhost:5000/api/maps/devices"

# Test static map
curl "http://localhost:5000/api/maps/static/-6.2088/106.8456?zoom=15&size=600x400"
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Check if API key is correctly set in .env
   - Verify API key has required permissions
   - Check API usage limits

2. **Weather Data Not Updating**
   - Verify scheduler is running
   - Check OpenWeatherMap API status
   - Review server logs for errors

3. **Maps Not Loading**
   - Verify Google Maps API key
   - Check browser console for errors
   - Ensure required APIs are enabled

4. **Database Errors**
   - Check MongoDB connection
   - Verify model schemas
   - Review database indexes

### Debugging

Enable debug logging:
```javascript
// In weather service
console.log('Weather API request:', url, params);
console.log('Weather API response:', response.data);

// In maps service
console.log('Maps API request:', url, params);
console.log('Maps API response:', response.data);
```

## Development vs Production

### Development
- Use sample/mock data when APIs not available
- Relaxed rate limiting
- Detailed error messages
- Debug logging enabled

### Production
- Real API keys with proper restrictions
- Implement rate limiting
- Error monitoring and alerting
- Optimized caching strategies
- HTTPS only for API requests

This setup provides a robust foundation for displaying device locations on maps and showing real-time weather data in your RelaWand dashboard.