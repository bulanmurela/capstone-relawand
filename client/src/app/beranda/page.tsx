"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function Beranda() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user is logged in
    const token = document.cookie.includes('auth-token');

    if (!token) {
      router.push('/login');
      return;
    }

    // Get user data from cookie
    const getUserData = () => {
      const cookies = document.cookie.split(';');
      const userDataCookie = cookies.find(c => c.trim().startsWith('user-data='));

      if (!userDataCookie) return null;

      try {
        const data = userDataCookie.split('=')[1];
        return JSON.parse(decodeURIComponent(data));
      } catch {
        return null;
      }
    };

    const data = getUserData();
    if (data) {
      setUserData(data);
    }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Lokasi Tongkat Section */}
          <div className="bg-[#F5F5F5] rounded-3xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-[#2F4156] text-center mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Lokasi Tongkat
            </h2>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl p-8 mb-6 flex items-center justify-center min-h-[300px] shadow-sm">
              <div className="text-center">
                {/* Map Pin Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M30 0C13.4315 0 0 13.4315 0 30C0 46.5685 30 80 30 80C30 80 60 46.5685 60 30C60 13.4315 46.5685 0 30 0Z" fill="#D91656"/>
                      <circle cx="30" cy="30" r="12" fill="white"/>
                    </svg>
                  </div>
                </div>
                <p className="text-[#2F4156] text-lg font-semibold mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Tongkat RelaWand 1
                </p>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Internasional map yang
                </p>
                <p className="text-gray-600 text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  dimuat dari API Maps
                </p>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-center text-gray-600 text-sm italic" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Klik tanda lokasi untuk beralih ke halaman Grafik Pemantauan
            </p>
          </div>

          {/* Prakiraan Cuaca Section */}
          <div className="bg-[#F5F5F5] rounded-3xl p-8 shadow-md">
            <h2 className="text-2xl font-bold text-[#2F4156] text-center mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Prakiraan Cuaca
            </h2>

            {/* Weather Card */}
            <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-2xl p-8 shadow-lg text-white">
              {/* Location and Date */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Wonosari, Gunungkidul,
                </h3>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  D.I.Yogyakarta
                </h3>
                <p className="text-sm opacity-90" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  28 Mei 2025, 20.09
                </p>
              </div>

              {/* Weather Icon and Temperature */}
              <div className="flex items-center justify-center mb-6">
                {/* Weather Icon - Partly Cloudy */}
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Sun */}
                    <circle cx="50" cy="45" r="20" fill="#FDB813"/>
                    {/* Sun rays */}
                    <path d="M50 15 L50 5 M50 85 L50 75 M20 45 L10 45 M80 45 L90 45 M28 28 L21 21 M72 28 L79 21 M28 62 L21 69 M72 62 L79 69" stroke="#FDB813" strokeWidth="3" strokeLinecap="round"/>

                    {/* Clouds */}
                    <ellipse cx="70" cy="65" rx="20" ry="15" fill="white" opacity="0.9"/>
                    <ellipse cx="85" cy="70" rx="18" ry="13" fill="white" opacity="0.9"/>
                    <ellipse cx="55" cy="70" rx="18" ry="13" fill="white" opacity="0.9"/>
                  </svg>
                </div>
              </div>

              {/* Temperature */}
              <div className="text-center mb-6">
                <div className="text-6xl font-black mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  22°C
                </div>
                <p className="text-sm" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Sebagian Berawan
                </p>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs mb-1 opacity-80" style={{ fontFamily: 'Nunito, sans-serif' }}>Kelembaban</p>
                  <p className="text-lg font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>80%</p>
                </div>
                <div>
                  <p className="text-xs mb-1 opacity-80" style={{ fontFamily: 'Nunito, sans-serif' }}>Kecepatan Angin</p>
                  <p className="text-lg font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>5 km/j ke Utara</p>
                </div>
                <div>
                  <p className="text-xs mb-1 opacity-80" style={{ fontFamily: 'Nunito, sans-serif' }}>Presipitasi</p>
                  <p className="text-lg font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>10%</p>
                </div>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-center text-gray-600 text-sm italic mt-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Data prakiraan diperbarui setiap jam
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
