import { Request, Response } from 'express';
import { wealthboxService } from '../services/wealthbox.service';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import logger from '../utils/logger';

export class UserController {
  async syncUsers(req: Request, res: Response) {
    try {
      logger.info('Starting user sync from Wealthbox');
      const contacts = await wealthboxService.fetchAllContacts();
      logger.info(`Fetched ${contacts.length} contacts from Wealthbox`);

      let successCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const contact of contacts) {
        try {
          // Get primary email or generate a fallback identifier
          const primaryEmail = contact.email_addresses.find(email => email.primary)?.email;
          const fallbackEmail = primaryEmail || `contact_${contact.id}@placeholder.com`;

          // Handle organization first if company_name exists
          let organizationId: number | undefined;
          if (contact.company_name) {
            try {
              const organization = await organizationRepository.upsert({
                name: contact.company_name,
              });
              organizationId = organization.id;
            } catch (error) {
              logger.error(`Error processing organization for contact ${contact.id}:`, error);
              errorCount++;
              continue;
            }
          }

          // Create or update user
          await userRepository.upsert({
            wealthboxId: contact.id,
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: fallbackEmail,
            organizationId,
          });

          successCount++;
          logger.debug(`Successfully synced contact ${contact.id} with email ${fallbackEmail}`);
        } catch (error) {
          logger.error(`Error processing contact ${contact.id}:`, error);
          errorCount++;
        }
      }

      logger.info(`Sync completed. Successfully synced ${successCount} out of ${contacts.length} users`);
      res.json({
        message: 'Sync completed',
        total: contacts.length,
        success: successCount,
        skipped: skippedCount,
        errors: errorCount,
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