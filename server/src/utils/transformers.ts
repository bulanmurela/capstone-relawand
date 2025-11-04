import { IDevice } from '../models/Device';

export interface TransformedDevice {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  deviceId: string;
  batteryLevel?: number;
  signalStrength?: number;
  lastHeartbeat?: Date;
  isActive?: boolean;
}

export const transformDevice = (device: any): TransformedDevice => {
  return {
    _id: String(device._id || ''),
    name: device.deviceName || '',
    latitude: device.location?.latitude || 0,
    longitude: device.location?.longitude || 0,
    status: device.statusDevice || 'offline',
    deviceId: device.deviceId || '',
    batteryLevel: device.batteryLevel,
    signalStrength: device.signalStrength,
    lastHeartbeat: device.lastHeartbeat,
    isActive: device.isActive
  };
};

export const transformDevices = (devices: any[]): TransformedDevice[] => {
  return devices.map(device => transformDevice(device));
};