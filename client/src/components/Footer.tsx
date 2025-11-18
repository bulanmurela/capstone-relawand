'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-cyan-500/20 bg-gradient-to-b from-slate-900 to-slate-950 text-white py-8">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Emergency Contacts */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              Emergency Contacts
            </h3>
            <div className="space-y-2">
              {[
                { number: '113', name: 'Fire Department' },
                { number: '129', name: 'Disaster Center' },
                { number: '115', name: 'Search & Rescue' },
                { number: '110', name: 'Police' },
                { number: '123', name: 'PLN' },
                { number: '081221237575', name: 'BNPB' },
              ].map((contact) => (
                <div
                  key={contact.number}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <span className="font-mono font-bold text-cyan-400 text-sm">{contact.number}</span>
                  <span className="text-gray-300 text-sm">{contact.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related Organizations */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              Related Organizations
            </h3>
            <div className="space-y-3">
              {[
                { name: 'BNPB', full: 'National Disaster Management Agency' },
                { name: 'KLHK', full: 'Ministry of Environment and Forestry' },
                { name: 'LPPH', full: 'Forest Damage Prevention Agency' },
              ].map((org) => (
                <div
                  key={org.name}
                  className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="font-bold text-white text-sm">{org.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{org.full}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              System Information
            </h3>
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="text-xs text-gray-400 mb-1">Platform</div>
                <div className="font-bold text-white">RelaWand IoT Monitoring</div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="text-xs text-gray-400 mb-1">Version</div>
                <div className="font-mono font-bold text-emerald-400">v1.0.0</div>
              </div>
              <div className="px-4 py-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="text-xs text-gray-400 mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-emerald-400">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © 2025 RelaWand. IoT-based Landslide Monitoring System.
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Powered by</span>
              <span className="font-mono font-bold text-cyan-400">STM32</span>
              <span>•</span>
              <span className="font-mono font-bold text-blue-400">MQTT</span>
              <span>•</span>
              <span className="font-mono font-bold text-purple-400">Next.js</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}