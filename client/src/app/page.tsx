// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // setMounted(true);

    // Check if user is logged in
    const token = document.cookie.includes('auth-token');

    if (token) {
      router.replace('/beranda');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // if (!mounted) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-white">
  //       <div className="text-[#567C8D] text-xl">Loading...</div>
  //     </div>
  //   );
  // }

  // return (
  //   <div className="flex items-center justify-center min-h-screen bg-white">
  //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#567C8D]"></div>
  //   </div>
  // );
  return null;
}