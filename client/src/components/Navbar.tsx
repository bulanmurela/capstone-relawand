'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/beranda', icon: '📊' },
    { name: 'Monitoring', path: '/grafik-pemantauan', icon: '📈' },
    { name: 'Alerts', path: '/histori-alert', icon: '🚨' },
    { name: 'Logs', path: '/log', icon: '📡' },
    { name: 'Profile', path: '/profil', icon: '👤' },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-cyan-500/20'
          : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg'
      }`}
      style={{
        backgroundImage: scrolled ? 'none' : 'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative w-40 h-14 rounded-lg flex items-center justify-center backdrop-blur-sm bg-white/5 border border-white/10">
                <Image
                  src="/element-logo/LogoRelaWand.png"
                  alt="RelaWand Logo"
                  width={140}
                  height={60}
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-white font-bold text-lg tracking-tight">RelaWand</div>
              <div className="text-cyan-400 text-xs font-mono">IoT Monitoring System</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 group ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <span className="flex items-center gap-2">
                    <span className={`text-lg transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="hidden md:inline">{item.name}</span>
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <span className="text-emerald-400 text-xs font-mono font-semibold">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      {/* Decorative gradient line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </nav>
  );
}