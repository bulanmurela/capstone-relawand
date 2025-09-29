import express from 'express';
import {
  createAlertLog,
  getAlertLogs,
  getAlertLogById,
  updateAlertLog,
  resolveAlert,
  deleteAlertLog,
  getAlertsByDevice,
  getAlertSummary,
  getActiveAlerts
} from '../controllers/alertLogController';

const router = express.Router();

router.post('/', createAlertLog);
router.get('/', getAlertLogs);
router.get('/summary', getAlertSummary);
router.get('/active', getActiveAlerts);
router.get('/device/:deviceId', getAlertsByDevice);
router.get('/:id', getAlertLogById);
router.put('/:id', updateAlertLog);
router.patch('/resolve/:id', resolveAlert);
router.delete('/:id', deleteAlertLog);

export default router;