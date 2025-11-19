"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L, { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import React from "react";
import { useNotification } from "@/contexts/NotificationContext";

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
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

// Component to handle map clicks and set temporary marker
interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
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
    // Legacy fields for backward compatibility
    latitude?: number;
    longitude?: number;
    name?: string;
    status?: string;
}

export type MapProps = {
    locationId: number;
};

type MapMode = 'select' | 'add' | 'delete';

interface TempMarker {
    id: string;
    lat: number;
    lng: number;
    name: string;
}

export default function MapComponent() {
    const [mounted, setMounted] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const router = useRouter();
    const { showNotification, showConfirm } = useNotification();
    const [deviceList, setDeviceList] =  useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Mode management
    const [mode, setMode] = useState<MapMode>('select');

    // Add mode states
    const [tempMarkers, setTempMarkers] = useState<TempMarker[]>([]);

    // Delete mode states
    const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);

    // Edit status modal
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [newStatus, setNewStatus] = useState<string>('online');

    // Icons
    const customIcon: Icon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });

    const tempIcon: Icon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/2776/2776067.png", // Red/new pin
        iconSize: [35, 35],
        iconAnchor: [17, 35],
    });

    const deleteIcon: Icon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/3687/3687412.png", // Red X or delete icon
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
        // Check if in demo mode
        const demoMode = localStorage.getItem('demoMode') === 'true';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const url = demoMode
            ? `${baseUrl}/devices?isDemo=true`
            : `${baseUrl}/devices`; // Don't filter by isDemo when not in demo mode

        const response = await fetch(url, {
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

    // Map click handler - behavior depends on mode
    const handleMapClick = (lat: number, lng: number) => {
        if (mode === 'add') {
            // Add new temporary marker
            const newMarker: TempMarker = {
                id: `temp-${Date.now()}`,
                lat: Number(lat),
                lng: Number(lng),
                name: ''
            };
            console.log('Adding temp marker:', newMarker);
            setTempMarkers([...tempMarkers, newMarker]);
        }
        // In select mode, do nothing on map click
        // In delete mode, do nothing on map click (only click markers)
    };

    // Handle marker name change in Add mode
    const handleMarkerNameChange = (id: string, name: string) => {
        setTempMarkers(tempMarkers.map(m => m.id === id ? { ...m, name } : m));
    };

    // Remove a temp marker from the list
    const removeTempMarker = (id: string) => {
        setTempMarkers(tempMarkers.filter(m => m.id !== id));
    };

    // Batch add all temp markers
    const handleBatchAddDevices = async () => {
        if (tempMarkers.length === 0) return;

        const unnamed = tempMarkers.filter(m => !m.name.trim());
        if (unnamed.length > 0) {
            showNotification('warning', 'Harap beri nama semua titik lokasi sebelum menambahkan.');
            return;
        }

        // Validate coordinates
        const invalidCoords = tempMarkers.filter(m =>
            isNaN(m.lat) || isNaN(m.lng) || m.lat === 0 || m.lng === 0
        );
        if (invalidCoords.length > 0) {
            showNotification('error', 'Beberapa marker memiliki koordinat yang tidak valid. Silakan tambahkan ulang.');
            console.error('Invalid markers:', invalidCoords);
            return;
        }

        setIsLoading(true);
        try {
            let successCount = 0;
            for (let i = 0; i < tempMarkers.length; i++) {
                const marker = tempMarkers[i];
                // Generate unique deviceId with timestamp + index + random string
                const uniqueId = `DEVICE-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;

                // Send in frontend format that the route expects
                const newDevice = {
                    name: marker.name,
                    latitude: Number(marker.lat),
                    longitude: Number(marker.lng),
                    status: 'offline',
                };

                console.log('Creating device:', newDevice);
                console.log('Marker data:', marker);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/devices`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include',
                    body: JSON.stringify(newDevice)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error adding device:", errorData);
                    showNotification('error', `Error menambahkan ${marker.name}: ${errorData.error || errorData.message || 'Gagal menambahkan perangkat'}. Cek console untuk detail.`);
                    break;
                } else {
                    successCount++;
                }

                // Small delay to ensure unique timestamps
                if (i < tempMarkers.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Success - refresh and clear
            if (successCount > 0) {
                await fetchDevices();
                setTempMarkers([]);
                showNotification('success', `Berhasil menambahkan ${successCount} perangkat!`);
            }
        } catch (error) {
            console.error("Error batch adding devices:", error);
            showNotification('error', 'Gagal menambahkan perangkat. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle device deletion
    const handleDeleteDevices = async () => {
        if (selectedForDeletion.length === 0) return;

        showConfirm({
            title: 'Konfirmasi Penghapusan',
            message: `Apakah Anda yakin ingin menghapus ${selectedForDeletion.length} perangkat?`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
            onConfirm: async () => {
                try {
                    for (const deviceId of selectedForDeletion) {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/devices/${deviceId}`, {
                            method: "DELETE",
                            credentials: 'include',
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            console.error("Error deleting device:", errorData);
                            showNotification('error', `Error menghapus perangkat: ${errorData.message || 'Gagal menghapus'}`);
                            return;
                        }
                    }

                    // Success
                    await fetchDevices();
                    setSelectedForDeletion([]);
                    showNotification('success', `Berhasil menghapus ${selectedForDeletion.length} perangkat!`);
                } catch (error) {
                    console.error("Error deleting devices:", error);
                    showNotification('error', 'Gagal menghapus perangkat. Silakan coba lagi.');
                }
            }
        });
    };

    // Toggle selection for deletion
    const toggleDeleteSelection = (deviceId: string) => {
        if (selectedForDeletion.includes(deviceId)) {
            setSelectedForDeletion(selectedForDeletion.filter(id => id !== deviceId));
        } else {
            setSelectedForDeletion([...selectedForDeletion, deviceId]);
        }
    };

    // Handle status update
    const handleUpdateStatus = async () => {
        if (!editingDevice) return;

        try {
            // Get current device data
            const lat = editingDevice.location?.latitude ?? editingDevice.latitude;
            const lon = editingDevice.location?.longitude ?? editingDevice.longitude;
            const deviceName = editingDevice.deviceName || editingDevice.name;

            // Send in frontend format that the route expects
            const updateData = {
                name: deviceName,
                latitude: Number(lat),
                longitude: Number(lon),
                status: newStatus
            };

            console.log('Updating device status:', updateData);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/devices/${editingDevice._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                await fetchDevices();
                setEditingDevice(null);
                showNotification('success', 'Status berhasil diperbarui!');
            } else {
                const errorData = await response.json();
                console.error('Update error:', errorData);
                showNotification('error', `Error: ${errorData.message || 'Gagal memperbarui status'}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showNotification('error', 'Gagal memperbarui status. Silakan coba lagi.');
        }
    };

    const handleMarkerClick = (_id: string) => {
        if (mode === 'delete') {
            toggleDeleteSelection(_id);
        }
        // In select mode, clicking just opens the popup - navigation happens via button in popup
    };

    const handleMarkerRightClick = (device: Device) => {
        if (mode === 'select') {
            setEditingDevice(device);
            const currentStatus = device.status || device.statusDevice || 'offline';
            setNewStatus(currentStatus);
        }
    };

    const initialPosition: [number, number] = deviceList.length > 0 && deviceList[0].location?.latitude && deviceList[0].location?.longitude
        ? [deviceList[0].location.latitude, deviceList[0].location.longitude]
        : [-7.8257448, 110.6734842];

	return (
        <div className="bg-[#F5F5F5] rounded-2xl overflow-hidden mb-6">
            {/* Mode Toggle Buttons */}
            <div className="flex gap-2 p-4 bg-white border-b">
                <button
                    onClick={() => {
                        setMode('select');
                        setTempMarkers([]);
                        setSelectedForDeletion([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        mode === 'select'
                            ? 'bg-[#567C8D] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                    📍 Pilih
                </button>
                <button
                    onClick={() => {
                        setMode('add');
                        setTempMarkers([]);
                        setSelectedForDeletion([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        mode === 'add'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                    ➕ Tambah
                </button>
                <button
                    onClick={() => {
                        setMode('delete');
                        setTempMarkers([]);
                        setSelectedForDeletion([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        mode === 'delete'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                    🗑️ Hapus
                </button>
            </div>

            {/* Map Container */}
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
                <MapClickHandler onLocationSelect={handleMapClick} />

                {/* Temporary markers in Add mode */}
                {mode === 'add' && tempMarkers.map((marker) => (
                    <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={tempIcon}>
                        <Popup>
                            <div className="text-center">
                                <p className="font-semibold text-sm">Lokasi Baru</p>
                                <p className="text-xs text-gray-600">
                                    {marker.lat.toFixed(7)}, {marker.lng.toFixed(7)}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Existing device markers */}
                {deviceList.map((device) => {
                    const lat = device.location?.latitude ?? device.latitude;
                    const lon = device.location?.longitude ?? device.longitude;
                    const name = device.deviceName || device.name;

                    if (!lat || !lon) return null;

                    const isSelected = selectedForDeletion.includes(device._id);
                    const icon = mode === 'delete' && isSelected ? deleteIcon : customIcon;

                    return (
                        <Marker
                            key={device._id}
                            position={[lat, lon]}
                            icon={icon}
                            eventHandlers={{
                                click: () => handleMarkerClick(device._id),
                                contextmenu: () => handleMarkerRightClick(device),
                            }}
                        >
                            <Popup>
                                <div className="flex flex-col items-start gap-2">
                                    <div className="font-semibold">{name}</div>
                                    <div className="text-xs">
                                        Status: <span className={`font-semibold ${
                                            (device.status || device.statusDevice) === 'online' ? 'text-green-600' :
                                            (device.status || device.statusDevice) === 'error' ? 'text-red-600' : 'text-gray-600'
                                        }`}>{device.status || device.statusDevice || 'unknown'}</span>
                                    </div>
                                    {mode === 'select' && (
                                        <>
                                            <button
                                                onClick={() => router.push(`/grafik-pemantauan?deviceId=${encodeURIComponent(device._id)}`)}
                                                className="text-sm text-blue-600 underline"
                                                type="button"
                                            >
                                                Lihat Grafik Pemantauan
                                            </button>
                                            <p className="text-xs text-gray-500 italic">Klik kanan untuk edit status</p>
                                        </>
                                    )}
                                    {mode === 'delete' && (
                                        <p className="text-xs text-red-600 font-semibold">
                                            {isSelected ? '✓ Dipilih untuk dihapus' : 'Klik untuk pilih'}
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Mode-specific UI */}
            <div className="p-4 bg-white">
                {mode === 'select' && (
                    <div>
                        <h3 className="font-semibold text-base text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Mode Pilih
                        </h3>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            • Klik marker untuk melihat grafik pemantauan<br />
                            • Klik kanan marker untuk mengubah status (online/offline/error)
                        </p>
                    </div>
                )}

                {mode === 'add' && (
                    <div>
                        <h3 className="font-semibold text-base text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Tambah Perangkat Baru
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            💡 Klik pada peta untuk menambah titik lokasi
                        </p>

                        {tempMarkers.length > 0 && (
                            <div className="space-y-2">
                                {tempMarkers.map((marker, idx) => {
                                    const latDisplay = isNaN(marker.lat) ? 'Invalid' : marker.lat.toFixed(4);
                                    const lngDisplay = isNaN(marker.lng) ? 'Invalid' : marker.lng.toFixed(4);
                                    const hasInvalidCoords = isNaN(marker.lat) || isNaN(marker.lng);

                                    return (
                                        <div key={marker.id} className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-700 w-6">{idx + 1}.</span>
                                            <input
                                                type="text"
                                                placeholder="Nama perangkat"
                                                value={marker.name}
                                                onChange={(e) => handleMarkerNameChange(marker.id, e.target.value)}
                                                className="flex-1 p-2 rounded border border-gray-300 text-sm"
                                                style={{ fontFamily: 'Nunito, sans-serif' }}
                                            />
                                            <span className={`text-xs ${hasInvalidCoords ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                                                {latDisplay}, {lngDisplay}
                                            </span>
                                            <button
                                                onClick={() => removeTempMarker(marker.id)}
                                                className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                type="button"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleBatchAddDevices}
                                        className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
                                        style={{ fontFamily: 'Nunito, sans-serif' }}
                                    >
                                        ✓ Tambahkan Semua ({tempMarkers.length})
                                    </button>
                                    <button
                                        onClick={() => setTempMarkers([])}
                                        className="px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500"
                                        style={{ fontFamily: 'Nunito, sans-serif' }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'delete' && (
                    <div>
                        <h3 className="font-semibold text-base text-gray-700 mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Hapus Perangkat
                        </h3>
                        <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            🗑️ Klik marker untuk memilih perangkat yang akan dihapus
                        </p>

                        {selectedForDeletion.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">
                                    {selectedForDeletion.length} perangkat dipilih untuk dihapus
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDeleteDevices}
                                        className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
                                        style={{ fontFamily: 'Nunito, sans-serif' }}
                                    >
                                        🗑️ Hapus ({selectedForDeletion.length})
                                    </button>
                                    <button
                                        onClick={() => setSelectedForDeletion([])}
                                        className="px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500"
                                        style={{ fontFamily: 'Nunito, sans-serif' }}
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Edit Modal */}
            {editingDevice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                            Edit Status: {editingDevice.deviceName || editingDevice.name}
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                                Status Perangkat
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                                style={{ fontFamily: 'Nunito, sans-serif' }}
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleUpdateStatus}
                                className="flex-1 px-4 py-2 bg-[#567C8D] text-white rounded font-semibold hover:bg-[#456b7a]"
                                style={{ fontFamily: 'Nunito, sans-serif' }}
                            >
                                Simpan
                            </button>
                            <button
                                onClick={() => setEditingDevice(null)}
                                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded font-semibold hover:bg-gray-500"
                                style={{ fontFamily: 'Nunito, sans-serif' }}
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}