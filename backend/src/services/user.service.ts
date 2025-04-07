import { userRepository } from "../repositories/user.repository";
import { wealthboxService } from "./wealthbox.service";
import { WealthboxContact } from "./wealthbox.service";
import logger from "../utils/logger";

export class UserService {
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    organizationId?: number
  ) {
    return userRepository.findAll({ page, limit, search, organizationId });
  }

  async syncUsers() {
    try {
      logger.info('Starting user sync...');
      const contacts = await wealthboxService.fetchAllContacts();
      
      if (!contacts || contacts.length === 0) {
        logger.warn('No contacts received from Wealthbox');
        return {
          message: "No contacts to sync",
          total: 0,
          success: 0,
          failed: 0,
        };
      }

      logger.info(`Received ${contacts.length} contacts from Wealthbox`);
      const results = await Promise.allSettled(
        contacts.map(async (contact) => {
          try {
            logger.debug(`Processing contact: ${contact.firstName} ${contact.lastName} (${contact.id})`);
            const result = await userRepository.upsert({
              wealthboxId: parseInt(contact.id),
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              organizationId: contact.organizationId ? parseInt(contact.organizationId.toString()) : undefined
            });
            logger.debug(`Successfully processed contact: ${contact.id}`);
            return result;
          } catch (error) {
            logger.error(`Failed to process contact ${contact.id}:`, error);
            throw error;
          }
        })
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      logger.info(`Sync completed. Success: ${success}, Failed: ${failed}, Total: ${contacts.length}`);
      return {
        message: "Sync completed",
        total: contacts.length,
        success,
        failed,
      };
    } catch (error) {
      logger.error('Error during user sync:', error);
      if (error instanceof Error && error.message === "Invalid Wealthbox API credentials") {
        throw new Error("Invalid Wealthbox API credentials");
      }
      return {
        message: "Sync completed with errors",
        total: 0,
        success: 0,
        failed: 0,
      };
    }
  }
}

export const userService = new UserService(); 