// src/app/histori-peringatan/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AlertCard from '@/components/AlertCard';

type AlertLevel = 'NORMAL' | 'SIAGA' | 'DARURAT';

interface Alert {
  id: string;
  level: AlertLevel;
  deviceName: string;
  temperature: number;
  humidity: number;
  gasConcentration: number;
  date: string;
  time: string;
  timestamp: number;
}

export default function HistoriPeringatanPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk menentukan level alert
  const determineAlertLevel = (temp: number, gas: number): AlertLevel => {
    if (temp > 40 || gas > 600) return 'DARURAT';
    if ((temp >= 36 && temp <= 40) || (gas >= 300 && gas <= 600)) return 'SIAGA';
    return 'NORMAL';
  };

  // Generate dummy alerts
  const generateDummyAlerts = (): Alert[] => {
    const dummyAlerts: Alert[] = [];
    const now = new Date();

    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - Math.floor(i / 3));
      date.setHours(date.getHours() - i);
      date.setMinutes(Math.floor(Math.random() * 60));

      const random = Math.random();
      let temp: number, gas: number;

      if (random < 0.3) {
        // 30% DARURAT
        temp = Math.floor(Math.random() * 8) + 40; // 40-48°C
        gas = Math.floor(Math.random() * 400) + 600; // 600-1000 ppm
      } else if (random < 0.6) {
        // 30% SIAGA
        temp = Math.floor(Math.random() * 5) + 36; // 36-40°C
        gas = Math.floor(Math.random() * 300) + 300; // 300-600 ppm
      } else {
        // 40% NORMAL (skip)
        temp = Math.floor(Math.random() * 17) + 18;
        gas = Math.floor(Math.random() * 300);
      }

      const humidity = Math.floor(Math.random() * 40) + 30;
      const level = determineAlertLevel(temp, gas);

      if (level !== 'NORMAL') {
        dummyAlerts.push({
          id: `alert-${i}`,
          level,
          deviceName: `Tongkat RelaWand ${(i % 3) + 1}`,
          temperature: temp,
          humidity,
          gasConcentration: gas,
          date: date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
          time: date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit'
          }) + ' WIB',
          timestamp: date.getTime()
        });
      }
    }

    return dummyAlerts.sort((a, b) => b.timestamp - a.timestamp);
  };

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (!data.authenticated) {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();

    // Load alerts
    const loadAlerts = async () => {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('http://localhost:5000/api/alerts', {
      //   credentials: 'include'
      // });
      // const data = await response.json();
      // setAlerts(data.alerts);

      // Dummy data
      const dummyData = generateDummyAlerts();
      setAlerts(dummyData);
      setIsLoading(false);
    };

    loadAlerts();

    // Simulate new alerts every 30 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const random = Math.random();
      
      let temp: number, gas: number;
      
      if (random < 0.4) {
        temp = Math.floor(Math.random() * 8) + 40;
        gas = Math.floor(Math.random() * 400) + 600;
      } else {
        temp = Math.floor(Math.random() * 5) + 36;
        gas = Math.floor(Math.random() * 300) + 300;
      }

      const humidity = Math.floor(Math.random() * 40) + 30;
      const level = determineAlertLevel(temp, gas);

      if (level !== 'NORMAL') {
        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          level,
          deviceName: `Tongkat RelaWand ${Math.floor(Math.random() * 3) + 1}`,
          temperature: temp,
          humidity,
          gasConcentration: gas,
          date: now.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          }),
          time: now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit'
          }) + ' WIB',
          timestamp: now.getTime()
        };

        setAlerts(prev => [newAlert, ...prev].slice(0, 20));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-pulse text-[#567C8D] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <h1 
          className="text-4xl font-black text-[#2F4156] mb-8 text-center"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          Histori Peringatan
        </h1>

        {/* Alert List */}
        <div className="space-y-6 mb-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#567C8D] mx-auto mb-4"></div>
              <p className="text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Memuat histori peringatan...
              </p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p 
                className="text-gray-500 text-xl"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Tidak ada peringatan saat ini
              </p>
              <p 
                className="text-gray-400 text-sm mt-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Semua sistem dalam kondisi normal
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                level={alert.level as 'SIAGA' | 'DARURAT'}
                deviceName={alert.deviceName}
                temperature={alert.temperature}
                humidity={alert.humidity}
                gasConcentration={alert.gasConcentration}
                date={alert.date}
                time={alert.time}
              />
            ))
          )}
        </div>

        {/* Legend */}
        <div className="bg-[#567C8D]/10 rounded-2xl p-8">
          <h3 
            className="text-2xl font-bold text-[#2F4156] mb-6 text-center"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Keterangan Tingkat Peringatan
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Normal */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <h4 
                  className="text-xl font-bold text-green-600"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  NORMAL
                </h4>
              </div>
              <ul 
                className="text-base space-y-2 text-gray-700"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Suhu: 18-35°C</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Kelembapan: 30-70%</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gas: {'<'} 300 ppm</span>
                </li>
              </ul>
            </div>

            {/* Siaga */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#FFAE00]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h4 
                  className="text-xl font-bold text-[#FFAE00]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  SIAGA
                </h4>
              </div>
              <ul 
                className="text-base space-y-2 text-gray-700"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Suhu: 36-40°C</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gas: 300-600 ppm</span>
                </li>
              </ul>
            </div>

            {/* Darurat */}
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-[#FF0000]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚨</span>
                </div>
                <h4 
                  className="text-xl font-bold text-[#FF0000]"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  DARURAT
                </h4>
              </div>
              <ul 
                className="text-base space-y-2 text-gray-700"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Suhu: {'>'} 40°C</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Gas: {'>'} 600 ppm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Info Text */}
          <div className="mt-6 text-center">
            <p 
              className="text-sm text-gray-600"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              💡 Peringatan otomatis dibuat ketika sensor mendeteksi kondisi SIAGA atau DARURAT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}