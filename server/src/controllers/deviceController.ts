import { Request, Response } from 'express';
import Device, { IDevice } from '../models/Device';

export const createDevice = async (req: Request, res: Response) => {
  try {
    const deviceData: IDevice = new Device(req.body);
    const savedDevice = await deviceData.save();

    res.status(201).json({
      success: true,
      data: savedDevice,
      message: 'Device created successfully'
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Device ID already exists',
        error: error.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Error creating device',
        error: error.message
      });
    }
  }
};

export const getDevices = async (req: Request, res: Response) => {
  try {
    const { statusDevice, userId, isActive, limit = 100, page = 1 } = req.query;

    const query: any = {};

    if (statusDevice) {
      query.statusDevice = statusDevice;
    }

    if (userId) {
      query.userId = userId;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const devices = await Device
      .find(query)
      .populate('userId', 'username email firstName lastName')
      .sort({ lastHeartbeat: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Device.countDocuments(query);

    res.json({
      success: true,
      data: devices,
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
      message: 'Error fetching devices',
      error: error.message
    });
  }
};

export const getDeviceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const device = await Device.findById(id).populate('userId', 'username email firstName lastName');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching device',
      error: error.message
    });
  }
};

export const getDeviceByDeviceId = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findOne({ deviceId }).populate('userId', 'username email firstName lastName');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching device',
      error: error.message
    });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const device = await Device.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username email firstName lastName');

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device,
      message: 'Device updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating device',
      error: error.message
    });
  }
};

export const updateDeviceStatus = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { statusDevice } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        statusDevice,
        lastHeartbeat: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      data: device,
      message: 'Device status updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating device status',
      error: error.message
    });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const device = await Device.findByIdAndDelete(id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting device',
      error: error.message
    });
  }
};

export const getDeviceStatusSummary = async (req: Request, res: Response) => {
  try {
    const statusSummary = await Device.aggregate([
      {
        $group: {
          _id: '$statusDevice',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      online: 0,
      offline: 0,
      error: 0,
      total: 0
    };

    statusSummary.forEach(item => {
      summary[item._id as keyof typeof summary] = item.count;
      summary.total += item.count;
    });

    res.json({
      success: true,
      data: summary
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching device status summary',
      error: error.message
    });
  }
};