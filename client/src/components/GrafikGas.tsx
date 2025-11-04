"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface GasData {
  time: string;
  co: number;
  co2: number;
  lpg: number;
}
interface Props {
    locationId?: number | string;
}

export default function GasConcentrationChart({ locationId }: Props ) {
  const [data, setData] = useState<GasData[]>([]);
  const [currentCO, setCurrentCO] = useState(0);
  const [currentCO2, setCurrentCO2] = useState(0);
  const [currentLPG, setCurrentLPG] = useState(0);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/sensor-data/${locationId}?hours=24`,
        { credentials: 'include' }
      );
      
      if (response.ok) {
        const apiData = await response.json();
        
        // Transform to chart format
        const chartData = apiData.map((item: any) => ({
          time: new Date(item.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          co: item.co,
          co2: item.co2,
          lpg: item.lpg
        }));
        
        setData(chartData);
        
        // Set current values
        if (chartData.length > 0) {
          const latest = chartData[chartData.length - 1];
          setCurrentCO(latest.co);
          setCurrentCO2(latest.co2);
          setCurrentLPG(latest.lpg);
        }
      }
    } catch (error) {
      console.error('Error fetching gas data:', error);
    }
  };

  fetchData();
  
  // Refresh every 5 minutes
  const interval = setInterval(fetchData, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, [locationId]);

  return (
    <div className="bg-[#567C8D]/15 rounded-[25px] p-6">
      {/* Title */}
      <h2 
        className="text-2xl font-bold text-black text-center mb-4"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Perubahan Konsentrasi Gas
      </h2>

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-2">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis 
              dataKey="time"
              angle={-45}
              textAnchor="end"
              interval={3}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={{ value: 'Konsentrasi Gas (ppm)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
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
              dataKey="co" 
              stroke="#FF6B6B" 
              strokeWidth={2}
              name="CO (ppm)"
              dot={{ r: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="co2" 
              stroke="#567C8D" 
              strokeWidth={2}
              name="CO2 (ppm)"
              dot={{ r: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="lpg" 
              stroke="#FFAE00" 
              strokeWidth={2}
              name="LPG (ppm)"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current Values */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
          <p 
            className="text-sm font-semibold text-black mb-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            CO Saat Ini
          </p>
          <p 
            className="text-xl font-bold text-[#FF6B6B]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentCO} ppm
          </p>
        </div>
        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
          <p 
            className="text-sm font-semibold text-black mb-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            CO2 Saat Ini
          </p>
          <p 
            className="text-xl font-bold text-[#567C8D]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentCO2} ppm
          </p>
        </div>
        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
          <p 
            className="text-sm font-semibold text-black mb-0"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            LPG Saat Ini
          </p>
          <p 
            className="text-xl font-bold text-[#FFAE00]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {currentLPG} ppm
          </p>
        </div>
      </div>

      {/* Info Text */}
      <p 
        className="text-center text-gray-600 text-sm mt-2"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Data diperbarui setiap 30 detik • Menampilkan 24 jam terakhir
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