"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/AlertContexts';
import "leaflet/dist/leaflet.css";
import dynamic from 'next/dynamic';

interface UserData {
  name: string;
  email: string;
  role: string;
}

const Map = dynamic(() => import("@/components/MapComponent"), { ssr: false });
const Weather = dynamic(() => import("@/components/Weather"), { ssr: false });

export default function Beranda() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const { showAlert } = useAlert();

  const testAlert = () => {
    showAlert({
      level: 'DARURAT',
      deviceName: 'RelaWand 1',
      temperature: 42,
      humidity: 45,
      gasConcentration: 700,
    });
  }

  useEffect(() => {
    setMounted(true);

    // Check if in demo mode
    const demoMode = localStorage.getItem('demoMode');
    if (demoMode === 'true') {
      console.log('Demo mode active, skipping authentication');
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUserData(JSON.parse(demoUser));
      }
      return;
    }

    // Check authentication with backend
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/login/check', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (!data.authenticated) {
          router.push('/login');
          return;
        }

        // Set user data from response
        if (data.user) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
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
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Lokasi Tongkat Section */}
          <div className="lg:col-span-3 bg-[#F5F5F5] rounded-3xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-[#2F4156] text-center mb-6"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Lokasi Tongkat
            </h2>

            <Map />


            {/* Info Text */}
            <p className="text-center text-gray-600 text-base italic" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Klik tanda lokasi untuk beralih ke halaman Grafik Pemantauan
            </p>
          </div>

          {/* Prakiraan Cuaca Section */}
          <div className="lg:col-span-2 bg-[#F5F5F5] rounded-3xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-[#2F4156] text-center mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Prakiraan Cuaca
            </h2>

            <Weather />

            {/* Info Text */}
            <p className="text-center text-gray-600 text-base italic mt-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Data prakiraan diperbarui setiap jam
            </p>
          </div>
          <div>
            <button onClick={testAlert}>
              {/* Test Alert SIAGA */}
            </button>
            {/* Rest of page content */}
          </div>
        </div>
      </div>
    </div>
  );
}