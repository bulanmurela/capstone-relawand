"use client";

import { useEffect } from 'react';

type AlertLevel = 'SIAGA' | 'DARURAT';

interface AlertNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  level: AlertLevel;
  deviceName: string;
  temperature: number;
  humidity: number;
  gasConcentration: number;
}

export default function AlertNotificationModal({
  isOpen,
  onClose,
  level,
  deviceName,
  temperature,
  humidity,
  gasConcentration
}: AlertNotificationProps) {

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const alertColor = level === 'DARURAT' ? '#FF0000' : '#FFAE00';
  const levelText = level === 'DARURAT' ? 'DARURAT' : 'SIAGA';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[50px] shadow-[10px_10px_10px_rgba(0,0,0,0.4)] w-[90vw] max-w-[800px] max-h-[90vh] overflow-auto animate-scale-up">
        
        {/* Content */}
        <div className="p-2 text-center"
             style={{ transform: 'scale(0.9)' }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-black hover:text-gray-600 transition-colors z-10"
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={3} 
              stroke="currentColor" 
              className="w-8 h-8"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title */}
          <h2 
            className="text-3xl font-bold text-black mb-6"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Peringatan Kondisi
          </h2>

          {/* Alert Level - Big Text */}
          <h1 
            className="text-5xl md:text-7xl lg:text-9xl font-black leading-none mb-8"
            style={{ 
              fontFamily: 'Nunito, sans-serif',
              color: alertColor,
              textShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`
            }}
          >
            {levelText}
          </h1>

          {/* Device Name */}
          <h3 
            className="text-4xl font-bold text-black mb-8"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {deviceName}
          </h3>

          {/* Information Box */}
          <div className="bg-[#F5EFEB] rounded-[30px] p-8 mx-auto max-w-[600px]">
            <h4 
              className="text-3xl font-bold text-black mb-6"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Informasi
            </h4>

            {/* Sensor Data */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-8">
                <span 
                  className="text-2xl font-medium text-black"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Suhu
                </span>
                <span 
                  className="text-2xl font-medium text-black"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  :
                </span>
                <span 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: alertColor
                  }}
                >
                  {temperature}°C
                </span>
              </div>

              <div className="flex items-center justify-between px-8">
                <span 
                  className="text-2xl font-medium text-black"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Kelembapan
                </span>
                <span 
                  className="text-2xl font-medium text-black"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  :
                </span>
                <span 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: alertColor
                  }}
                >
                  {humidity}%
                </span>
              </div>

              <div className="flex items-center justify-between px-8">
                <span 
                  className="text-2xl font-medium text-black whitespace-nowrap"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  Konsentrasi CO2
                </span>
                <span 
                  className="text-2xl font-medium text-black"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  :
                </span>
                <span 
                  className="text-2xl font-bold"
                  style={{ 
                    fontFamily: 'Nunito, sans-serif',
                    color: alertColor
                  }}
                >
                  {gasConcentration} ppm
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {/* <button
            onClick={onClose}
            className="mt-8 px-10 py-2 bg-[#567C8D] hover:bg-[#476b7a] text-white rounded-full text-xl font-semibold transition-colors"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            Tutup
          </button> */}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}