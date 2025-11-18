"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GrafikTempHum from "@/components/GrafikTempHum";
import GrafikGas from "@/components/GrafikGas";
import KontainerGambar from "@/components/KontainerGambar";

export default function GrafikPemantauanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const deviceId = searchParams.get("deviceId");
  const [device, setDevice] = useState<any>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("http://localhost:5000/devices", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch devices");
        const data = await res.json();
        console.log("Fetched devices response:", data);
        const deviceList = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        console.log("Device list:", deviceList);
        setDevices(deviceList);

        // If no deviceId in URL but we have devices, set the first one as default
        if (!deviceId && deviceList.length > 0) {
          setSelectedDeviceId(deviceList[0]._id);
        }
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };

    fetchDevices();
  }, [deviceId]);

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

    if (deviceId) {
      fetchDevice();
    } else {
      setLoading(false);
    }
  }, [deviceId]);

  const handleDeviceChange = (newDeviceId: string) => {
    if (newDeviceId) {
      router.push(`/grafik-pemantauan?deviceId=${encodeURIComponent(newDeviceId)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#567C8D] text-xl">
        Memuat data perangkat...
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
        <div className="max-w-md w-full bg-[#F5F5F5] rounded-3xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-[#2F4156] text-center mb-6"
              style={{ fontFamily: 'Nunito, sans-serif' }}>
            Pilih Perangkat
          </h2>
          {devices.length === 0 ? (
            <p className="text-center text-gray-600">Tidak ada perangkat tersedia</p>
          ) : (
            <>
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 mb-4"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                <option value="">-- Pilih Perangkat --</option>
                {devices.map((dev) => (
                  <option key={dev._id} value={dev._id}>
                    {dev.name || dev.deviceName || 'Unnamed Device'} - {dev.status || dev.statusDevice || 'unknown'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleDeviceChange(selectedDeviceId)}
                disabled={!selectedDeviceId}
                className="w-full bg-[#567C8D] text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#456b7a]"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Lihat Grafik Pemantauan
              </button>
            </>
          )}
        </div>
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
          <GrafikTempHum locationId={device._id} />
          <GrafikGas locationId={device._id} />
        </div>

        {/* Kamera */}
        <div className="mb-6">
          <KontainerGambar locationId={device._id} />
        </div>
      </div>
    </div>
  );
}
