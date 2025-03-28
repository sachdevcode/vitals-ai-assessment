import cron from 'node-cron';
import { Request, Response } from 'express';
import { userController } from '../controllers/user.controller';
import logger from '../utils/logger';

export class SchedulerService {
  private syncJob: cron.ScheduledTask | null = null;

  startScheduledSync() {
    // Run sync every 1 minute
    this.syncJob = cron.schedule('* * * * *', async () => {
      try {
        logger.info('Starting scheduled sync');
        
        // Create mock request and response objects
        const mockReq = {} as Request;
        const mockRes = {
          json: (data: any) => {
            logger.info('Sync completed:', data);
          },
          status: (code: number) => mockRes
        } as Response;

        await userController.syncUsers(mockReq, mockRes);
        logger.info('Scheduled sync completed successfully');
      } catch (error) {
        logger.error('Scheduled sync failed:', error);
      }
    });

    logger.info('Scheduled sync job started - running every 1 minute');
  }

  stopScheduledSync() {
    if (this.syncJob) {
      this.syncJob.stop();
      this.syncJob = null;
      logger.info('Scheduled sync job stopped');
    }
  }
}

export const schedulerService = new SchedulerService(); 