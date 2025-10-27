// server/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['auth-token'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No token provided'
    });
  }

  // Validasi token (simplified)
  // In production, verify JWT token here
  
  next();
};