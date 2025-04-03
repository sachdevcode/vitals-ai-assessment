import { userRepository } from "../repositories/user.repository";
import { wealthboxService } from "./wealthbox.service";
import { WealthboxContact } from "./wealthbox.service";

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
      const contacts = await wealthboxService.fetchAllContacts();
      
      if (!contacts.length) {
        return {
          message: "No contacts found to sync",
          total: 0,
          success: 0,
          failed: 0,
        };
      }

      const results = await Promise.allSettled(
        contacts.map(async (contact: WealthboxContact) => {
          try {
            await userRepository.upsert({
              wealthboxId: parseInt(contact.id),
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              organizationId: contact.organizationId ? parseInt(contact.organizationId) : undefined,
            });
          } catch (error) {
            throw error;
          }
        })
      );

      const successCount = results.filter((r: PromiseSettledResult<void>) => r.status === "fulfilled").length;
      const failureCount = results.filter((r: PromiseSettledResult<void>) => r.status === "rejected").length;

      return {
        message: "Sync completed",
        total: contacts.length,
        success: successCount,
        failed: failureCount,
      };
    } catch (error) {
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