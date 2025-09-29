import express from 'express';
import {
  geocodeCoordinates,
  reverseGeocode,
  getDeviceLocations,
  getStaticMapUrl,
  getDeviceMap,
  getAllDevicesMap,
  getNearbyPlaces,
  saveLocationData,
  updateDeviceLocation,
  getLocationHistory
} from '../controllers/mapsController';

const router = express.Router();

// Geocoding services
router.get('/geocode/:latitude/:longitude', geocodeCoordinates);
router.post('/reverse-geocode', reverseGeocode);

// Device location services
router.get('/devices', getDeviceLocations);
router.get('/device/:deviceId', getDeviceMap);
router.get('/all-devices', getAllDevicesMap);
router.put('/device/:deviceId/location', updateDeviceLocation);
router.get('/device/:deviceId/history', getLocationHistory);

// Static map generation
router.get('/static/:latitude/:longitude', getStaticMapUrl);

// Nearby places
router.get('/nearby/:latitude/:longitude', getNearbyPlaces);

// Location data management
router.post('/save', saveLocationData);

export default router;