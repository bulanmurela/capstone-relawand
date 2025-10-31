"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  useEffect(() => {
    // Generate data untuk 24 jam terakhir (per 30 menit = 48 data points)
    const generateHourlyData = () => {
      const dummyData: ChartData[] = [];
      const now = new Date();
      
      // Generate 48 data points (24 jam × 2 = setiap 30 menit)
      for (let i = 47; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * 30 * 60 * 1000)); // 30 menit dalam ms
        
        dummyData.push({
          time: time.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          temperature: Math.floor(Math.random() * (35 - 25) + 25), // 25-35°C
          humidity: Math.floor(Math.random() * (90 - 60) + 60), // 60-90%
        });
      }

      return dummyData;
    };

    const initialData = generateHourlyData();
    setData(initialData);
    
    // Set current values
    const latest = initialData[initialData.length - 1];
    setCurrentTemp(latest.temperature);
    setCurrentHumidity(latest.humidity);

    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        newData.shift(); // Remove oldest
        
        const now = new Date();
        const newEntry = ({
          time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
          temperature: Math.floor(Math.random() * (35 - 25) + 25),
          humidity: Math.floor(Math.random() * (90 - 60) + 60),
        });

        newData.push(newEntry);
        setCurrentTemp(newEntry.temperature);
        setCurrentHumidity(newEntry.humidity);

        return newData;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [locationId]);

  return (
    <div className="bg-[#567C8D]/15 rounded-[25px] p-6">
      {/* Title */}
      <h2 
        className="text-2xl font-bold text-black text-center mb-4"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Perubahan Suhu dan Kelembapan
      </h2>

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-2">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              angle={-45}
              textAnchor="end"
              interval={3}
              tick={{ fontSize: 12 }}
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
              dot={{ r : 6}}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="humidity" 
              stroke="#567C8D" 
              strokeWidth={2}
              name="Kelembapan (%)"
              dot={{ r : 6}}
            />
          </LineChart>
        </ResponsiveContainer>
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
          Data diperbarui setiap 30 detik • Menampilkan 24 jam terakhir
        </p>
      </div>
    </div>
  );
}