"use client";

interface LocationHeaderProps {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function LocationHeader({ name, coordinates }: LocationHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {/* Location Icon */}
      <div className="w-[50px] h-[50px] bg-red-500 rounded-full flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="white" 
          viewBox="0 0 24 24" 
          className="w-10 h-10"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>

      {/* Location Name and Coordinates */}
      <div>
        <h1 
          className="text-3xl font-bold text-black"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {name} ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(3)})
        </h1>
      </div>
    </div>
  );
}

/*
USAGE:
import LocationHeader from '@/components/LocationHeader';

<LocationHeader 
  name="RelaWand 1" 
  coordinates={{ lat: -7.9032, lng: 110.661 }} 
/>
*/