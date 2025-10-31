"use client";

type AlertLevel = 'SIAGA' | 'DARURAT';

interface AlertCardProps {
  level: AlertLevel;
  deviceName: string;
  temperature: number;
  humidity: number;
  gasConcentration: number;
  date: string;
  time: string;
}

export default function AlertCard({
  level,
  deviceName,
  temperature,
  humidity,
  gasConcentration,
  date,
  time
}: AlertCardProps) {
  
  const getAlertColor = (level: AlertLevel) => {
    return level === 'DARURAT' 
      ? { text: 'text-[#FF0000]', bg: 'bg-[#567C8D]' }
      : { text: 'text-[#FFAE00]', bg: 'bg-[#567C8D]' };
  };

  const colors = getAlertColor(level);

  return (
    <div className="relative bg-[#567C8D]/15 rounded-[25px] overflow-hidden">
      {/* Left Color Bar */}
      <div className={`absolute left-0 top-0 w-10 h-full ${colors.bg} rounded-l-[25px]`}></div>

      {/* Content */}
      <div className="pl-16 pr-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Alert Level & Device Name */}
          <div className="md:col-span-3">
            <h2 
              className={`text-5xl font-black ${colors.text} mb-2`}
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {level}
            </h2>
            <p 
              className="text-2xl font-semibold text-black"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {deviceName}
            </p>
          </div>

          {/* Sensor Data */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex flex-wrap gap-6">
              <p 
                className="text-2xl font-semibold text-black"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Suhu: {temperature}°C
              </p>
              <p 
                className="text-2xl font-semibold text-black"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Kelembapan: {humidity}%
              </p>
            </div>
            <p 
              className="text-2xl font-semibold text-black"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              Konsentrasi CO2: {gasConcentration} ppm
            </p>
          </div>

          {/* Date & Time */}
          <div className="md:col-span-3 text-right">
            <p 
              className="text-2xl font-semibold text-black mb-1"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {date}
            </p>
            <p 
              className="text-2xl font-semibold text-black"
              style={{ fontFamily: 'Nunito, sans-serif' }}
            >
              {time}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}