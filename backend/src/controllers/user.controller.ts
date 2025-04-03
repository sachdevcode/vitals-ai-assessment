import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { wealthboxService } from '../services/wealthbox.service';
import logger from '../utils/logger';

export class UserController {
  async syncUsers(req: Request, res: Response) {
    try {
      const contacts = await wealthboxService.fetchAllContacts();
      const results = await Promise.allSettled(
        contacts.map(async (contact) => {
          try {
            await userRepository.upsert({
              wealthboxId: contact.id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              organizationId: contact.organization?.id,
            });
          } catch (error) {
            logger.error(`Error syncing user ${contact.id}:`, error);
            throw error;
          }
        })
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failureCount = results.filter((r) => r.status === 'rejected').length;

      res.json({
        message: 'Sync completed',
        total: contacts.length,
        success: successCount,
        failed: failureCount,
      });
    } catch (error) {
      logger.error('Error syncing users:', error);
      res.status(500).json({ error: 'Failed to sync users' });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { page, limit, search, organizationId } = req.query;

      const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string | undefined,
        organizationId: organizationId ? parseInt(organizationId as string) : undefined
      };

      const result = await userRepository.findAll(params);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async testConnection(req: Request, res: Response) {
    try {
      const isConnected = await wealthboxService.testConnection();
      if (isConnected) {
        res.json({ message: 'Successfully connected to Wealthbox API' });
      } else {
        res.status(500).json({ error: 'Failed to connect to Wealthbox API' });
      }
    } catch (error) {
      logger.error('Error testing Wealthbox API connection:', error);
      res.status(500).json({ error: 'Failed to test Wealthbox API connection' });
    }
  }
}

export const userController = new UserController(); 