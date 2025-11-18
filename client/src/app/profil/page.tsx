"use client";

import { useState, useEffect } from 'react';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function ProfileContainer() {
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if in demo mode
    const demoMode = localStorage.getItem('demoMode');
    if (demoMode === 'true') {
      console.log('Demo mode active on profile page');
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
          window.location.href = '/login';
          return;
        }

        // Set user data from response
        if (data.user) {
          setUserData(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login';
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);

    // Check if in demo mode
    const demoMode = localStorage.getItem('demoMode');
    if (demoMode === 'true') {
      // Clear demo mode data
      localStorage.removeItem('demoMode');
      localStorage.removeItem('demoUser');
      window.location.href = '/login';
      return;
    }

    try {
      await fetch('http://localhost:5000/login/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-pulse text-[#567C8D] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white py-8">
      {/* Container Profil */}
      <div className="relative w-[600px] h-auto max-w-[90vw] my-8">
        {/* Background Box with shadow */}
        <div className="absolute w-full h-full bg-[#C8D9E6] opacity-50 border border-black shadow-[0px_5px_5px_5px_rgba(0,0,0,0.25)] rounded-[50px]"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-12 pb-12 px-8">
          {/* Title Profil Akun */}
          <h1 className="text-[40px] font-black text-[#2F4156] mb-8" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Profil Akun
          </h1>

          {/* Profile Data */}
          <div className="w-full max-w-[480px] space-y-6">
            {/* Nama */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Nama
              </label>
              <div className="w-full h-[52px] px-6 bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] flex items-center justify-center">
                <span className="text-lg text-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {userData?.name || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Email
              </label>
              <div className="w-full h-[52px] px-6 bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] flex items-center justify-center">
                <span className="text-lg text-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {userData?.email || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Role */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 text-center" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Role
              </label>
              <div className="w-full h-[52px] px-6 bg-white shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] flex items-center justify-center">
                <span className="text-lg text-black" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  {userData?.role || 'Loading...'}
                </span>
              </div>
            </div>

            {/* Button Log Out */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-[280px] h-[52px] bg-[#567C8D] hover:bg-[#476b7a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-[30px] text-white text-[24px] font-semibold flex items-center justify-center"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {isLoading ? 'Memuat...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}