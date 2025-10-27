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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: Include cookies in cross-origin requests
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Login berhasil, redirect ke beranda
        console.log('Login successful, redirecting to /beranda');
        window.location.href = '/beranda'; // Using window.location for reliable redirect
      } else {
        // Login gagal, tampilkan error
        setError(data.message || 'Login gagal! Periksa kembali data Anda.');
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