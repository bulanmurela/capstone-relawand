import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceData extends Document {
  deviceId: string;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

const DeviceDataSchema: Schema = new Schema({
  deviceId: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IDeviceData>('DeviceData', DeviceDataSchema);
