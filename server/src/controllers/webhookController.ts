import { Request, Response } from 'express';
import ImageCapture from '../models/ImageCapture';
import fs from 'fs';
import path from 'path';

// Upload directory configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/relawand/uploads';
const BASE_URL = process.env.BASE_URL || 'http://103.197.188.247';

// Ensure upload directory exists
export const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`[Webhook] Created upload directory: ${UPLOAD_DIR}`);
  }
};

/**
 * Webhook endpoint for IoT devices to upload images
 * POST /api/webhook/image
 *
 * Expected multipart/form-data fields:
 * - image: file (required)
 * - deviceId: string (required)
 * - triggeredBy: 'manual' | 'alert' | 'scheduled' (default: 'manual')
 * - alertId: string (optional)
 * - userId: string (optional, defaults to default user)
 * - metadata: JSON string (optional)
 */
export const uploadImage = async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Get deviceId from body
    const { deviceId, triggeredBy, alertId, userId, metadata } = req.body;

    if (!deviceId) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'deviceId is required'
      });
    }

    // Parse metadata if provided
    let parsedMetadata;
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      } catch (error) {
        console.error('[Webhook] Failed to parse metadata:', error);
        parsedMetadata = undefined;
      }
    }

    // Generate image URL
    const imageUrl = `${BASE_URL}/uploads/${req.file.filename}`;

    // Create image capture record
    const imageCapture = new ImageCapture({
      deviceId: deviceId.trim(),
      imageUrl,
      imagePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      triggeredBy: triggeredBy || 'manual',
      captureTime: new Date(),
      alertId: alertId || undefined,
      userId: userId || process.env.DEFAULT_USER_ID || '000000000000000000000000',
      metadata: parsedMetadata,
      isProcessed: false
    });

    await imageCapture.save();

    console.log(`[Webhook] ✅ Image uploaded from device ${deviceId}: ${req.file.filename}`);

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: imageCapture._id,
        deviceId: imageCapture.deviceId,
        imageUrl: imageCapture.imageUrl,
        fileName: imageCapture.fileName,
        fileSize: imageCapture.fileSize,
        captureTime: imageCapture.captureTime,
        triggeredBy: imageCapture.triggeredBy
      }
    });

  } catch (error: any) {
    console.error('[Webhook] ❌ Error uploading image:', error);

    // Clean up file if it was uploaded
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('[Webhook] Failed to delete uploaded file:', unlinkError);
      }
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

/**
 * Get uploaded images for a device
 * GET /api/webhook/images/:deviceId
 */
export const getDeviceImages = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const images = await ImageCapture.find({ deviceId })
      .sort({ captureTime: -1 })
      .limit(Number(limit))
      .skip(Number(offset))
      .select('-__v');

    const total = await ImageCapture.countDocuments({ deviceId });

    return res.json({
      success: true,
      data: {
        images,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: total > Number(offset) + images.length
        }
      }
    });

  } catch (error: any) {
    console.error('[Webhook] Error fetching images:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: error.message
    });
  }
};

/**
 * Delete an image
 * DELETE /api/webhook/images/:id
 */
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const imageCapture = await ImageCapture.findById(id);

    if (!imageCapture) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete file from disk
    if (imageCapture.imagePath && fs.existsSync(imageCapture.imagePath)) {
      try {
        fs.unlinkSync(imageCapture.imagePath);
        console.log(`[Webhook] Deleted file: ${imageCapture.imagePath}`);
      } catch (error) {
        console.error('[Webhook] Failed to delete file:', error);
      }
    }

    // Delete database record
    await ImageCapture.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error: any) {
    console.error('[Webhook] Error deleting image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

/**
 * Health check endpoint
 * GET /api/webhook/health
 */
export const webhookHealth = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Webhook service is running',
    uploadDir: UPLOAD_DIR,
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString()
  });
};
