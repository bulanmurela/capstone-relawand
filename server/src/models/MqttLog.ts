// server/src/models/MqttLog.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMqttLog extends Document {
  deviceId: string;
  deviceName: string;
  type: 'SENT' | 'RECEIVED';
  topic: string;
  payload: string;
  status: 'success' | 'error';
  errorMessage?: string;
  timestamp: Date;
  createdAt: Date;
}

const MqttLogSchema = new Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['SENT', 'RECEIVED'],
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  payload: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'error'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  // Auto-delete logs older than 7 days to save space
  expires: '7d'
});

// Compound index for efficient queries
MqttLogSchema.index({ timestamp: -1 });
MqttLogSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model<IMqttLog>('MqttLog', MqttLogSchema);
