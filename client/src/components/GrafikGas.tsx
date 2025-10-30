"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GasData {
  date: string;
  co: number;
  co2: number;
  lpg: number;
}
interface Props {
    locationId?: number | string;
}

export default function GasConcentrationChart({ locationId }: Props ) {
  const [data, setData] = useState<GasData[]>([]);

  useEffect(() => {
    // Generate dummy data (7 hari terakhir)
    const generateDummyData = () => {
      const dummyData: GasData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        dummyData.push({
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          co: Math.floor(Math.random() * (150 - 50) + 50), // 50-150 ppm
          co2: Math.floor(Math.random() * (800 - 400) + 400), // 400-800 ppm
          lpg: Math.floor(Math.random() * (100 - 20) + 20), // 20-100 ppm
        });
      }

      return dummyData;
    };

    const initialData = generateDummyData();
    setData(initialData);

    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = [...prevData];
        newData.shift(); // Remove oldest
        
        const today = new Date();
        newData.push({
          date: today.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          co: Math.floor(Math.random() * (150 - 50) + 50),
          co2: Math.floor(Math.random() * (800 - 400) + 400),
          lpg: Math.floor(Math.random() * (100 - 20) + 20),
        });

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
        Perubahan Konsentrasi Gas
      </h2>

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-6">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
            />
            <YAxis 
              label={{ value: 'Konsentrasi Gas (ppm)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="co" 
              stroke="#FF6B6B" 
              strokeWidth={2}
              name="CO (ppm)"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="co2" 
              stroke="#95E1D3" 
              strokeWidth={2}
              name="CO2 (ppm)"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="lpg" 
              stroke="#F38181" 
              strokeWidth={2}
              name="LPG (ppm)"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Info Text */}
      <p 
        className="text-center text-gray-600 text-sm mt-4"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        (grafik perubahan konsentrasi gas dari data sensor)
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