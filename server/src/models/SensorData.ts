import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
  deviceId: string;
  timestamp: Date;
  temperature: number | null;
  humidity: number | null;
  gas_adc: number;
  gas_ppm: number;
  voltage: number;
  alarm: boolean;
  createdAt: Date;
}

const SensorDataSchema = new Schema({
  deviceId: {
    type: String,
    required: true,
    index: true // For faster queries
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  temperature: {
    type: Number,
    required: false,
    default: null
  },
  humidity: {
    type: Number,
    required: false,
    default: null
  },
  gas_adc: {
    type: Number,
    required: true
  },
  gas_ppm: {
    type: Number,
    required: true
  },
  voltage: {
    type: Number,
    required: true
  },
  alarm: {
    type: Boolean,
    required: true,
    default: false
  },
  isDemo: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model<ISensorData>('SensorData', SensorDataSchema);