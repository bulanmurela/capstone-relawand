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
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Login berhasil, redirect ke beranda
        router.push("/beranda");
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
    <div className="flex items-center justify-center max-h-screen bg-white py-10">
      {/* Container Login */}
      <div className="relative w-[700px] h-[827px] scale-75">
        {/* Background Box with shadow */}
        <div className="absolute w-full h-full bg-white opacity-50 border border-black shadow-[0px_5px_5px_5px_rgba(0,0,0,0.25)] rounded-[50px]"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-16">
          {/* Title MASUK */}
          <h1 className="text-[48px] font-black text-[#2F4156] mb-8" style={{ fontFamily: 'Nunito, sans-serif' }}>
            MASUK
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-[550px] space-y-8">
            {/* Form Nama */}
            <div className="relative">
              <label className="block text-2xl font-bold text-black mb-2 ml-7" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Nama
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Admin Putra"
                className="w-full h-[60px] px-7 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-xl"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Form Email */}
            <div className="relative">
              <label className="block text-2xl font-bold text-black mb-2 ml-7" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="putrapetugaspantau@relawand.com"
                className="w-full h-[60px] px-7 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-xl"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Form Password */}
            <div className="relative">
              <label className="block text-2xl font-bold text-black mb-2 ml-7" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="************"
                className="w-full h-[60px] px-7 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-xl"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Form Role */}
            <div className="relative">
              <label className="block text-2xl font-bold text-black mb-2 ml-7" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Petugas Pantau"
                className="w-full h-[60px] px-7 bg-white border-[0.5px] border-black shadow-[0px_0px_4px_2px_rgba(0,0,0,0.25)] rounded-[25px] text-xl"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              />
            </div>

            {/* Button Masuk */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-[300px] h-[60px] bg-[#567C8D] hover:bg-[#476b7a] transition-colors rounded-[30px] text-white text-[28px] font-semibold flex items-center justify-center"
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