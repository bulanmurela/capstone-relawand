"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import React from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Component to invalidate size when container changes
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate size after a short delay to ensure container is rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map]);
  
  return null;
}

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";

interface Device {
    _id: string;
    // deviceId?: string;
    deviceName: string;
    deviceType: string;
    location: {
        latitude?: number;
        longitude?: number;
        address?: string;
    };
    statusDevice: string;
    userId?: string;
    isActive: boolean;
}

export type MapProps = {
    locationId: number;
};

export default function MapComponent() {
    const [mounted, setMounted] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const router = useRouter();
    const [deviceList, setDeviceList] =  useState<Device[]>([]);
    const [deviceName, setDeviceName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [statusDevice, setStatusDevice] = useState('offline');

    const customIcon: Icon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });

     useEffect(() => {
        setMounted(true);
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
    setIsLoading(true);
    try {
        const response = await fetch("http://localhost:5000/devices", {
        method: "GET",
        credentials: "include"
        });

        if (!response.ok) {
        throw new Error("Failed to fetch devices");
        }

        const result = await response.json();
        console.log("Fetched devices result:", result);

        // handle semua kemungkinan format
        const devices = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
        ? result.data
        : [];

        setDeviceList(devices);
    } catch (err) {
        console.error("Error fetching devices:", err);
    } finally {
        setIsLoading(false);
    }
    };


    const handleAddDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        const newDevice = {
            deviceId: `DEVICE-${Date.now()}`,
            deviceName: deviceName,
            deviceType: 'STM32',
            location: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
            },
            statusDevice: statusDevice,
        };

        try {
            const response = await fetch("http://localhost:5000/devices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: 'include',
                body: JSON.stringify(newDevice)
            });

            if (response.ok) {
                const result = await response.json();
                const addedDevice = result.data || result;
                await fetchDevices(); // Refresh device list
                setDeviceName('');
                setLatitude('');
                setLongitude('');
                setStatusDevice('offline');
            } else {
                const errorData = await response.json();
                console.error("Error adding device:", errorData);
                alert(`Error: ${errorData.message || 'Failed to add device'}`);
            }
        } catch (error) {
            console.error("Error adding device:", error);
            alert('Failed to add device. Please try again.');
        }
    };

    const handleMarkerClick = (_id: string) => {
        router.push(`/grafik-pemantauan?deviceId=${encodeURIComponent(_id)}`);
    }

    const initialPosition: [number, number] = deviceList.length > 0 && deviceList[0].location?.latitude && deviceList[0].location?.longitude
        ? [deviceList[0].location.latitude, deviceList[0].location.longitude]
        : [-7.8257448, 110.6734842];

	return (
        <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden mb-6">
            <MapContainer
                center={initialPosition}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "400px", width: "100%" }}
            >
            <TileLayer
                url={`https://api.maptiler.com/maps/hybrid/256/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`}
                attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            />

            {deviceList.map((device) => {
                // dukung kedua format data
                const lat = device.location?.latitude ?? (device as any).latitude;
                const lon = device.location?.longitude ?? (device as any).longitude;
                const name = device.deviceName || (device as any).name;

                if (!lat || !lon) return null;
                return (
                    <Marker
                      key={device._id}
                      position={[lat, lon]}
                      icon={customIcon}
                      eventHandlers={{
                          click: () => handleMarkerClick(device._id),
                      }}
                    >
                      <Popup>
                        <div className="flex flex-col items-start gap-2">
                            <div className="font-semibold">{device.deviceName || (device as any).name}</div>
                            <button
                            onClick={() => router.push(`/grafik-pemantauan?deviceId=${encodeURIComponent(device._id)}`)}
                            className="text-sm text-blue-600 underline"
                            type="button"
                            >
                            Lihat Grafik Pemantauan
                            </button>
                        </div>
                      </Popup>
                    </Marker>
                );
            })}
        </MapContainer>

        {/* Form Tambah Titik */}
        <form onSubmit={handleAddDevice} className="mt-4 space-y-2">
            <h3 className="font-semibold font-italic text-base text-gray-700 mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
            >
            Tambah Titik Tongkat Baru
            </h3>
            <div className="flex gap-2 ml-2 mr-2">
            <input
                type="text"
                placeholder="Nama Tongkat"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="p-2 rounded h-1/3 w-1/4 text-sm"
                required
            />
            <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="p-2 rounded h-1/3 w-1/4 text-sm"
                required
            />
            <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="p-2 rounded h-1/3 w-1/4 text-sm"
                required
            />
            <select
                value={statusDevice}
                onChange={(e) => setStatusDevice(e.target.value)}
                className="p-2 rounded h-1/3 w-1/5 text-sm"
                required
            >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="error">Error</option>
            </select>
            <button
                type="submit"
                className="bg-green-600 text-white px-4 rounded"
                style={{ fontFamily: 'Nunito, sans-serif' }}
            >
                Tambah
            </button>
            </div>
        </form>
        </div>
    );
}