import mongoose, { Document, Schema } from 'mongoose';

export interface IAlertLog extends Document {
  deviceId: string;
  alertType: string;
  status: 'SIAGA' | 'DARURAT';
  message: string;
  sensorData: {
    temperature?: number;
    humidity?: number;
    dht?: any;
    mq?: any;
    [key: string]: any;
  };
  thresholdValues: {
    temperatureThreshold?: number;
    humidityThreshold?: number;
    dhtThreshold?: any;
    mqThreshold?: any;
    [key: string]: any;
  };
  alertTime: Date;
  resolvedTime?: Date;
  isResolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  severity: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AlertLogSchema: Schema = new Schema({
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  alertType: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['SIAGA', 'DARURAT'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  sensorData: {
    temperature: Number,
    humidity: Number,
    dht: Schema.Types.Mixed,
    mq: Schema.Types.Mixed
  },
  thresholdValues: {
    temperatureThreshold: Number,
    humidityThreshold: Number,
    dhtThreshold: Schema.Types.Mixed,
    mqThreshold: Schema.Types.Mixed
  },
  alertTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  resolvedTime: {
    type: Date
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

AlertLogSchema.index({ deviceId: 1, alertTime: -1 });
AlertLogSchema.index({ userId: 1 });
AlertLogSchema.index({ status: 1 });
AlertLogSchema.index({ isResolved: 1 });
AlertLogSchema.index({ alertTime: -1 });
AlertLogSchema.index({ severity: -1 });

export default mongoose.model<IAlertLog>('AlertLog', AlertLogSchema);