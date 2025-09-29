import express from 'express';
import {
  createImageCapture,
  getImageCaptures,
  getImageCaptureById,
  updateImageCapture,
  deleteImageCapture,
  getImageCapturesByDevice,
  getImageCaptureSummary
} from '../controllers/imageCaptureController';

const router = express.Router();

router.post('/', createImageCapture);
router.get('/', getImageCaptures);
router.get('/summary', getImageCaptureSummary);
router.get('/device/:deviceId', getImageCapturesByDevice);
router.get('/:id', getImageCaptureById);
router.put('/:id', updateImageCapture);
router.delete('/:id', deleteImageCapture);

export default router;