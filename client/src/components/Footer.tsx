'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#567C8D] text-white py-4 mt-auto rounded-t-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-4">
          {/* Kontak Darurat Section */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg mb-3">Kontak Darurat</h3>
            <div className="space-y-2 text-sm md:text-base">
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold whitespace-nowrap">113</span>
                <span className="truncate">Pemadam Kebakaran</span>
              </div>
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold whitespace-nowrap">129</span>
                <span className="truncate">Posko Bencana Alam</span>
              </div>
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold whitespace-nowrap">081221237575</span>
                <span className="truncate">BNPB</span>
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2 text-sm md:text-base md:pt-10">
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold whitespace-nowrap">115</span>
                <span className="truncate">Basarnas</span>
              </div>
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold whitespace-nowrap">110</span>
                <span className="truncate">Polisi</span>
              </div>
              <div className="flex items-center gap-3 md:gap-8">
                <span className="font-semibold whitespace-nowrap">123</span>
                <span className="truncate">PLN</span>
              </div>
            </div>
          </div>

          {/* Pihak Terkait Section */}
          <div className="flex-0.5 min-w-0">
            <h3 className="font-semibold text-base md:text-lg mb-3">Pihak Terkait</h3>
            <div className="space-y-2 text-sm md:text-base">
              <div className="break-words">Badan Nasional Penanggulangan Bencana (BNPB)</div>
              <div className="break-words">Kementerian Lingkungan Hidup dan Kehutanan (KLHK)</div>
              <div className="break-words">Lembaga Pencegahan dan Pemberantasan Kerusakan Hutan (LPPH)</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}