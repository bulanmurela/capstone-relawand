"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import GrafikTempHum from "@/components/GrafikTempHum";
import GrafikGas from "@/components/GrafikGas";
import KontainerGambar from "@/components/KontainerGambar";

export default function GrafikPemantauanPage() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("deviceId");
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const res = await fetch(`http://localhost:5000/devices/${deviceId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch device");
        const data = await res.json();
        setDevice(data);
      } catch (err) {
        console.error("Error fetching device:", err);
      } finally {
        setLoading(false);
      }
    };

    if (deviceId) fetchDevice();
  }, [deviceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#567C8D] text-xl">
        Memuat data perangkat...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 text-lg">
        Data perangkat tidak ditemukan
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header info device */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-black text-[#2F4156]"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {device.deviceName || device.name}
          </h1>
          <p className="text-gray-500 mt-2">
            Lokasi:{" "}
            {device.location
              ? `${device.location.latitude}, ${device.location.longitude}`
              : device.latitude && device.longitude
              ? `${device.latitude}, ${device.longitude}`
              : "Tidak ada data lokasi"}
          </p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <GrafikTempHum locationId={device.deviceId} />
          <GrafikGas locationId={device.deviceId} />
        </div>

        {/* Kamera */}
        <div className="mb-6">
          <KontainerGambar locationId={device.deviceId} />
        </div>
      </div>
    </div>
  );
}
