"use client";

import { useEffect, useState } from 'react';
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
  const [timeRange, setTimeRange] = useState<number>(24); // hours

  // Real-time updates via MQTT
  const { data: mqttData, isConnected } = useMqttContext();

  useEffect(() => {
    if (!locationId) return;

    const fetchData = async () => {
      try {
        // Fetch data based on time range
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/sensor-data/${locationId}?hours=${timeRange}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const apiData = await response.json();

          // Transform to chart format
          const chartData = apiData.map((item: {
            timestamp: string | Date;
            gas_ppm?: number;
            gas_adc?: number;
            voltage?: number;
            alarm?: boolean;
          }) => ({
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

    fetchData();

    // Refresh every 1 minute to keep data up to date
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, [locationId, timeRange]);

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
      setCurrentGasPPM(mqttData.gas_ppm || 0);
      setCurrentVoltage(mqttData.voltage || 0);
      setCurrentAlarm(mqttData.alarm || false);
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
          Perubahan Konsentrasi Gas
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
          <ResponsiveContainer width="100%" height="100%" key={`chart-${timeRange}-${data.length}`}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                interval="preserveStartEnd"
                tick={{ fontSize: 11 }}
                height={60}
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
                formatter={(value: number | string, name: string) => [`${value} ppm`, name]}
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
        {isConnected ? '🟢 Live' : '🔴 Offline'} • Data diperbarui secara real-time • Menampilkan {timeRange} jam terakhir
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