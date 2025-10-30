"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
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
    // Generate dummy data (7 hari terakhir)
    const generateDummyData = () => {
      const dummyData: ChartData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        dummyData.push({
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          temperature: Math.floor(Math.random() * (35 - 25) + 25), // 25-35°C
          humidity: Math.floor(Math.random() * (90 - 60) + 60), // 60-90%
        });
      }

      return dummyData;
    };

    const initialData = generateDummyData();
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
        
        const today = new Date();
        newData.push({
          date: today.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          temperature: Math.floor(Math.random() * (35 - 25) + 25),
          humidity: Math.floor(Math.random() * (90 - 60) + 60),
        });

        const latest = newData[newData.length - 1];
        setCurrentTemp(latest.temperature);
        setCurrentHumidity(latest.humidity);

        return newData;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#567C8D]/15 rounded-[25px] p-8">
      {/* Title */}
      <h2 
        className="text-3xl font-bold text-black text-center mb-6"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Perubahan Suhu dan Kelembapan
      </h2>

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-6">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
            />
            <YAxis 
              yAxisId="left"
              label={{ value: 'Suhu (Celcius)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
              domain={[20, 40]}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              label={{ value: 'Kelembapan (%)', angle: 90, position: 'insideRight', style: { fontSize: 14 } }}
              domain={[30, 100]}
            />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="temperature" 
              stroke="#FF6B6B" 
              strokeWidth={2}
              name="Suhu (°C)"
              dot={{ r: 4 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="humidity" 
              stroke="#4ECDC4" 
              strokeWidth={2}
              name="Kelembapan (%)"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Values */}
      <div className="flex justify-around mt-6">
        <p 
          className="text-2xl font-semibold text-black"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Suhu saat ini: <span className="text-[#FF6B6B]">{currentTemp}°C</span>
        </p>
        <p 
          className="text-2xl font-semibold text-black"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Kelembapan saat ini: <span className="text-[#4ECDC4]">{currentHumidity}%</span>
        </p>
      </div>
    </div>
  );
}

/*
USAGE:
import TemperatureHumidityChart from '@/components/TemperatureHumidityChart';

<TemperatureHumidityChart />

NOTES:
- Menggunakan recharts library untuk grafik
- Data dummy di-generate otomatis
- Auto-update setiap 5 detik
- Untuk production, ganti dengan real API call
*/