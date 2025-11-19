"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  date: string;
  time: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDir: string;
  precipitation: number;
  icon: string;
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // Fungsi konversi derajat → arah mata angin
  const getWindDirection = (degree: number | undefined) => {
    if (degree === undefined || degree === null) {
      return "N/A";
    }

    const directions = [
      "Utara",
      "Timur Laut",
      "Timur",
      "Tenggara",
      "Selatan",
      "Barat Daya",
      "Barat",
      "Barat Laut",
    ];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  const fetchWeather = async () => {
      try {
        const lat = -7.9651; // Wonosari latitude
        const lon = 110.605; // Wonosari longitude
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=id`
        );

        const data = await res.json();

        const now = new Date();
        const date = now.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
        const time = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const windDegree = data.wind?.deg;
        const windDirection = getWindDirection(windDegree);
      
        const weatherInfo: WeatherData = {
          date,
          time,
          temperature: Math.round(data.main.temp),
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          windDir: windDirection, 
          precipitation: data.rain ? data.rain["1h"] || 0 : 0,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        };

        setWeather(weatherInfo);
        setLastUpdate(time);
      } catch (err) {
        console.error("❌ Gagal mengambil data cuaca:", err);
      } finally {
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      fetchWeather();
      const interval = setInterval(fetchWeather, 60 * 60 * 1000); // refresh tiap 1 jam
      return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchWeather();
  };

  return (
    <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-2xl p-6 shadow-lg text-white">

      {weather ? (
        <>
          {/* Lokasi & Tanggal */}
          <div className="text-center mb-0">
            <h3 className="text-lg font-bold mb-0.5" style={{ fontFamily: "Nunito, sans-serif" }}>
              Wonosari, Gunungkidul,
            </h3>
            <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "Nunito, sans-serif" }}>
              D.I.Yogyakarta
            </h3>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-base font-semibold opacity-90" style={{ fontFamily: "Nunito, sans-serif" }}>
                {weather.date}, {weather.time}
              </p>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 transition-colors"
                title="Segarkan data cuaca"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Ikon Cuaca & Suhu */}
          <div className="flex flex-col items-center justify-center mb-4">
            <img src={weather.icon} alt="Weather icon" className="w-32 h-32 mb-0" />
            <div className="text-5xl font-semibold mb-1" style={{ fontFamily: "Nunito, sans-serif" }}>
              {weather.temperature}°C
            </div>
            <p className="text-lg capitalize" style={{ fontFamily: "Nunito, sans-serif" }}>
              {weather.condition}
            </p>
          </div>

          {/* Detail Cuaca */}
          <div className="grid grid-cols-3 gap-x-1 text-center">
            <div>
              <p className="text-base mb-0.5 opacity-90" style={{ fontFamily: "Nunito, sans-serif" }}>
                Kelembapan
              </p>
              <p className="text-base font-bold" style={{ fontFamily: "Nunito, sans-serif" }}>
                {weather.humidity}%
              </p>
            </div>
            <div>
              <p className="text-base mb-0.5 opacity-90" style={{ fontFamily: "Nunito, sans-serif" }}>
                Kecepatan Angin
              </p>
              <p className="text-base font-bold" style={{ fontFamily: "Nunito, sans-serif" }}>
                {weather.windSpeed.toFixed(2)} m/s ke {weather.windDir}
              </p>
            </div>
            <div>
              <p className="text-base mb-0.5 opacity-90" style={{ fontFamily: "Nunito, sans-serif" }}>
                Presipitasi
              </p>
              <p className="text-base font-bold" style={{ fontFamily: "Nunito, sans-serif" }}>
                {weather.precipitation} mm
              </p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center animate-pulse">Memuat data cuaca...</p>
      )}
    </div>
  );
}
