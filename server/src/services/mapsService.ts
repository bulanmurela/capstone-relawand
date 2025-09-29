import axios from 'axios';
import LocationData, { ILocationData } from '../models/LocationData';

export class MapsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  async geocodeCoordinates(latitude: number, longitude: number): Promise<any> {
    try {
      const url = `${this.baseUrl}/geocode/json`;
      const params = {
        latlng: `${latitude},${longitude}`,
        key: this.apiKey
      };

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return this.parseGeocodingResponse(response.data.results[0]);
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Return fallback data when API is not available
      return this.getFallbackLocationData(latitude, longitude);
    }
  }

  async reverseGeocode(address: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/geocode/json`;
      const params = {
        address: address,
        key: this.apiKey
      };

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          types: result.types
        };
      } else {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }

  async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/place/details/json`;
      const params = {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,types,address_components',
        key: this.apiKey
      };

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK') {
        return response.data.result;
      } else {
        throw new Error(`Place details failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Place details error:', error);
      throw error;
    }
  }

  async getNearbyPlaces(latitude: number, longitude: number, radius: number = 5000, type?: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/place/nearbysearch/json`;
      const params: any = {
        location: `${latitude},${longitude}`,
        radius: radius,
        key: this.apiKey
      };

      if (type) {
        params.type = type;
      }

      const response = await axios.get(url, { params });

      if (response.data.status === 'OK') {
        return response.data.results;
      } else {
        throw new Error(`Nearby search failed: ${response.data.status}`);
      }
    } catch (error) {
      console.error('Nearby places error:', error);
      return [];
    }
  }

  async generateStaticMapUrl(
    latitude: number,
    longitude: number,
    zoom: number = 15,
    size: string = '600x400',
    mapType: string = 'roadmap',
    markers?: Array<{ lat: number; lng: number; label?: string; color?: string }>
  ): Promise<string> {
    try {
      let url = `${this.baseUrl}/staticmap?`;
      url += `center=${latitude},${longitude}`;
      url += `&zoom=${zoom}`;
      url += `&size=${size}`;
      url += `&maptype=${mapType}`;

      if (markers && markers.length > 0) {
        markers.forEach(marker => {
          url += `&markers=`;
          if (marker.color) url += `color:${marker.color}%7C`;
          if (marker.label) url += `label:${marker.label}%7C`;
          url += `${marker.lat},${marker.lng}`;
        });
      } else {
        url += `&markers=color:red%7Clabel:Device%7C${latitude},${longitude}`;
      }

      url += `&key=${this.apiKey}`;
      return url;
    } catch (error) {
      console.error('Static map URL generation error:', error);
      return '';
    }
  }

  async saveLocationData(coordinates: { latitude: number; longitude: number }, deviceId: string): Promise<ILocationData> {
    try {
      // Check if location data already exists
      let locationData = await LocationData.findOne({
        'coordinates.latitude': coordinates.latitude,
        'coordinates.longitude': coordinates.longitude
      });

      if (locationData) {
        // Add deviceId if not already present
        if (!locationData.deviceIds.includes(deviceId)) {
          locationData.deviceIds.push(deviceId);
          locationData.lastUpdated = new Date();
          await locationData.save();
        }
        return locationData;
      }

      // Get location details from Maps API
      const geoData = await this.geocodeCoordinates(coordinates.latitude, coordinates.longitude);

      // Create new location data
      locationData = new LocationData({
        coordinates,
        address: geoData.address,
        geocoding: geoData.geocoding,
        mapData: {
          zoom: 15,
          mapType: 'roadmap'
        },
        metadata: geoData.metadata || {},
        deviceIds: [deviceId],
        lastUpdated: new Date()
      });

      await locationData.save();
      return locationData;
    } catch (error) {
      console.error('Error saving location data:', error);
      throw error;
    }
  }

  private parseGeocodingResponse(result: any): any {
    const addressComponents = result.address_components || [];

    return {
      address: {
        formatted: result.formatted_address,
        street: this.getAddressComponent(addressComponents, 'route'),
        city: this.getAddressComponent(addressComponents, 'locality') ||
              this.getAddressComponent(addressComponents, 'administrative_area_level_2'),
        state: this.getAddressComponent(addressComponents, 'administrative_area_level_1'),
        country: this.getAddressComponent(addressComponents, 'country'),
        postalCode: this.getAddressComponent(addressComponents, 'postal_code')
      },
      geocoding: {
        source: 'Google Maps',
        accuracy: result.geometry.location_type,
        placeId: result.place_id,
        types: result.types
      },
      metadata: {
        timezone: this.getTimezoneFromComponents(addressComponents)
      }
    };
  }

  private getAddressComponent(components: any[], type: string): string | undefined {
    const component = components.find(comp => comp.types.includes(type));
    return component ? component.long_name : undefined;
  }

  private getTimezoneFromComponents(components: any[]): string | undefined {
    // This is a simplified timezone detection
    // In production, you might want to use Google's Timezone API
    const country = this.getAddressComponent(components, 'country');
    const timezoneMap: { [key: string]: string } = {
      'Indonesia': 'Asia/Jakarta',
      'United States': 'America/New_York',
      'United Kingdom': 'Europe/London',
      'Australia': 'Australia/Sydney'
    };
    return country ? timezoneMap[country] : undefined;
  }

  private getFallbackLocationData(latitude: number, longitude: number): any {
    // Provide fallback data when Maps API is not available
    return {
      address: {
        formatted: `${latitude}, ${longitude}`,
        street: 'Unknown Street',
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'Unknown Country'
      },
      geocoding: {
        source: 'Fallback',
        accuracy: 'APPROXIMATE'
      },
      metadata: {
        timezone: 'UTC'
      }
    };
  }

  async getLocationsByDevices(deviceIds: string[]): Promise<ILocationData[]> {
    try {
      return await LocationData.find({
        deviceIds: { $in: deviceIds },
        isActive: true
      }).sort({ lastUpdated: -1 });
    } catch (error) {
      console.error('Error getting locations by devices:', error);
      throw error;
    }
  }

  async updateLocationForDevice(deviceId: string, coordinates: { latitude: number; longitude: number }): Promise<ILocationData> {
    try {
      // Remove device from old locations
      await LocationData.updateMany(
        { deviceIds: deviceId },
        { $pull: { deviceIds: deviceId } }
      );

      // Add to new location
      return await this.saveLocationData(coordinates, deviceId);
    } catch (error) {
      console.error('Error updating location for device:', error);
      throw error;
    }
  }
}