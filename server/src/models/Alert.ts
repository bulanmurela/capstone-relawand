// server/src/models/Alert.ts
import mongoose from 'mongoose';

export interface IAlertLog {
  deviceId: mongoose.Types.ObjectId | string;
  deviceName: string;
  level: 'NORMAL' | 'SIAGA' | 'DARURAT';
  temperature: number;
  humidity: number;
  gasConcentration: number;
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
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
  }
}, {
  timestamps: true
});

export default mongoose.model('Alert', alertSchema);