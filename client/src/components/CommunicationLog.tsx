"use client";

import { useEffect, useState, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  type: 'SENT' | 'RECEIVED';
  rawData: string;
  status: 'success' | 'error';
}

export default function CommunicationLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Generate dummy log entries
  const generateDummyLog = (): LogEntry => {
    const now = new Date();
    const devices = ['Tongkat 1', 'Tongkat 2', 'Tongkat 3'];
    const deviceId = Math.floor(Math.random() * 3) + 1;
    const isReceived = Math.random() > 0.3; // 70% received, 30% sent

    const rawData = isReceived
      ? `{"temp":${(Math.random() * 20 + 25).toFixed(2)},"hum":${(Math.random() * 40 + 30).toFixed(2)},"co2":${Math.floor(Math.random() * 800)},"timestamp":"${now.toISOString()}"}`
      : `{"cmd":"GET_STATUS","device_id":"${deviceId}"}`;

    return {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: now.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
      }),
      deviceId: `device-${deviceId}`,
      deviceName: devices[deviceId - 1],
      type: isReceived ? 'RECEIVED' : 'SENT',
      rawData,
      status: Math.random() > 0.05 ? 'success' : 'error'
    };
  };

  useEffect(() => {
    // Generate initial logs
    const initialLogs: LogEntry[] = [];
    for (let i = 0; i < 10; i++) {
      initialLogs.unshift(generateDummyLog());
    }
    setLogs(initialLogs);

    // Simulate real-time logs
    const interval = setInterval(() => {
      if (!isPaused) {
        setLogs(prev => {
          const newLog = generateDummyLog();
          const updated = [newLog, ...prev];
          return updated.slice(0, 100); // Keep only last 100 logs
        });
      }
    }, 2000); // New log every 2 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto scroll to top when new log arrives
  useEffect(() => {
    if (isAutoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, isAutoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `communication-log-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl font-bold text-[#2F4156] mb-2"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                📡 Communication Log
              </h1>
              <p 
                className="text-gray-600"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                Real-time hardware communication monitoring
              </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isPaused 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>

              <button
                onClick={() => setIsAutoScroll(!isAutoScroll)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isAutoScroll 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                }`}
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                {isAutoScroll ? '📌 Auto Scroll: ON' : '📌 Auto Scroll: OFF'}
              </button>

              <button
                onClick={exportLogs}
                className="px-4 py-2 bg-[#567C8D] hover:bg-[#476b7a] text-white rounded-lg font-semibold transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                💾 Export
              </button>

              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                style={{ fontFamily: 'Nunito, sans-serif' }}
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Total Logs
              </p>
              <p className="text-2xl font-bold text-[#2F4156]" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {logs.length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Received
              </p>
              <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {logs.filter(l => l.type === 'RECEIVED').length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Sent
              </p>
              <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {logs.filter(l => l.type === 'SENT').length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                Errors
              </p>
              <p className="text-2xl font-bold text-red-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
                {logs.filter(l => l.status === 'error').length}
              </p>
            </div>
          </div>
        </div>

        {/* Log Container - Terminal Style */}
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div 
            ref={logContainerRef}
            className="h-[600px] overflow-y-auto overflow-x-auto p-4 font-mono text-sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500" style={{ fontFamily: 'Nunito, sans-serif' }}>
                  No logs yet. Waiting for communication...
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="mb-1 hover:bg-gray-800/50 px-2 py-1 rounded transition-colors"
                >
                  {/* One-line log format */}
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  {' '}
                  <span
                    className={`font-bold ${
                      log.type === 'RECEIVED'
                        ? 'text-green-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {log.type}
                  </span>
                  {' '}
                  <span className="text-yellow-400">{log.deviceName}</span>
                  {' '}
                  <span className="text-gray-400">({log.deviceId})</span>
                  {' '}
                  {log.status === 'error' && (
                    <>
                      <span className="text-red-500 font-bold">[ERROR]</span>
                      {' '}
                    </>
                  )}
                  <span className="text-gray-300">{log.rawData}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600" style={{ fontFamily: 'Nunito, sans-serif' }}>
            💡 Logs are automatically updated every 2 seconds • Maximum 100 logs stored
          </p>
        </div>
      </div>
    </div>
  );
}