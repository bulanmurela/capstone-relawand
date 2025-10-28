import express, { Request, Response } from 'express';
import Device from '../models/Device';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  }
  catch (error) {
    res.status(500).json({ message: 'Error retrieving devices', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, latitude, longitude, status } = req.body;
    const newDevice = new Device({ name, latitude, longitude, status });
    
    await newDevice.save();
    res.status(201).json(newDevice);
  }
  catch (error) {
    res.status(500).json({ message: 'Error creating device', error });
  }
});

export default router;
// import {
//   createDevice,
//   getDevices,
//   getDeviceById,
//   getDeviceByDeviceId,
//   updateDevice,
//   updateDeviceStatus,
//   deleteDevice,
//   getDeviceStatusSummary
// } from '../controllers/deviceController';

// const router = express.Router();

// router.post('/', createDevice);
// router.get('/', getDevices);
// router.get('/summary/status', getDeviceStatusSummary);
// router.get('/deviceId/:deviceId', getDeviceByDeviceId);
// router.get('/:id', getDeviceById);
// router.put('/:id', updateDevice);
// router.patch('/status/:deviceId', updateDeviceStatus);
// router.delete('/:id', deleteDevice);

// export default router;