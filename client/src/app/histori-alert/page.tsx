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

  // Format date and time for display
  const formatDateTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB'
    };
  };

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/auth/check', {
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

    // Load alerts - only fetch alerts that were shown as popups
    const loadAlerts = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/alerts/history?limit=50', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.alerts) {
          // Transform alerts to match the expected format
          const transformedAlerts = data.alerts.map((alert: any) => {
            const { date, time } = formatDateTime(alert.viewedAt || alert.timestamp);
            return {
              id: alert._id,
              level: alert.level,
              deviceName: alert.deviceName,
              temperature: alert.temperature,
              humidity: alert.humidity,
              gasConcentration: alert.gasConcentration,
              date,
              time,
              timestamp: new Date(alert.viewedAt || alert.timestamp).getTime()
            };
          });
          setAlerts(transformedAlerts);
        }
      } catch (error) {
        console.error('Error fetching alert history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();

    // Refresh alerts every 30 seconds
    const interval = setInterval(() => {
      loadAlerts();
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
                  <span>Gas: {'<'} 1000 ppm</span>
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
                  <span>Gas: 1000-1500 ppm</span>
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
                  <span>Gas: {'>'} 1500 ppm</span>
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