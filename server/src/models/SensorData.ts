import mongoose, { Schema, Document } from 'mongoose';

export interface ISensorData extends Document {
  deviceId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  co: number;
  co2: number;
  lpg: number;
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
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  co: {
    type: Number,
    required: true
  },
  co2: {
    type: Number,
    required: true
  },
  lpg: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  // auto-delete data older than 7 days to save space
  expires: '7d'
});

// Compound index for efficient queries
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model<ISensorData>('SensorData', SensorDataSchema);