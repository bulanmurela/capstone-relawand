"use client";

import { useState } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface Props {
    locationId?: number | string;
}

export default function ForestCamera({ locationId }: Props) {
  const { showNotification } = useNotification();
  const [isActive, setIsActive] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivateCamera = async () => {
    setIsLoading(true);
    
    try {
      // Simulate camera activation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API call to camera
      // const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/camera/capture', {
      //   method: 'POST',
      //   credentials: 'include'
      // });
      // const data = await response.json();
      // setImageUrl(data.imageUrl);
      
      // For demo: use placeholder image
      setImageUrl(`https://picsum.photos/700/380?random=${Date.now()}`);
      setIsActive(true);
    } catch (error) {
      console.error('Failed to activate camera:', error);
      showNotification('error', 'Gagal mengaktifkan kamera');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#567C8D]/15 rounded-[25px] p-8">
      {/* Title */}
      <h2 
        className="text-2xl font-bold text-black text-center mb-6"
        style={{ fontFamily: 'Nunito, sans-serif' }}
      >
        Gambar Lingkungan Hutan
      </h2>

      {/* Image Container */}
      <div className="bg-[#D9D9D9] rounded-[20px] w-full h-auto flex items-center justify-center relative overflow-hidden">
        {imageUrl && isActive ? (
          <img 
            src={imageUrl} 
            alt="Forest environment" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="w-24 h-24 text-gray-400"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" 
              />
            </svg>
            <p 
              className="text-gray-500 mt-4 text-lg"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {isLoading ? 'Mengaktifkan kamera...' : 'Kamera belum aktif'}
            </p>
          </div>
        )}

        {/* Timestamp overlay when active */}
        {isActive && imageUrl && (
          <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
            {new Date().toLocaleString('id-ID')}
          </div>
        )}
      </div>

      {/* Activate Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleActivateCamera}
          disabled={isLoading}
          className="bg-[#567C8D] hover:bg-[#476b7a] disabled:bg-gray-400 text-white px-8 py-4 rounded-[30px] text-xl font-semibold transition-colors flex items-center gap-3"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengaktifkan...
            </>
          ) : (
            <>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" 
                />
              </svg>
              {isActive ? 'Perbarui Gambar' : 'Aktifkan Kamera'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/*
USAGE:
import ForestCamera from '@/components/ForestCamera';

<ForestCamera />

NOTES:
- Untuk demo menggunakan placeholder image dari picsum.photos
- Untuk production, ganti dengan actual camera API endpoint
- Menampilkan timestamp saat gambar diambil
- Button bisa digunakan untuk refresh gambar
*/