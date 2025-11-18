'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Emergency Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Kontak Darurat
            </h3>
            <div className="space-y-2">
              {[
                { number: '119', name: 'SAR Nasional' },
                { number: '129', name: 'Posko Bencana' },
                { number: '081221237575', name: 'BNPB' },
              ].map((contact) => (
                <div key={contact.number} className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-blue-600 text-sm min-w-[100px]">
                    {contact.number}
                  </span>
                  <span className="text-gray-600 text-sm">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Organizations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Organisasi Terkait
            </h3>
            <div className="space-y-3">
              {[
                { name: 'BNPB', full: 'Badan Nasional Penanggulangan Bencana' },
                { name: 'KLHK', full: 'Kementerian Lingkungan Hidup dan Kehutanan' },
                { name: 'BPBD', full: 'Badan Penanggulangan Bencana Daerah' },
              ].map((org) => (
                <div key={org.name}>
                  <div className="font-semibold text-gray-900 text-sm">{org.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{org.full}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Informasi Sistem
            </h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Platform</div>
                <div className="font-semibold text-gray-900">RelaWand IoT Monitoring</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Versi</div>
                <div className="font-mono font-semibold text-gray-900">v1.0.0</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Operasional</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025 RelaWand. Sistem Monitoring Tanah Longsor Berbasis IoT.
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Didukung oleh</span>
              <span className="font-mono font-semibold text-gray-700">STM32</span>
              <span>•</span>
              <span className="font-mono font-semibold text-gray-700">MQTT</span>
              <span>•</span>
              <span className="font-mono font-semibold text-gray-700">Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}