import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorData extends Document {
  deviceId: string;
  timestamp: Date;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  light?: number;
  motion?: boolean;
  voltage?: number;
  current?: number;
  power?: number;
  energy?: number;
  frequency?: number;
  powerFactor?: number;
  dht?: any;
  mq?: any;
  rawData?: any;
  location?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  metadata?: {
    firmwareVersion?: string;
    batteryLevel?: number;
    signalStrength?: number;
    [key: string]: any;
  };
  userId: mongoose.Types.ObjectId;
}

const SensorDataSchema: Schema = new Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  temperature: {
    type: Number,
    min: -50,
    max: 150
  },
  humidity: {
    type: Number,
    min: 0,
    max: 100
  },
  pressure: {
    type: Number,
    min: 0
  },
  light: {
    type: Number,
    min: 0
  },
  motion: {
    type: Boolean
  },
  voltage: {
    type: Number,
    min: 0
  },
  current: {
    type: Number,
    min: 0
  },
  power: {
    type: Number,
    min: 0
  },
  energy: {
    type: Number,
    min: 0
  },
  frequency: {
    type: Number,
    min: 0,
    max: 100
  },
  powerFactor: {
    type: Number,
    min: 0,
    max: 1
  },
  dht: {
    type: Schema.Types.Mixed
  },
  mq: {
    type: Schema.Types.Mixed
  },
  rawData: {
    type: Schema.Types.Mixed
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
    altitude: {
      type: Number
    }
  },
  metadata: {
    firmwareVersion: String,
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100
    },
    signalStrength: {
      type: Number,
      min: -120,
      max: 0
    }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model<ISensorData>('SensorData', SensorDataSchema);