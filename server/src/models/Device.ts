import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  _id: mongoose.Types.ObjectId;
  deviceName: string;
  deviceType: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  statusDevice: 'offline' | 'online' | 'error';
  lastHeartbeat?: Date;
  firmwareVersion?: string;
  batteryLevel?: number;
  signalStrength?: number;
  userId: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema: Schema = new Schema({
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  deviceType: {
    type: String,
    required: true,
    trim: true,
    default: 'STM32'
  },
  location: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true,
      maxlength: 255
    }
  },
  statusDevice: {
    type: String,
    enum: ['offline', 'online', 'error'],
    default: 'offline',
    required: true
  },
  lastHeartbeat: {
    type: Date
  },
  firmwareVersion: {
    type: String,
    trim: true
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  signalStrength: {
    type: Number,
    min: -120,
    max: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

DeviceSchema.index({ deviceId: 1 }, { unique: true });
DeviceSchema.index({ userId: 1 });
DeviceSchema.index({ statusDevice: 1 });
DeviceSchema.index({ lastHeartbeat: -1 });

export default mongoose.model<IDevice>('Device', DeviceSchema);