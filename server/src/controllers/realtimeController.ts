import { Request, Response } from 'express';
import { RealtimeService } from '../services/realtimeService';

let realtimeService: RealtimeService;

export const setRealtimeService = (service: RealtimeService) => {
  realtimeService = service;
};

export const getRealtimeStats = async (req: Request, res: Response) => {
  try {
    if (!realtimeService) {
      return res.status(503).json({
        success: false,
        message: 'Realtime service not initialized'
      });
    }

    const stats = {
      connectedClients: realtimeService.getConnectedClients(),
      timestamp: new Date()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error getting realtime stats',
      error: error.message
    });
  }
};
