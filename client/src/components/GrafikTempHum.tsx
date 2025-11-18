"use client";

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMqttContext } from '@/contexts/MqttContext';

interface ChartData {
  time: string;
  temperature: number;
  humidity: number;
}

interface Props {
    locationId?: number | string;
}

export default function TemperatureHumidityChart({ locationId }: Props) {
  const [data, setData] = useState<ChartData[]>([]);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentHumidity, setCurrentHumidity] = useState(0);
  const [timeRange, setTimeRange] = useState<number>(24); // hours

  // Real-time updates via MQTT
  const { data: mqttData, isConnected } = useMqttContext();

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch data based on time range
      const response = await fetch(
        `http://localhost:5000/api/sensor-data/${locationId}?hours=${timeRange}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const apiData = await response.json();

        // Transform to chart format
        const chartData = apiData.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
          temperature: item.temperature || 0,
          humidity: item.humidity || 0
        }));

        setData(chartData);

        // Set current values
        if (chartData.length > 0) {
          const latest = chartData[chartData.length - 1];
          setCurrentTemp(latest.temperature);
          setCurrentHumidity(latest.humidity);
        }
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  if (locationId) {
    fetchData();

    // Refresh every 1 minute to keep data up to date
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }
}, [locationId, timeRange]);

  // Handle real-time MQTT sensor data updates
  useEffect(() => {
    // Only update if MQTT data is for this specific device
    if (mqttData && mqttData.device_id === locationId) {
      const newDataPoint: ChartData = {
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        temperature: mqttData.temperature || 0,
        humidity: mqttData.humidity || 0
      };

      // Update chart data with new point
      setData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        // Filter to keep only data within time range
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - timeRange);
        return updatedData.filter(point => {
          const [hours, minutes, seconds] = point.time.split(':').map(Number);
          const pointDate = new Date();
          pointDate.setHours(hours, minutes, seconds);
          return pointDate >= cutoffTime;
        });
      });

      // Update current values
      setCurrentTemp(mqttData.temperature || 0);
      setCurrentHumidity(mqttData.humidity || 0);
    }
  }, [mqttData, locationId, timeRange]);

  return (
    <div className="bg-[#567C8D]/15 rounded-[25px] p-6">
      {/* Title and Time Range Selector */}
      <div className="flex justify-between items-center mb-4">
        <h2
          className="text-2xl font-bold text-black"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Perubahan Suhu dan Kelembapan
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          <option value={1}>1 Jam</option>
          <option value={6}>6 Jam</option>
          <option value={12}>12 Jam</option>
          <option value={24}>24 Jam</option>
          <option value={48}>2 Hari</option>
          <option value={168}>7 Hari</option>
        </select>
      </div>

      {/* Chart Container - Fixed size, no scroll */}
      <div className="bg-white rounded-lg p-4">
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                interval="preserveStartEnd"
                tick={{ fontSize: 11 }}
                height={60}
              />
              <YAxis
                yAxisId="left"
                label={{ value: 'Suhu (Celcius)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                domain={[25, 'auto']}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Kelembapan (%)', angle: 90, position: 'insideRight', style: { fontSize: 14 } }}
                domain={[30, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #567C8D',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => `Waktu: ${value}`}
                formatter={(value: any, name: string) => {
                  if (name === 'Suhu (°C)') return [`${value}°C`, name];
                  if (name === 'Kelembapan (%)') return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ bottom: 0, paddingTop: '2px' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#FF6B6B"
                strokeWidth={2}
                name="Suhu (°C)"
                dot={{ r : 5}}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#567C8D"
                strokeWidth={2}
                name="Kelembapan (%)"
                dot={{ r : 5}}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Values */}
      <div className="flex justify-around mt-2">
        <p 
          className="text-lg font-semibold text-black"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Suhu saat ini: <span className="text-[#FF6B6B]">{currentTemp}°C</span>
        </p>
        <p 
          className="text-lg font-semibold text-black"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Kelembapan saat ini: <span className="text-[#567C8D]">{currentHumidity}%</span>
        </p>
      </div>
    
    {/* Info */}
      <div className="mt-2 text-center">
        <p
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {isConnected ? '🟢 Live' : '🔴 Offline'} • Data diperbarui secara real-time • Menampilkan {timeRange} jam terakhir
        </p>
      </div>
    </div>
  );
}