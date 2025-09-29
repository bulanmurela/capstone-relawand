import mongoose, { Document, Schema } from 'mongoose';

export interface IWeatherData {
  location: {
    latitude: number;
    longitude: number;
    name?: string;
    country?: string;
    state?: string;
  };
  current: {
    datetime: Date;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    uvIndex: number;
    precipitation: number;
    weatherCondition: string;
    weatherDescription: string;
    weatherIcon: string;
    cloudiness: number;
  };
  forecast?: {
    datetime: Date;
    temperature: {
      min: number;
      max: number;
    };
    humidity: number;
    windSpeed: number;
    precipitation: number;
    weatherCondition: string;
    weatherDescription: string;
    weatherIcon: string;
  }[];
  lastUpdated: Date;
  source: string;
  apiResponseRaw?: any;
  isActive: boolean;
}

// Document type khusus untuk Mongoose
export interface IWeatherDataDocument extends IWeatherData, Document {}

const WeatherDataSchema: Schema = new Schema(
  {
    location: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
      name: { type: String, trim: true },
      country: { type: String, trim: true },
      state: { type: String, trim: true },
    },
    current: {
      datetime: { type: Date, required: true },
      temperature: { type: Number, required: true },
      feelsLike: { type: Number },
      humidity: { type: Number, required: true, min: 0, max: 100 },
      pressure: { type: Number, min: 0 },
      windSpeed: { type: Number, required: true, min: 0 },
      windDirection: { type: Number, min: 0, max: 360 },
      visibility: { type: Number, min: 0 },
      uvIndex: { type: Number, min: 0 },
      precipitation: { type: Number, required: true, min: 0, default: 0 },
      weatherCondition: { type: String, required: true, trim: true },
      weatherDescription: { type: String, required: true, trim: true },
      weatherIcon: { type: String, trim: true },
      cloudiness: { type: Number, min: 0, max: 100 },
    },
    forecast: [
      {
        datetime: { type: Date, required: true },
        temperature: {
          min: { type: Number, required: true },
          max: { type: Number, required: true },
        },
        humidity: { type: Number, min: 0, max: 100 },
        windSpeed: { type: Number, min: 0 },
        precipitation: { type: Number, min: 0, default: 0 },
        weatherCondition: { type: String, required: true, trim: true },
        weatherDescription: { type: String, required: true, trim: true },
        weatherIcon: { type: String, trim: true },
      },
    ],
    lastUpdated: { type: Date, required: true, default: Date.now },
    source: { type: String, required: true, default: 'OpenWeatherMap' },
    apiResponseRaw: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WeatherDataSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
WeatherDataSchema.index({ lastUpdated: -1 });
WeatherDataSchema.index({ 'current.datetime': -1 });
WeatherDataSchema.index(
  {
    'location.latitude': 1,
    'location.longitude': 1,
    'current.datetime': 1,
  },
  { unique: true }
);

export default mongoose.model<IWeatherDataDocument>(
  'WeatherData',
  WeatherDataSchema
);
