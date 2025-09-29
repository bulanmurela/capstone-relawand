import mongoose, { Document, Schema } from 'mongoose';

export interface IImageCapture extends Document {
  deviceId: string;
  imageUrl: string;
  imagePath?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  triggeredBy: 'manual' | 'alert' | 'scheduled';
  captureTime: Date;
  scheduledTime?: Date;
  alertId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  metadata?: {
    resolution?: string;
    quality?: number;
    cameraSettings?: any;
  };
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ImageCaptureSchema: Schema = new Schema({
  deviceId: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  imagePath: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    min: 0
  },
  mimeType: {
    type: String,
    trim: true,
    default: 'image/jpeg'
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'alert', 'scheduled'],
    required: true
  },
  captureTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  scheduledTime: {
    type: Date
  },
  alertId: {
    type: Schema.Types.ObjectId,
    ref: 'AlertLog'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    resolution: {
      type: String,
      trim: true
    },
    quality: {
      type: Number,
      min: 1,
      max: 100
    },
    cameraSettings: {
      type: Schema.Types.Mixed
    }
  },
  isProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

ImageCaptureSchema.index({ deviceId: 1, captureTime: -1 });
ImageCaptureSchema.index({ userId: 1 });
ImageCaptureSchema.index({ triggeredBy: 1 });
ImageCaptureSchema.index({ alertId: 1 });
ImageCaptureSchema.index({ captureTime: -1 });

export default mongoose.model<IImageCapture>('ImageCapture', ImageCaptureSchema);