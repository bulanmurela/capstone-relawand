// server/src/models/Alert.ts
import mongoose, { Document } from 'mongoose';

export interface IAlertLog extends Document {
  deviceId: mongoose.Types.ObjectId | string;
  deviceName: string;
  level: 'NORMAL' | 'SIAGA' | 'DARURAT';
  temperature: number;
  humidity: number;
  gasConcentration: number;
  timestamp: Date;
  isViewed: boolean;
  viewedAt?: Date | null;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  deviceName: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['NORMAL', 'SIAGA', 'DARURAT'],
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  gasConcentration: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: {
    type: Date,
    required: false
  },
  isDemo: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IAlertLog>('Alert', alertSchema);