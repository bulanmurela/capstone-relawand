"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DemoDevice {
  _id: string;
  deviceId: string;
  deviceName: string;
  statusDevice: string;
}

interface SensorValues {
  temperature: number;
  humidity: number;
  gas_ppm: number;
  gas_adc: number;
  voltage: number;
  alarm: boolean;
}

export default function DemoSimulatorPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [devices, setDevices] = useState<DemoDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastInterval, setBroadcastInterval] = useState<NodeJS.Timeout | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Sensor values state
  const [values, setValues] = useState<SensorValues>({
    temperature: 28.5,
    humidity: 55.0,
    gas_ppm: 1200,
    gas_adc: 480,
    voltage: 0.387,
    alarm: false
  });

  // Auto-calculate dependent values
  useEffect(() => {
    setValues(prev => ({
      ...prev,
      gas_adc: Math.round(prev.gas_ppm * 0.4),
      voltage: parseFloat((prev.gas_ppm * 0.4 / 1241).toFixed(3)),
      alarm: prev.gas_ppm > 1500
    }));
  }, [values.gas_ppm]);

  useEffect(() => {
    setMounted(true);

    // Check if in demo mode
    const demoMode = localStorage.getItem('demoMode');
    if (demoMode !== 'true') {
      router.push('/login');
      return;
    }

    // Fetch demo devices
    fetchDemoDevices();

    // Cleanup interval on unmount
    return () => {
      if (broadcastInterval) {
        clearInterval(broadcastInterval);
      }
    };
  }, [router]);

  const fetchDemoDevices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/devices?isDemo=true`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch demo devices');

      const result = await response.json();
      const deviceList = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];
      setDevices(deviceList);

      // Select first device by default
      if (deviceList.length > 0) {
        setSelectedDevice(deviceList[0].deviceId);
      }
    } catch (error) {
      console.error('Error fetching demo devices:', error);
      setMessage({ type: 'error', text: 'Gagal memuat perangkat demo' });
    } finally {
      setIsLoading(false);
    }
  };

  const publishSensorData = async () => {
    if (!selectedDevice) {
      setMessage({ type: 'error', text: 'Pilih perangkat terlebih dahulu' });
      return;
    }

    try {
      const payload = {
        device_id: selectedDevice,
        timestamp: new Date().toISOString(),
        temperature: values.temperature,
        humidity: values.humidity,
        gas_adc: values.gas_adc,
        gas_ppm: values.gas_ppm,
        voltage: values.voltage,
        alarm: values.alarm
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/mqtt/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          topic: 'Relawand',
          message: JSON.stringify(payload)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to publish data');
      }

      setMessage({ type: 'success', text: '✓ Data berhasil dikirim!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error publishing data:', error);
      setMessage({ type: 'error', text: 'Gagal mengirim data' });
    }
  };

  const startBroadcast = () => {
    if (broadcastInterval) return;

    setIsBroadcasting(true);
    setMessage({ type: 'info', text: '📡 Broadcasting dimulai (setiap 5 detik)' });

    // Publish immediately
    publishSensorData();

    // Then publish every 5 seconds
    const interval = setInterval(() => {
      publishSensorData();
    }, 5000);

    setBroadcastInterval(interval);
  };

  const stopBroadcast = () => {
    if (broadcastInterval) {
      clearInterval(broadcastInterval);
      setBroadcastInterval(null);
    }
    setIsBroadcasting(false);
    setMessage({ type: 'info', text: '⏹️ Broadcasting dihentikan' });
  };

  const handleValueChange = (field: keyof SensorValues, value: number | boolean) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const randomizeValues = () => {
    const baseTemp = 27 + Math.random() * 6; // 27-33°C
    const baseHumidity = 45 + Math.random() * 20; // 45-65%
    const baseGas = 1000 + Math.random() * 800; // 1000-1800 ppm

    setValues({
      temperature: parseFloat(baseTemp.toFixed(1)),
      humidity: parseFloat(baseHumidity.toFixed(1)),
      gas_ppm: Math.round(baseGas),
      gas_adc: Math.round(baseGas * 0.4),
      voltage: parseFloat((baseGas * 0.4 / 1241).toFixed(3)),
      alarm: baseGas > 1500
    });
  };

  const presetScenarios = [
    {
      name: '🟢 Normal',
      desc: 'Kondisi normal',
      values: { temperature: 28.5, humidity: 55.0, gas_ppm: 1100 }
    },
    {
      name: '🟡 Siaga',
      desc: 'Gas meningkat',
      values: { temperature: 30.5, humidity: 50.0, gas_ppm: 1450 }
    },
    {
      name: '🔴 Darurat',
      desc: 'Gas berbahaya!',
      values: { temperature: 33.0, humidity: 45.0, gas_ppm: 1750 }
    },
    {
      name: '🌡️ Panas',
      desc: 'Suhu tinggi',
      values: { temperature: 36.0, humidity: 40.0, gas_ppm: 1250 }
    }
  ];

  const applyScenario = (scenario: typeof presetScenarios[0]) => {
    setValues({
      temperature: scenario.values.temperature,
      humidity: scenario.values.humidity,
      gas_ppm: scenario.values.gas_ppm,
      gas_adc: Math.round(scenario.values.gas_ppm * 0.4),
      voltage: parseFloat((scenario.values.gas_ppm * 0.4 / 1241).toFixed(3)),
      alarm: scenario.values.gas_ppm > 1500
    });
    setMessage({ type: 'info', text: `Skenario "${scenario.name}" diterapkan` });
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse text-[#567C8D] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Badge */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <span className="px-4 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-bold border border-purple-300">
              🎮 DEMO MODE - ADMIN SIMULATOR
            </span>
          </div>
          <h1 className="text-5xl font-black text-gray-800 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Simulator Sensor Demo
          </h1>
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Kontrol manual dan broadcast data sensor untuk mode demo
          </p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl shadow-md border-l-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            message.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            'bg-blue-50 border-blue-500 text-blue-800'
          }`} style={{ fontFamily: 'Nunito, sans-serif' }}>
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Device & Scenarios */}
          <div className="lg:col-span-1 space-y-6">
            {/* Device Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <span>📍</span> Pilih Perangkat
              </h2>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full p-3 rounded-lg border-2 border-gray-300 text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                style={{ fontFamily: 'Nunito, sans-serif' }}
                disabled={isLoading}
              >
                <option value="">-- Pilih Perangkat --</option>
                {devices.map((device) => (
                  <option key={device._id} value={device.deviceId}>
                    {device.deviceName} - {device.statusDevice}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Scenarios */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <span>⚡</span> Skenario Cepat
              </h2>
              <div className="space-y-2">
                {presetScenarios.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyScenario(scenario)}
                    className="w-full p-3 text-left rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    <div className="font-bold text-gray-800">{scenario.name}</div>
                    <div className="text-sm text-gray-600">{scenario.desc}</div>
                  </button>
                ))}
                <button
                  onClick={randomizeValues}
                  className="w-full p-3 text-left rounded-lg border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 transition-all"
                  style={{ fontFamily: 'Nunito, sans-serif' }}
                >
                  <div className="font-bold text-purple-800">🎲 Acak</div>
                  <div className="text-sm text-purple-600">Nilai random</div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sensor Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sensor Value Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <span>🎛️</span> Kontrol Nilai Sensor
              </h2>

              <div className="space-y-6">
                {/* Temperature */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    🌡️ Suhu: <span className="text-2xl text-red-600">{values.temperature}°C</span>
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="40"
                    step="0.1"
                    value={values.temperature}
                    onChange={(e) => handleValueChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-3 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-semibold">
                    <span>20°C</span>
                    <span>30°C</span>
                    <span>40°C</span>
                  </div>
                </div>

                {/* Humidity */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    💧 Kelembapan: <span className="text-2xl text-blue-600">{values.humidity}%</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    step="0.1"
                    value={values.humidity}
                    onChange={(e) => handleValueChange('humidity', parseFloat(e.target.value))}
                    className="w-full h-3 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-semibold">
                    <span>30%</span>
                    <span>55%</span>
                    <span>80%</span>
                  </div>
                </div>

                {/* Gas PPM */}
                <div className={`p-4 rounded-xl border-2 transition-all ${
                  values.alarm
                    ? 'bg-gradient-to-r from-red-100 to-red-50 border-red-400'
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <label className="block text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    ☁️ Gas PPM: <span className={`text-2xl ${values.alarm ? 'text-red-700' : 'text-green-700'}`}>
                      {values.gas_ppm} ppm
                    </span>
                    {values.alarm && (
                      <span className="ml-3 px-3 py-1 bg-red-600 text-white rounded-full text-sm animate-pulse">
                        ⚠️ ALARM AKTIF!
                      </span>
                    )}
                  </label>
                  <input
                    type="range"
                    min="800"
                    max="2000"
                    step="10"
                    value={values.gas_ppm}
                    onChange={(e) => handleValueChange('gas_ppm', parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-semibold">
                    <span>800</span>
                    <span className="text-orange-600">⚠️ 1500 (Threshold)</span>
                    <span>2000</span>
                  </div>
                </div>

                {/* Auto-calculated values */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    📊 Nilai Otomatis (Terhitung)
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                      <p className="text-xs text-gray-600 mb-1">Gas ADC</p>
                      <p className="text-2xl font-bold text-gray-800">{values.gas_adc}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                      <p className="text-xs text-gray-600 mb-1">Voltage (V)</p>
                      <p className="text-2xl font-bold text-gray-800">{values.voltage}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-300">
                      <p className="text-xs text-gray-600 mb-1">Status Alarm</p>
                      <p className="text-2xl font-bold">{values.alarm ? '🔴' : '🟢'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Broadcast Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
                <span>📡</span> Kontrol Broadcast MQTT
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={publishSensorData}
                    disabled={!selectedDevice || isBroadcasting}
                    className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transition-all transform hover:scale-105"
                    style={{ fontFamily: 'Nunito, sans-serif' }}
                  >
                    📡 Kirim Sekali
                  </button>

                  {!isBroadcasting ? (
                    <button
                      onClick={startBroadcast}
                      disabled={!selectedDevice}
                      className="px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg transition-all transform hover:scale-105"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      ▶️ Mulai Broadcast
                    </button>
                  ) : (
                    <button
                      onClick={stopBroadcast}
                      className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 shadow-lg transition-all transform hover:scale-105"
                      style={{ fontFamily: 'Nunito, sans-serif' }}
                    >
                      ⏹️ Stop Broadcast
                    </button>
                  )}
                </div>

                {isBroadcasting && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4 flex items-center gap-3 shadow-md">
                    <div className="animate-pulse text-3xl">📡</div>
                    <div>
                      <p className="text-base text-blue-900 font-bold" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        Broadcasting Aktif
                      </p>
                      <p className="text-sm text-blue-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                        Data dikirim otomatis setiap 5 detik ke broker MQTT
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-semibold mb-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    📌 Informasi Teknis:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1" style={{ fontFamily: 'Nunito, sans-serif' }}>
                    <li>• Broker: <code className="bg-yellow-100 px-1 rounded">broker.emqx.io:1883</code></li>
                    <li>• Topic: <code className="bg-yellow-100 px-1 rounded">Relawand</code></li>
                    <li>• Frontend akan menerima update real-time via WebSocket</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/beranda')}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
