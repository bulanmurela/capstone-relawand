import { Request, Response } from 'express';
import { MapsService } from '../services/mapsService';
import LocationData, { ILocationData } from '../models/LocationData';
import { Device } from '../models';

const mapsService = new MapsService();

export const geocodeCoordinates = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.params;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    const locationData = await mapsService.geocodeCoordinates(lat, lng);

    res.json({
      success: true,
      data: locationData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error geocoding coordinates',
      error: error.message
    });
  }
};

export const reverseGeocode = async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }

    const coordinates = await mapsService.reverseGeocode(address);

    res.json({
      success: true,
      data: coordinates
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error reverse geocoding address',
      error: error.message
    });
  }
};

export const getDeviceLocations = async (req: Request, res: Response) => {
  try {
    const { deviceIds } = req.query;

    let deviceIdArray: string[] = [];

    if (deviceIds) {
      if (typeof deviceIds === 'string') {
        deviceIdArray = deviceIds.split(',');
      } else if (Array.isArray(deviceIds)) {
        deviceIdArray = deviceIds as string[];
      }
    }

    let devices;
    if (deviceIdArray.length > 0) {
      devices = await Device.find({
        deviceId: { $in: deviceIdArray },
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true },
        isActive: true
      }).populate('userId', 'username email');
    } else {
      devices = await Device.find({
        'location.latitude': { $exists: true },
        'location.longitude': { $exists: true },
        isActive: true
      }).populate('userId', 'username email');
    }

    const deviceLocations = devices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      coordinates: {
        latitude: device.location!.latitude,
        longitude: device.location!.longitude
      },
      address: device.location!.address || 'Unknown address',
      status: device.statusDevice,
      lastHeartbeat: device.lastHeartbeat,
      user: device.userId
    }));

    res.json({
      success: true,
      data: deviceLocations,
      count: deviceLocations.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching device locations',
      error: error.message
    });
  }
};

export const getStaticMapUrl = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.params;
    const { zoom, size, mapType, markers } = req.query;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    let markerArray;
    if (markers && typeof markers === 'string') {
      try {
        markerArray = JSON.parse(markers);
      } catch (e) {
        markerArray = undefined;
      }
    }

    const mapUrl = await mapsService.generateStaticMapUrl(
      lat,
      lng,
      zoom ? parseInt(zoom as string) : 15,
      size as string || '600x400',
      mapType as string || 'roadmap',
      markerArray
    );

    res.json({
      success: true,
      data: {
        mapUrl,
        coordinates: { latitude: lat, longitude: lng },
        zoom: zoom || 15,
        size: size || '600x400',
        mapType: mapType || 'roadmap'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating static map URL',
      error: error.message
    });
  }
};

export const getDeviceMap = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { zoom, size, mapType } = req.query;

    const device = await Device.findOne({
      deviceId,
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found or has no location data'
      });
    }

    const lat = device.location!.latitude!;
    const lng = device.location!.longitude!;

    const markers = [{
      lat,
      lng,
      label: device.deviceName.charAt(0).toUpperCase(),
      color: device.statusDevice === 'online' ? 'green' :
             device.statusDevice === 'error' ? 'red' : 'gray'
    }];

    const mapUrl = await mapsService.generateStaticMapUrl(
      lat,
      lng,
      zoom ? parseInt(zoom as string) : 15,
      size as string || '600x400',
      mapType as string || 'roadmap',
      markers
    );

    res.json({
      success: true,
      data: {
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        coordinates: { latitude: lat, longitude: lng },
        address: device.location!.address,
        status: device.statusDevice,
        mapUrl,
        zoom: zoom || 15,
        size: size || '600x400',
        mapType: mapType || 'roadmap'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating device map',
      error: error.message
    });
  }
};

export const getAllDevicesMap = async (req: Request, res: Response) => {
  try {
    const { zoom, size, mapType } = req.query;

    const devices = await Device.find({
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true },
      isActive: true
    });

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No devices with location data found'
      });
    }

    // Calculate center point
    const latSum = devices.reduce((sum, device) => sum + device.location!.latitude!, 0);
    const lngSum = devices.reduce((sum, device) => sum + device.location!.longitude!, 0);
    const centerLat = latSum / devices.length;
    const centerLng = lngSum / devices.length;

    // Create markers for all devices
    const markers = devices.map((device, index) => ({
      lat: device.location!.latitude!,
      lng: device.location!.longitude!,
      label: (index + 1).toString(),
      color: device.statusDevice === 'online' ? 'green' :
             device.statusDevice === 'error' ? 'red' : 'gray'
    }));

    const mapUrl = await mapsService.generateStaticMapUrl(
      centerLat,
      centerLng,
      zoom ? parseInt(zoom as string) : 10,
      size as string || '800x600',
      mapType as string || 'roadmap',
      markers
    );

    const deviceList = devices.map((device, index) => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      coordinates: {
        latitude: device.location!.latitude,
        longitude: device.location!.longitude
      },
      address: device.location!.address,
      status: device.statusDevice,
      markerLabel: index + 1
    }));

    res.json({
      success: true,
      data: {
        mapUrl,
        center: { latitude: centerLat, longitude: centerLng },
        devices: deviceList,
        deviceCount: devices.length,
        zoom: zoom || 10,
        size: size || '800x600',
        mapType: mapType || 'roadmap'
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error generating all devices map',
      error: error.message
    });
  }
};

export const getNearbyPlaces = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.params;
    const { radius, type } = req.query;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided'
      });
    }

    const places = await mapsService.getNearbyPlaces(
      lat,
      lng,
      radius ? parseInt(radius as string) : 5000,
      type as string
    );

    res.json({
      success: true,
      data: places,
      count: places.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby places',
      error: error.message
    });
  }
};

export const saveLocationData = async (req: Request, res: Response) => {
  try {
    const { coordinates, deviceId } = req.body;

    if (!coordinates || !coordinates.latitude || !coordinates.longitude || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates and deviceId are required'
      });
    }

    const locationData = await mapsService.saveLocationData(coordinates, deviceId);

    res.status(201).json({
      success: true,
      data: locationData,
      message: 'Location data saved successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error saving location data',
      error: error.message
    });
  }
};

export const updateDeviceLocation = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { coordinates } = req.body;

    if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates are required'
      });
    }

    const locationData = await mapsService.updateLocationForDevice(deviceId, coordinates);

    res.json({
      success: true,
      data: locationData,
      message: 'Device location updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating device location',
      error: error.message
    });
  }
};

export const getLocationHistory = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const locations = await LocationData
      .find({ deviceIds: deviceId, isActive: true })
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await LocationData.countDocuments({
      deviceIds: deviceId,
      isActive: true
    });

    res.json({
      success: true,
      data: locations,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching location history',
      error: error.message
    });
  }
};