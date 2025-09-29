# RelaWand Real-time Graph System

## Overview

The RelaWand backend now includes a complete real-time graph system that provides constantly updated displays of temperature, humidity, and gas concentration data from sensors. This system uses WebSocket connections (Socket.IO) to stream live sensor data to the frontend dashboard for real-time visualization.

## ✅ Features Implemented

### **Real-time Data Streaming**
- **WebSocket Integration**: Socket.IO server for real-time communication
- **Live Sensor Data**: Automatic streaming of temperature, humidity, gas levels
- **Device Status Updates**: Real-time device online/offline/error status
- **Alert Notifications**: Instant alert broadcasting when thresholds exceeded

### **Graph Data API**
- **Historical Data**: Configurable time ranges (15m, 1h, 6h, 24h, 7d, 30d)
- **Data Types**: Temperature, humidity, gas concentration, electrical data
- **Multi-device Support**: Compare data across multiple devices
- **Data Aggregation**: Optimized queries for graph performance

### **WebSocket Events**
- **sensor-data**: Live sensor readings
- **graph-point**: Formatted data points for charts
- **device-status**: Device connectivity updates
- **alert**: Real-time alert notifications
- **weather-update**: Weather data updates

## API Endpoints

### Real-time WebSocket Connection
```javascript
// Connect to WebSocket server
const socket = io('http://localhost:5000');

// Subscribe to specific device
socket.emit('subscribe:device', 'STM32_001');

// Subscribe to multiple devices
socket.emit('subscribe:devices', ['STM32_001', 'STM32_002']);

// Subscribe to all devices
socket.emit('subscribe:all-devices');
```

### REST API Endpoints

#### Get Graph Data
```http
GET /api/realtime/graph/:deviceId?timeRange=1h&dataType=all&limit=100
```

**Parameters:**
- `timeRange`: 15m, 1h, 6h, 24h, 7d, 30d
- `dataType`: all, temperature, humidity, gas, electrical
- `limit`: Maximum data points (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "deviceId": "STM32_001",
    "timeRange": "1h",
    "dataType": "all",
    "dataPoints": [
      {
        "timestamp": "2024-09-29T10:00:00.000Z",
        "x": 1727604000000,
        "temperature": 28.5,
        "humidity": 65.2,
        "gasLevel": 150,
        "voltage": 3.3,
        "current": 0.15
      }
    ],
    "count": 50,
    "startTime": "2024-09-29T09:00:00.000Z",
    "endTime": "2024-09-29T10:00:00.000Z"
  }
}
```

#### Multi-device Graph Data
```http
POST /api/realtime/graph/multi-device?timeRange=1h&dataType=temperature
Content-Type: application/json

{
  "deviceIds": ["STM32_001", "STM32_002", "STM32_003"]
}
```

#### Real-time Snapshot
```http
GET /api/realtime/snapshot?deviceIds=STM32_001,STM32_002
```

#### Real-time Statistics
```http
GET /api/realtime/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connectedClients": 5,
    "activeRooms": {
      "device:STM32_001": 2,
      "device:STM32_002": 1,
      "all-devices": 3
    },
    "timestamp": "2024-09-29T10:00:00.000Z"
  }
}
```

## Frontend Integration Examples

### React Real-time Graph Component

```jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import io from 'socket.io-client';

const RealtimeGraph = ({ deviceId, dataType = 'temperature' }) => {
  const [socket, setSocket] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to real-time server');

      // Subscribe to device data
      newSocket.emit('subscribe:device', deviceId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from real-time server');
    });

    // Receive initial data
    newSocket.on('initial-data', (data) => {
      console.log('Received initial data:', data);
      loadHistoricalData();
    });

    // Receive live graph points
    newSocket.on('graph-point', (data) => {
      if (data.deviceId === deviceId) {
        setGraphData(prevData => {
          const newData = [...prevData, {
            x: data.data.timestamp,
            y: data.data[dataType]
          }];

          // Keep only last 100 points
          return newData.slice(-100);
        });
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [deviceId, dataType]);

  const loadHistoricalData = async () => {
    try {
      const response = await fetch(
        `/api/realtime/graph/${deviceId}?timeRange=1h&dataType=${dataType}&limit=50`
      );
      const result = await response.json();

      if (result.success) {
        const formattedData = result.data.dataPoints.map(point => ({
          x: point.timestamp,
          y: point[dataType]
        }));
        setGraphData(formattedData);
      }
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const chartData = {
    datasets: [{
      label: `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`,
      data: graphData,
      borderColor: getColorForDataType(dataType),
      backgroundColor: getColorForDataType(dataType, 0.1),
      tension: 0.1,
      pointRadius: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm'
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: getUnitForDataType(dataType)
        }
      }
    },
    animation: {
      duration: 300
    },
    plugins: {
      legend: {
        display: true
      },
      title: {
        display: true,
        text: `Real-time ${dataType} - ${deviceId}`
      }
    }
  };

  return (
    <div className="realtime-graph">
      <div className="graph-header">
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Live' : '🔴 Disconnected'}
        </div>
        <div className="data-count">
          {graphData.length} data points
        </div>
      </div>

      <div className="graph-container" style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const getColorForDataType = (dataType, alpha = 1) => {
  const colors = {
    temperature: `rgba(255, 99, 132, ${alpha})`,
    humidity: `rgba(54, 162, 235, ${alpha})`,
    gasLevel: `rgba(255, 206, 86, ${alpha})`,
    voltage: `rgba(75, 192, 192, ${alpha})`,
    current: `rgba(153, 102, 255, ${alpha})`
  };
  return colors[dataType] || `rgba(128, 128, 128, ${alpha})`;
};

const getUnitForDataType = (dataType) => {
  const units = {
    temperature: '°C',
    humidity: '%',
    gasLevel: 'ppm',
    voltage: 'V',
    current: 'A',
    pressure: 'hPa'
  };
  return units[dataType] || '';
};

export default RealtimeGraph;
```

### Multi-Device Dashboard

```jsx
import React, { useState, useEffect } from 'react';
import RealtimeGraph from './RealtimeGraph';

const MultiDeviceDashboard = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDataType, setSelectedDataType] = useState('temperature');

  useEffect(() => {
    // Load devices
    fetch('/api/devices')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setDevices(data.data);
        }
      });
  }, []);

  return (
    <div className="multi-device-dashboard">
      <div className="dashboard-header">
        <h2>Real-time Sensor Dashboard</h2>
        <select
          value={selectedDataType}
          onChange={(e) => setSelectedDataType(e.target.value)}
        >
          <option value="temperature">Temperature</option>
          <option value="humidity">Humidity</option>
          <option value="gasLevel">Gas Level</option>
          <option value="voltage">Voltage</option>
          <option value="current">Current</option>
        </select>
      </div>

      <div className="graphs-grid">
        {devices.map(device => (
          <div key={device.deviceId} className="graph-card">
            <RealtimeGraph
              deviceId={device.deviceId}
              dataType={selectedDataType}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiDeviceDashboard;
```

### JavaScript (Non-React) Example

```javascript
// Initialize socket connection
const socket = io('http://localhost:5000');

// Chart.js setup
const ctx = document.getElementById('realtimeChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: 'Temperature',
      data: [],
      borderColor: 'rgb(255, 99, 132)',
      tension: 0.1
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          displayFormats: {
            minute: 'HH:mm'
          }
        }
      }
    },
    animation: {
      duration: 300
    }
  }
});

// Subscribe to device data
socket.emit('subscribe:device', 'STM32_001');

// Handle real-time graph points
socket.on('graph-point', (data) => {
  if (data.deviceId === 'STM32_001') {
    // Add new data point
    chart.data.datasets[0].data.push({
      x: data.data.timestamp,
      y: data.data.temperature
    });

    // Keep only last 50 points
    if (chart.data.datasets[0].data.length > 50) {
      chart.data.datasets[0].data.shift();
    }

    // Update chart
    chart.update('none');
  }
});

// Handle device status updates
socket.on('device-status', (data) => {
  const statusElement = document.getElementById('device-status');
  statusElement.textContent = `Device ${data.deviceId}: ${data.status}`;
  statusElement.className = `status ${data.status}`;
});

// Handle alerts
socket.on('alert', (data) => {
  const alertElement = document.getElementById('alerts');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${data.alert.status.toLowerCase()}`;
  alertDiv.innerHTML = `
    <strong>${data.alert.alertType}</strong>
    <p>${data.alert.message}</p>
    <small>${new Date(data.timestamp).toLocaleString()}</small>
  `;
  alertElement.prepend(alertDiv);
});
```

## Testing Real-time System

### Start Simulated Data Stream
```bash
# Start simulated data for testing
curl -X POST http://localhost:5000/api/realtime/simulate/start \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "STM32_001", "interval": 2000}'

# Stop simulated data
curl -X DELETE http://localhost:5000/api/realtime/simulate/stop/STM32_001
```

### Test WebSocket Connection
```javascript
// Test WebSocket connection
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected to server');

  // Subscribe to all devices
  socket.emit('subscribe:all-devices');
});

socket.on('sensor-data', (data) => {
  console.log('Received sensor data:', data);
});

socket.on('graph-point', (data) => {
  console.log('Received graph point:', data);
});
```

## Performance Considerations

### Backend Optimizations
- **Data Limiting**: Automatic limit of 500 data points per query
- **Efficient Queries**: Indexed database queries with time ranges
- **WebSocket Rooms**: Targeted broadcasting to subscribed clients only
- **Memory Management**: Automatic cleanup of old data streams

### Frontend Optimizations
- **Chart Performance**: Use Chart.js with animation duration limits
- **Data Buffering**: Keep only recent data points in memory
- **Connection Management**: Proper WebSocket cleanup on component unmount
- **Update Throttling**: Limit chart update frequency to prevent performance issues

### Recommended Settings
- **Update Interval**: 2-5 seconds for real-time updates
- **Data Points**: Maximum 100 points displayed on charts
- **Time Range**: Default 1-hour window for real-time graphs
- **Chart Animation**: 300ms or less for smooth updates

## Production Deployment

### Environment Variables
```env
# Client URL for CORS
CLIENT_URL=https://your-frontend-domain.com

# WebSocket configuration
WEBSOCKET_CORS_ORIGINS=https://your-frontend-domain.com
```

### Scaling Considerations
- **Redis Adapter**: Use Redis for multi-server WebSocket scaling
- **Load Balancing**: Sticky sessions for WebSocket connections
- **Database Optimization**: Time-series database for sensor data
- **CDN**: Static assets and API caching

This real-time graph system provides a complete foundation for displaying constantly updated sensor data visualizations in your RelaWand dashboard, with support for multiple devices, different data types, and real-time alerts.