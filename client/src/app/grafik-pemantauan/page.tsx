// src/app/grafik-pemantauan/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LocationHeader from '@/components/LocationHeader';
import GrafikTempHum from '@/components/GrafikTempHum';
import GrafikGas from '@/components/GrafikGas';
import KontainerGambar from '@/components/KontainerGambar';
import DeviceSelector from '@/components/DeviceSelector';

interface LocationData {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export default function GrafikPemantauanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [devices, setDevices] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
          method: 'GET',
          credentials: 'include',
        });

        // FIXED: Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got:', contentType);
          router.push('/login');
          return false;
        }

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

    const fetchDevices = async () => {
        try {
        const response = await fetch('http://localhost:5000/devices', {
            credentials: 'include'
        });

        // FIXED: Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Expected JSON but got:', contentType);
          router.push('/login');
          return;
        }
        
        if (response.ok) {
            const data = await response.json();
            
            // Convert API format
            const deviceLocations = data.map((device: any) => ({
            id: device._id,
            name: device.name,
            lat: device.latitude,
            lng: device.longitude
            }));
            
            setDevices(deviceLocations);
            
            // Get device ID from query params
            const deviceId = searchParams?.get('id');
            
            if (deviceId) {
            const location = deviceLocations.find((loc: any) => loc.id === deviceId);
            if (location) {
                setSelectedLocation(location);
                setShowSelector(false);
            } else {
                setShowSelector(true);
            }
            } else {
            setShowSelector(true);
            }
        }
        } catch (error) {
        console.error('Failed to fetch devices:', error);
        setShowSelector(true);
        } finally {
        setLoading(false); // FIXED: Set loading false after fetch
      }
    };

    // FIXED: Run sequentially
    const initialize = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchDevices();
      } else {
        setLoading(false);
      }
    };

        initialize();
    }, [router, searchParams]);

    const handleLocationSelect = (location: LocationData) => {
        setSelectedLocation(location);
        setShowSelector(false);
        // Update URL
        router.push(`/grafik-pemantauan?id=${location.id}`, { scroll: false });
    };

    const handleChangeDevice = () => {
        setShowSelector(true);
    };

  if (!mounted || !location) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-pulse text-[#567C8D] text-xl">Loading...</div>
      </div>
    );
  }

  if (showSelector || !selectedLocation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 
              className="text-4xl font-black text-[#2F4156] mb-4"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Pilih Tongkat Device Pemantau
            </h1>
            <p 
              className="text-lg text-gray-600"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Pilih tongkat device pemantau untuk melihat data grafik sensor
            </p>
          </div>

          <DeviceSelector 
            selectedId={selectedLocation?.id || null}
            onSelect={handleLocationSelect}
          />

          {/* Or go back to beranda */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/beranda')}
              className="text-[#567C8D] hover:text-[#476b7a] font-semibold flex items-center gap-2 mx-auto"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Location Header with Change Device Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <LocationHeader 
              name={selectedLocation.name}
              coordinates={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
            />
          </div>

        {/* Change Device Button */}
          <button
            onClick={handleChangeDevice}
            className="bg-[#567C8D] hover:bg-[#476b7a] text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-md"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" 
              />
            </svg>
            Ganti Tongkat
          </button>
        </div>

        {/* Charts Grid - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Temperature & Humidity Chart */}
          <div>
            <GrafikTempHum locationId={selectedLocation.id} />
          </div>

          {/* Gas Concentration Chart */}
          <div>
            <GrafikGas locationId={selectedLocation.id} />
          </div>
        </div>

        {/* Forest Camera - Full width */}
        <div className="mb-6">
          <KontainerGambar locationId={selectedLocation.id} />
        </div>
      </div>
    </div>
  );
}