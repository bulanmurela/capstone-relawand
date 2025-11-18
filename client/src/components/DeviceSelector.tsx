"use client";

import { useState, useEffect } from 'react';

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

interface DeviceSelectorProps {
  selectedId: number | null;
  onSelect: (location: Location) => void;
}

export default function DeviceSelector({ selectedId, onSelect }: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    // TODO: Fetch from API
    // const fetchLocations = async () => {
    //   const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/locations', {
    //     credentials: 'include'
    //   });
    //   const data = await response.json();
    //   setLocations(data.locations);
    // };
    // fetchLocations();

    // Dummy data
    const dummyLocations: Location[] = [
      { id: 1, name: 'Tongkat 1', lat: -7.9651, lng: 110.605 },
      { id: 2, name: 'Tongkat 2', lat: -7.967, lng: 110.607 },
      { id: 3, name: 'Tongkat 3', lat: -7.963, lng: 110.603 },
    ];
    setLocations(dummyLocations);
  }, []);

  const selectedLocation = locations.find(loc => loc.id === selectedId);

  return (
    <div className="flex justify-center w-full">
      {/* FIXED: Added flex container to center the dropdown */}
      <div className="relative inline-block w-full max-w-md">
        {/* Selected Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-[#567C8D] rounded-xl px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-md"
        >
          <div className="flex items-center gap-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-6 h-6 text-[#567C8D]"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" 
              />
            </svg>
            <div className="text-left">
              {selectedLocation ? (
                <>
                  <p className="text-lg font-bold text-[#2F4156]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {selectedLocation.name}
                  </p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(3)}
                  </p>
                </>
              ) : (
                <p className="text-lg font-semibold text-gray-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  Pilih Tongkat Pemantauan
                </p>
              )}
            </div>
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className={`w-5 h-5 text-[#567C8D] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown List */}
        {isOpen && (
          <>
            {/* Overlay to close dropdown */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div className="absolute z-20 w-full mt-2 bg-white border-2 border-[#567C8D] rounded-xl shadow-xl overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => {
                      onSelect(location);
                      setIsOpen(false);
                    }}
                    className={`w-full px-6 py-4 flex items-center gap-3 hover:bg-[#567C8D]/10 transition-colors text-left ${
                      selectedId === location.id ? 'bg-[#567C8D]/20' : ''
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill={selectedId === location.id ? '#567C8D' : 'none'}
                      viewBox="0 0 24 24" 
                      strokeWidth={2} 
                      stroke="currentColor" 
                      className="w-5 h-5 text-[#567C8D]"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <div>
                      <p className="text-base font-bold text-[#2F4156]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {location.name}
                      </p>
                      <p className="text-sm text-gray-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        {location.lat.toFixed(4)}, {location.lng.toFixed(3)}
                      </p>
                    </div>
                    {selectedId === location.id && (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={3} 
                        stroke="currentColor" 
                        className="w-5 h-5 text-[#567C8D] ml-auto"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}