'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Beranda', path: '/homepage' },
    { name: 'Grafik Pemantauan', path: '/grafik-pemantauan' },
    { name: 'Histori Peringatan', path: '/histori-alert' },
    { name: 'Profil', path: '/profil' },
  ];

  return (
    <nav className="bg-[#C8D9E6] shadow-md sticky top-0 z-50 w-full rounded-b-xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-30 h-16 rounded-md flex items-center justify-center">
              <Image
                src="/element-logo/LogoRelaWand.png"
                alt="RelaWand Logo"
                width={160}
                height={72}
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-[#2F4156] text-base transition-all ${
                  pathname === item.path
                    ? 'font-extrabold'
                    : 'font-normal hover:font-semibold'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}