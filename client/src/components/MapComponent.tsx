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
    name: string;
    latitude: number;
    longitude: number;
    status: string;
}

export type MapProps = {
    locationId: number;
};

export default function MapComponent() {
    const [mounted, setMounted] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const router = useRouter();
    const [deviceList, setDeviceList] =  useState<Device[]>([]);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [status, setStatus] = useState('');

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
            method: 'GET',
            credentials: 'include' // Tambahkan untuk auth
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch devices');
        }
        
        const data: Device[] = await response.json();
        setDeviceList(data);
        } catch (err) {
        console.error("Error fetching devices:", err);
        } finally {
        setIsLoading(false);
        }
    };

    const handleAddDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        const newDevice = {
            name,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            status
        };

        try {
            const response = await fetch("http://localhost:5000/device", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newDevice)
            });

            if (response.ok) {
                const addedDevice = await response.json();
                setDeviceList((prev) => [...prev, addedDevice]);
                setName('');
                setLatitude('');
                setLongitude('');
                setStatus('');
            } else {
                console.error("Error adding device:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding device:", error);
        }
    };

    const handleMarkerClick = (deviceId: string) => {
        router.push(`/grafik-pemantauan/${deviceId}`);
    }

    const initialPosition: [number, number] = deviceList.length > 0 ? [deviceList[0].latitude, deviceList[0].longitude] : [-7.8257448, 110.6734842];

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

            {deviceList.map((device) => (
                <Marker
                  key={device._id}
                  position={[device.latitude, device.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                      click: () => handleMarkerClick(device._id)
                  }}
                >
                  <Popup>
                    <strong>{device.name}</strong>
                  </Popup>
                </Marker>
            ))}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <input
                type="text"
                placeholder="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-2 rounded h-1/3 w-1/5 text-sm"
                required
            />
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