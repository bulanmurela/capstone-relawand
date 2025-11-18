import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadImage,
  getDeviceImages,
  deleteImage,
  webhookHealth,
  ensureUploadDir
} from '../controllers/webhookController';

const router = express.Router();

// Upload directory configuration
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/relawand/uploads';

// Ensure upload directory exists
ensureUploadDir();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: deviceId_timestamp_originalname
    const deviceId = req.body.deviceId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${deviceId}_${timestamp}_${sanitizedBasename}${ext}`;
    cb(null, filename);
  }
});

// File filter to only accept images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1 // Only one file at a time
  }
});

// Routes
// POST /api/webhook/image - Upload image from IoT device
router.post('/image', upload.single('image'), uploadImage);

// GET /api/webhook/images/:deviceId - Get images for a device
router.get('/images/:deviceId', getDeviceImages);

// DELETE /api/webhook/images/:id - Delete an image
router.delete('/images/:id', deleteImage);

// GET /api/webhook/health - Health check
router.get('/health', webhookHealth);

// Error handling middleware for multer errors
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
});

export default router;
