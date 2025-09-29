import { Request, Response } from 'express';
import AlertLog, { IAlertLog } from '../models/AlertLog';

export const createAlertLog = async (req: Request, res: Response) => {
  try {
    const alertLogData: IAlertLog = new AlertLog(req.body);
    const savedAlertLog = await alertLogData.save();

    res.status(201).json({
      success: true,
      data: savedAlertLog,
      message: 'Alert log created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating alert log',
      error: error.message
    });
  }
};

export const getAlertLogs = async (req: Request, res: Response) => {
  try {
    const {
      deviceId,
      status,
      alertType,
      userId,
      isResolved,
      severity,
      startDate,
      endDate,
      limit = 100,
      page = 1
    } = req.query;

    const query: any = {};

    if (deviceId) {
      query.deviceId = deviceId;
    }

    if (status) {
      query.status = status;
    }

    if (alertType) {
      query.alertType = alertType;
    }

    if (userId) {
      query.userId = userId;
    }

    if (isResolved !== undefined) {
      query.isResolved = isResolved === 'true';
    }

    if (severity) {
      query.severity = Number(severity);
    }

    if (startDate || endDate) {
      query.alertTime = {};
      if (startDate) query.alertTime.$gte = new Date(startDate as string);
      if (endDate) query.alertTime.$lte = new Date(endDate as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const alertLogs = await AlertLog
      .find(query)
      .populate('userId', 'username email firstName lastName')
      .populate('resolvedBy', 'username email firstName lastName')
      .sort({ alertTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AlertLog.countDocuments(query);

    res.json({
      success: true,
      data: alertLogs,
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
      message: 'Error fetching alert logs',
      error: error.message
    });
  }
};

export const getAlertLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alertLog = await AlertLog.findById(id)
      .populate('userId', 'username email firstName lastName')
      .populate('resolvedBy', 'username email firstName lastName');

    if (!alertLog) {
      return res.status(404).json({
        success: false,
        message: 'Alert log not found'
      });
    }

    res.json({
      success: true,
      data: alertLog
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert log',
      error: error.message
    });
  }
};

export const updateAlertLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const alertLog = await AlertLog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username email firstName lastName')
     .populate('resolvedBy', 'username email firstName lastName');

    if (!alertLog) {
      return res.status(404).json({
        success: false,
        message: 'Alert log not found'
      });
    }

    res.json({
      success: true,
      data: alertLog,
      message: 'Alert log updated successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating alert log',
      error: error.message
    });
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolvedBy, notes } = req.body;

    const alertLog = await AlertLog.findByIdAndUpdate(
      id,
      {
        isResolved: true,
        resolvedTime: new Date(),
        resolvedBy,
        notes
      },
      { new: true, runValidators: true }
    ).populate('userId', 'username email firstName lastName')
     .populate('resolvedBy', 'username email firstName lastName');

    if (!alertLog) {
      return res.status(404).json({
        success: false,
        message: 'Alert log not found'
      });
    }

    res.json({
      success: true,
      data: alertLog,
      message: 'Alert resolved successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
};

export const deleteAlertLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alertLog = await AlertLog.findByIdAndDelete(id);

    if (!alertLog) {
      return res.status(404).json({
        success: false,
        message: 'Alert log not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert log deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting alert log',
      error: error.message
    });
  }
};

export const getAlertsByDevice = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const alertLogs = await AlertLog
      .find({ deviceId })
      .populate('userId', 'username email firstName lastName')
      .sort({ alertTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AlertLog.countDocuments({ deviceId });

    res.json({
      success: true,
      data: alertLogs,
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
      message: 'Error fetching alerts for device',
      error: error.message
    });
  }
};

export const getAlertSummary = async (req: Request, res: Response) => {
  try {
          // definisikan tipe untuk hasil aggregate
      type AggItem = { _id: any; count: number };

      // aggregate (tetap sama pipeline-mu)
      const statusSummary = await AlertLog.aggregate() as AggItem[];
      // jika ingin, kamu bisa panggil aggregate dengan pipeline spesifik:
      // const statusSummary = await AlertLog.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]) as AggItem[];

      const resolvedSummary = await AlertLog.aggregate() as AggItem[];
      const severitySummary = await AlertLog.aggregate() as AggItem[];

      // hasil akhir dengan typing yang jelas
      const result: {
        status: Record<'SIAGA' | 'DARURAT', number>;
        resolved: { resolved: number; pending: number };
        severity: Record<string, number>;
        total: number;
      } = {
        status: { SIAGA: 0, DARURAT: 0 },
        resolved: { resolved: 0, pending: 0 },
        severity: {},    // <-- important: inisialisasi sebagai object kosong
        total: 0
      };

      // isi statusSummary
      statusSummary.forEach(item => {
        // convert key jadi string lalu cast ke kemungkinan properti status
        const keyStr = String(item._id) as 'SIAGA' | 'DARURAT';
        if (keyStr in result.status) {
          result.status[keyStr] = item.count;
        } else {
          // jika ada status tak terduga, bisa log / tambahkan sebagai fallback
          // contoh: kumpulin di severity sebagai fallback (opsional)
          result.status[keyStr as 'SIAGA' | 'DARURAT'] = item.count;
        }
        result.total += item.count;
      });

      // isi resolvedSummary (diasumsikan _id boolean)
      resolvedSummary.forEach(item => {
        if (item._id === true || String(item._id).toLowerCase() === 'true') {
          result.resolved.resolved = item.count;
        } else {
          result.resolved.pending = item.count;
        }
      });

      // isi severitySummary (gunakan string key aman)
      severitySummary.forEach(item => {
        const key = String(item._id ?? 'unknown'); // jika null/undefined -> 'unknown'
        result.severity[key] = item.count;
      });

      // sekarang result aman dipakai
      return result;


    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alert summary',
      error: error.message
    });
  }
};

export const getActiveAlerts = async (req: Request, res: Response) => {
  try {
    const { limit = 100, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const activeAlerts = await AlertLog
      .find({ isResolved: false })
      .populate('userId', 'username email firstName lastName')
      .sort({ severity: -1, alertTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AlertLog.countDocuments({ isResolved: false });

    res.json({
      success: true,
      data: activeAlerts,
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
      message: 'Error fetching active alerts',
      error: error.message
    });
  }
};