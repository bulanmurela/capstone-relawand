'use client';

import React from 'react';
import { useMqttContext } from '@/contexts/MqttContext';

export default function RealTimeSensorDisplay() {
  const { data, isConnected, error, lastUpdate } = useMqttContext();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-medium">MQTT Connection Error</p>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <p className="text-yellow-700">Connecting to MQTT broker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Connection Status */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Live Sensor Data
            </span>
          </div>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Sensor Data Display */}
      {data ? (
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Temperature */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Temperature</p>
            <p className="text-2xl font-bold text-blue-700">
              {data.temperature !== null ? `${data.temperature}°C` : 'N/A'}
            </p>
          </div>

          {/* Humidity */}
          <div className="bg-cyan-50 rounded-lg p-3">
            <p className="text-xs text-cyan-600 font-medium mb-1">Humidity</p>
            <p className="text-2xl font-bold text-cyan-700">
              {data.humidity !== null ? `${data.humidity}%` : 'N/A'}
            </p>
          </div>

          {/* Gas Concentration */}
          <div className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium mb-1">Gas (PPM)</p>
            <p className="text-2xl font-bold text-purple-700">
              {data.gas_ppm}
            </p>
          </div>

          {/* Voltage */}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium mb-1">Voltage</p>
            <p className="text-2xl font-bold text-green-700">
              {data.voltage.toFixed(3)}V
            </p>
          </div>

          {/* Gas ADC */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-medium mb-1">Gas ADC</p>
            <p className="text-2xl font-bold text-gray-700">
              {data.gas_adc}
            </p>
          </div>

          {/* Alarm Status */}
          <div className={`${data.alarm ? 'bg-red-50' : 'bg-green-50'} rounded-lg p-3`}>
            <p className={`text-xs ${data.alarm ? 'text-red-600' : 'text-green-600'} font-medium mb-1`}>
              Status
            </p>
            <p className={`text-2xl font-bold ${data.alarm ? 'text-red-700' : 'text-green-700'}`}>
              {data.alarm ? '🚨 ALARM' : '✓ Normal'}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>Waiting for sensor data...</p>
        </div>
      )}
    </div>
  );
}
