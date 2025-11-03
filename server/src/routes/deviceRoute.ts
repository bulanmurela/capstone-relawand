import express from 'express';
import {
  createDevice,
  getDevices,
  getDeviceById,
  getDeviceByDeviceId,
  updateDevice,
  updateDeviceStatus,
  deleteDevice,
  getDeviceStatusSummary
} from '../controllers/deviceController';

const router = express.Router();

router.post('/', createDevice);
router.get('/', getDevices);
router.get('/summary/status', getDeviceStatusSummary);
router.get('/deviceId/:deviceId', getDeviceByDeviceId);
router.get('/:id', getDeviceById);
router.put('/:id', updateDevice);
router.patch('/status/:deviceId', updateDeviceStatus);
router.delete('/:id', deleteDevice);

export default router;