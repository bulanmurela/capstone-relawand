"use client";

import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMqttContext } from '@/contexts/MqttContext';

interface GasData {
  time: string;
  gas_ppm: number;
  gas_adc: number;
  voltage: number;
  alarm: boolean;
}
interface Props {
    locationId?: number | string;
}

export default function GasConcentrationChart({ locationId }: Props ) {
  const [data, setData] = useState<GasData[]>([]);
  const [currentGasPPM, setCurrentGasPPM] = useState(0);
  const [currentVoltage, setCurrentVoltage] = useState(0);
  const [currentAlarm, setCurrentAlarm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Real-time updates via MQTT
  const { data: mqttData, isConnected } = useMqttContext();

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch last 50 data points (most recent records)
      const response = await fetch(
        `http://localhost:5000/api/sensor-data/${locationId}?limit=50`,
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
          gas_ppm: item.gas_ppm || 0,
          gas_adc: item.gas_adc || 0,
          voltage: item.voltage || 0,
          alarm: item.alarm || false
        }));

        setData(chartData);

        // Set current values
        if (chartData.length > 0) {
          const latest = chartData[chartData.length - 1];
          setCurrentGasPPM(latest.gas_ppm);
          setCurrentVoltage(latest.voltage);
          setCurrentAlarm(latest.alarm);
        }
      }
    } catch (error) {
      console.error('Error fetching gas data:', error);
    }
  };

  if (locationId) {
    fetchData();

    // Refresh every 1 minute to keep data up to date
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }
}, [locationId]);

  // Handle real-time MQTT sensor data updates
  useEffect(() => {
    // Only update if MQTT data is for this specific device
    if (mqttData && mqttData.device_id === locationId) {
      const newDataPoint: GasData = {
        time: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        gas_ppm: mqttData.gas_ppm || 0,
        gas_adc: mqttData.gas_adc || 0,
        voltage: mqttData.voltage || 0,
        alarm: mqttData.alarm || false
      };

      // Update chart data with new point (keep last 50 points)
      setData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        return updatedData.slice(-50); // Keep only last 50 data points
      });

      // Update current values
      setCurrentGasPPM(mqttData.gas_ppm || 0);
      setCurrentVoltage(mqttData.voltage || 0);
      setCurrentAlarm(mqttData.alarm || false);

      // Auto-scroll to the right to show latest data
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            left: scrollContainerRef.current.scrollWidth,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [mqttData, locationId]);

  // Calculate chart width based on data points (25px per point for better visibility)
  const chartWidth = Math.max(data.length * 25, 1000);

  return (
    <div className="bg-[#567C8D]/15 rounded-[25px] p-6">
      {/* Title */}
      <h2
        className="text-2xl font-bold text-black text-center mb-4"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Perubahan Konsentrasi Gas
      </h2>

      {/* Chart Container with Horizontal Scroll */}
      <div
        ref={scrollContainerRef}
        className="chart-scroll-container bg-white rounded-lg p-2 overflow-x-auto overflow-y-hidden scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#567C8D #e5e7eb'
        }}
      >
        <div style={{ minWidth: `${chartWidth}px`, height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 12 }}
                height={80}
              />
              <YAxis
                label={{ value: 'Konsentrasi Gas (ppm)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                domain={[0, 'auto']}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'ADC Value', angle: 90, position: 'insideRight', style: { fontSize: 14 } }}
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #567C8D',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => `Waktu: ${value}`}
                formatter={(value: any, name: string) => [`${value} ppm`, name]}
              />
              <Legend
                wrapperStyle={{ bottom: 0, paddingTop: '2px' }}
              />
              <Line
                type="monotone"
                dataKey="gas_ppm"
                stroke="#567C8D"
                strokeWidth={3}
                name="Gas (ppm)"
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="gas_adc"
                stroke="#FFAE00"
                strokeWidth={2}
                name="Gas ADC"
                dot={{ r: 4 }}
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Values */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
          <p
            className="text-sm font-semibold text-black mb-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Gas Saat Ini
          </p>
          <p
            className="text-xl font-bold text-[#567C8D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentGasPPM} ppm
          </p>
        </div>
        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
          <p
            className="text-sm font-semibold text-black mb-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Tegangan Sensor
          </p>
          <p
            className="text-xl font-bold text-[#4CAF50]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentVoltage.toFixed(3)}V
          </p>
        </div>
        <div className={`text-center rounded-lg p-2 shadow-sm ${currentAlarm ? 'bg-red-50' : 'bg-white'}`}>
          <p
            className="text-sm font-semibold text-black mb-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Status Alarm
          </p>
          <p
            className={`text-xl font-bold ${currentAlarm ? 'text-red-600' : 'text-green-600'}`}
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentAlarm ? '🚨 ALARM' : '✓ Normal'}
          </p>
        </div>
      </div>

      {/* Info Text */}
      <p
        className="text-center text-gray-600 text-sm mt-2"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        {isConnected ? '🟢 Live' : '🔴 Offline'} • Data diperbarui secara real-time • Menampilkan 50 data terakhir
      </p>
    </div>
  );
}

/*
USAGE:
import GasConcentrationChart from '@/components/GasConcentrationChart';

<GasConcentrationChart />

NOTES:
- Memantau 3 jenis gas: CO, CO2, LPG
- Data dummy di-generate otomatis
- Auto-update setiap 5 detik
- Untuk production, ganti dengan real API call
*/