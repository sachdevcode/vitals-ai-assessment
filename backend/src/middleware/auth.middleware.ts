import { Request, Response, NextFunction } from 'express';
import env from '../config/env';
import logger from '../utils/logger';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      logger.warn('No API key provided');
      return res.status(401).json({ error: 'API key is required' });
    }

    if (apiKey !== env.API_KEY) {
      logger.warn('Invalid API key provided');
      return res.status(401).json({ error: 'Invalid API key' });
    }

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 