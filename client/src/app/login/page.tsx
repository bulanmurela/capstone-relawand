"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Attempting login with:', {
      name: formData.name,
      email: formData.email,
      password: '***',
      role: formData.role
    });

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      body: JSON.stringify(formData),
    });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (responseData.success) {
        // Login berhasil, redirect ke beranda
        console.log('Login successful, redirecting to /beranda');
        window.location.href = '/beranda'; // Using window.location for reliable redirect
      } else {
        // Login gagal, tampilkan error
        setError(responseData.message || 'Login gagal! Periksa kembali data Anda.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Bypass login function with hardcoded valid credentials
  const handleBypassLogin = async () => {
    setIsLoading(true);
    setError('');

    const bypassCredentials = {
      name: 'Admin Putra',
      email: 'putrapetugaspantau@relawand.com',
      password: 'admin123',
      role: 'Petugas Pantau'
    };

    console.log('Attempting bypass login with:', bypassCredentials);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bypassCredentials),
      });

      console.log('Bypass response status:', response.status);
      const responseData = await response.json();
      console.log('Bypass response data:', responseData);

      if (responseData.success) {
        console.log('Bypass login successful, redirecting to /beranda');
        window.location.href = '/beranda';
      } else {
        setError(`Bypass login gagal: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Bypass login failed:', error);
      setError('Bypass login gagal. Silakan coba login manual.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo mode - skip authentication entirely
  const handleDemoMode = () => {
    console.log('Entering demo mode, redirecting to /beranda');
    // Set demo mode flag in localStorage
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoUser', JSON.stringify({
      name: 'Demo User',
      email: 'demo@relawand.com',
      role: 'Demo'
    }));
    window.location.href = '/beranda';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white py-8">
      {/* Container Login */}
      <div className="relative w-[600px] h-auto max-w-[90vw] my-8">
        {/* Background Box with shadow */}
        <div className="absolute w-full h-full bg-white opacity-50 border border-black shadow-[0px_5px_5px_5px_rgba(0,0,0,0.25)] rounded-[50px]"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-12 pb-12 px-8">
          {/* Title MASUK */}
          <h1 className="text-[40px] font-black text-[#2F4156] mb-6" style={{ fontFamily: 'Nunito, sans-serif' }}>
            MASUK
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-[480px] space-y-5">
            {/* Form Nama */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 ml-5" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Nama
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Admin Putra"
                required
                className="w-full h-[52px] px-6 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-lg"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Form Email */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 ml-5" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="putrapetugaspantau@relawand.com"
                required
                className="w-full h-[52px] px-6 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-lg"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Form Password */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 ml-5" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="············"
                required
                minLength={6}
                className="w-full h-[52px] px-6 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-lg"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Form Role */}
            <div className="relative">
              <label className="block text-xl font-bold text-black mb-2 ml-5" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Petugas Pantau"
                required
                className="w-full h-[52px] px-6 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-lg"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Button Masuk */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-[280px] h-[52px] bg-[#567C8D] hover:bg-[#476b7a] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-[30px] text-white text-[24px] font-semibold flex items-center justify-center"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>
            </div>

            {/* Bypass Login Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleBypassLogin}
                disabled={isLoading}
                className="w-[280px] h-[40px] bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors rounded-[25px] text-white text-[14px] font-medium flex items-center justify-center"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {isLoading ? "Memproses Bypass..." : "Bypass Login → Langsung ke Dashboard"}
              </button>
            </div>

            {/* Demo Mode Button */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleDemoMode}
                className="w-[280px] h-[40px] bg-blue-500 hover:bg-blue-600 transition-colors rounded-[25px] text-white text-[14px] font-semibold flex items-center justify-center gap-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                Mode Demo
              </button>
            </div>

            {/* Pesan Error */}
            {error && (
              <p className="text-red-500 text-center mt-4 text-lg font-medium">
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}