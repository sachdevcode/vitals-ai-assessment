import { Request, Response } from 'express';
import { wealthboxService } from '../services/wealthbox.service';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import logger from '../utils/logger';

export class UserController {
  async syncUsers(req: Request, res: Response) {
    try {
      const contacts = await wealthboxService.fetchAllContacts();
      const results = await Promise.all(
        contacts.map(async (contact) => {
          const primaryEmail = contact.email_addresses.find((email) => email.primary)?.email;
          if (!primaryEmail) {
            logger.warn(`Contact ${contact.id} has no primary email`);
            return null;
          }

          // Handle organization if company_name exists
          let organizationId: number | undefined;
          if (contact.company_name) {
            const organization = await organizationRepository.upsert({
              name: contact.company_name,
            });
            organizationId = organization.id;
          }

          return userRepository.upsert({
            wealthboxId: contact.id,
            firstName: contact.first_name,
            lastName: contact.last_name,
            email: primaryEmail,
            organizationId,
          });
        })
      );

      const successfulSyncs = results.filter((result): result is NonNullable<typeof result> => result !== null).length;
      res.json({
        message: `Successfully synced ${successfulSyncs} users`,
        total: contacts.length,
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
}

export const userController = new UserController(); 