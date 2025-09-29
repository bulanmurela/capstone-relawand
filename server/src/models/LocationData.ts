import mongoose, { Document, Schema } from 'mongoose';

export interface ILocationData extends Document {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    formatted: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  geocoding: {
    source: string;
    accuracy?: string;
    placeId?: string;
    types?: string[];
  };
  mapData: {
    zoom?: number;
    mapType?: string;
    bounds?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  metadata: {
    timezone?: string;
    elevation?: number;
    nearbyLandmarks?: string[];
  };
  deviceIds: string[];
  lastUpdated: Date;
  isActive: boolean;
}

const LocationDataSchema: Schema = new Schema({
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  address: {
    formatted: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true
    }
  },
  geocoding: {
    source: {
      type: String,
      required: true,
      default: 'Google Maps'
    },
    accuracy: {
      type: String,
      trim: true
    },
    placeId: {
      type: String,
      trim: true
    },
    types: [{
      type: String,
      trim: true
    }]
  },
  mapData: {
    zoom: {
      type: Number,
      min: 1,
      max: 20,
      default: 15
    },
    mapType: {
      type: String,
      enum: ['roadmap', 'satellite', 'hybrid', 'terrain'],
      default: 'roadmap'
    },
    bounds: {
      northeast: {
        lat: Number,
        lng: Number
      },
      southwest: {
        lat: Number,
        lng: Number
      }
    }
  },
  metadata: {
    timezone: {
      type: String,
      trim: true
    },
    elevation: {
      type: Number
    },
    nearbyLandmarks: [{
      type: String,
      trim: true
    }]
  },
  deviceIds: [{
    type: String,
    trim: true
  }],
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
LocationDataSchema.index({
  'coordinates.latitude': 1,
  'coordinates.longitude': 1
});

// Index for device queries
LocationDataSchema.index({ deviceIds: 1 });

// Index for time-based queries
LocationDataSchema.index({ lastUpdated: -1 });

export default mongoose.model<ILocationData>('LocationData', LocationDataSchema);