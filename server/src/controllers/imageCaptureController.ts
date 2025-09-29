import { Request, Response } from 'express';
import ImageCapture, { IImageCapture } from '../models/ImageCapture';

export const createImageCapture = async (req: Request, res: Response) => {
  try {
    const imageCaptureData: IImageCapture = new ImageCapture(req.body);
    const savedImageCapture = await imageCaptureData.save();

    res.status(201).json({
      success: true,
      data: savedImageCapture,
      message: 'Image capture record created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating image capture record',
      error: error.message
    });
  }
};

export const getImageCaptures = async (req: Request, res: Response) => {
  try {
    const {
      deviceId,
      triggeredBy,
      userId,
      startDate,
      endDate,
      isProcessed,
      limit = 100,
      page = 1
    } = req.query;

    const query: any = {};

    if (deviceId) {
      query.deviceId = deviceId;
    }

    if (triggeredBy) {
      query.triggeredBy = triggeredBy;
    }

    if (userId) {
      query.userId = userId;
    }

    if (isProcessed !== undefined) {
      query.isProcessed = isProcessed === 'true';
    }

    if (startDate || endDate) {
      query.captureTime = {};
      if (startDate) query.captureTime.$gte = new Date(startDate as string);
      if (endDate) query.captureTime.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const imageCaptures = await ImageCapture
      .find(query)
      .populate('userId', 'username email firstName lastName')
      .populate('alertId')
      .sort({ captureTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ImageCapture.countDocuments(query);

    res.json({
      success: true,
      data: imageCaptures,
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
      message: 'Error fetching image captures',
      error: error.message
    });
  }
};

export const getImageCaptureById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const imageCapture = await ImageCapture.findById(id)
      .populate('userId', 'username email firstName lastName')
      .populate('alertId');

    if (!imageCapture) {
      return res.status(404).json({
        success: false,
        message: 'Image capture not found'
      });
    }

    res.json({
      success: true,
      data: imageCapture
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching image capture',
      error: error.message
    });
  }
};

export const updateImageCapture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const imageCapture = await ImageCapture.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username email firstName lastName');

    if (!imageCapture) {
      return res.status(404).json({
        success: false,
        message: 'Image capture not found'
      });
    }

    res.json({
      success: true,
      data: imageCapture,
      message: 'Image capture updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating image capture',
      error: error.message
    });
  }
};

export const deleteImageCapture = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const imageCapture = await ImageCapture.findByIdAndDelete(id);

    if (!imageCapture) {
      return res.status(404).json({
        success: false,
        message: 'Image capture not found'
      });
    }

    res.json({
      success: true,
      message: 'Image capture deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting image capture',
      error: error.message
    });
  }
};

export const getImageCapturesByDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const imageCaptures = await ImageCapture
      .find({ deviceId })
      .populate('userId', 'username email firstName lastName')
      .sort({ captureTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ImageCapture.countDocuments({ deviceId });

    res.json({
      success: true,
      data: imageCaptures,
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
      message: 'Error fetching image captures for device',
      error: error.message
    });
  }
};

export const getImageCaptureSummary = async (req: Request, res: Response) => {
  try {
    const summary = await ImageCapture.aggregate([
      {
        $group: {
          _id: '$triggeredBy',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      manual: 0,
      alert: 0,
      scheduled: 0,
      total: 0
    };

    summary.forEach(item => {
      result[item._id as keyof typeof result] = item.count;
      result.total += item.count;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching image capture summary',
      error: error.message
    });
  }
};