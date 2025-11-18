'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/beranda' },
    { name: 'Monitoring', path: '/grafik-pemantauan' },
    { name: 'Alerts', path: '/histori-alert' },
    { name: 'Logs', path: '/log' },
    { name: 'Profile', path: '/profil' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-40 h-12 flex items-center justify-center">
              <Image
                src="/element-logo/LogoRelaWand.png"
                alt="RelaWand Logo"
                width={140}
                height={50}
                className="object-contain"
              />
            </div>
            <div className="hidden lg:block border-l border-gray-300 pl-3">
              <div className="text-gray-900 font-semibold text-base">RelaWand</div>
              <div className="text-gray-500 text-xs">IoT Monitoring System</div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-50 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 text-xs font-medium">Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}