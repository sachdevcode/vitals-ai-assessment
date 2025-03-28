import prisma from '../config/prisma';
import logger from '../utils/logger';
import { PrismaClient } from '@prisma/client';

type UserWhereInput = {
  OR?: Array<{
    firstName?: { contains: string; mode: 'insensitive' };
    lastName?: { contains: string; mode: 'insensitive' };
    email?: { contains: string; mode: 'insensitive' };
  }>;
  organizationId?: number;
};

export class UserRepository {
  async create(data: {
    wealthboxId: number;
    firstName: string;
    lastName: string;
    email: string;
    organizationId?: number;
    integrationId?: number;
  }) {
    try {
      logger.info('Creating new user:', { email: data.email, wealthboxId: data.wealthboxId });
      const user = await prisma.user.create({
        data,
      });
      logger.info('Successfully created user:', { id: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findByWealthboxId(wealthboxId: number) {
    try {
      logger.info('Finding user by Wealthbox ID:', wealthboxId);
      const user = await prisma.user.findUnique({
        where: { wealthboxId },
      });
      if (user) {
        logger.info('Found user:', { id: user.id, email: user.email });
      } else {
        logger.info('No user found with Wealthbox ID:', wealthboxId);
      }
      return user;
    } catch (error) {
      logger.error('Error finding user by Wealthbox ID:', error);
      throw new Error('Failed to find user');
    }
  }

  async upsert(data: {
    wealthboxId: number;
    firstName: string;
    lastName: string;
    email: string;
    organizationId?: number;
    integrationId?: number;
  }) {
    try {
      logger.info('Upserting user:', { email: data.email, wealthboxId: data.wealthboxId });
      
      // First try to find existing user by wealthboxId
      const existingUser = await prisma.user.findUnique({
        where: { wealthboxId: data.wealthboxId },
      });

      if (existingUser) {
        // Update existing user
        const user = await prisma.user.update({
          where: { wealthboxId: data.wealthboxId },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            organizationId: data.organizationId,
            integrationId: data.integrationId,
          },
        });
        logger.info('Successfully updated user:', { id: user.id, email: user.email });
        return user;
      } else {
        // Check if email already exists
        const existingEmailUser = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (existingEmailUser) {
          // If email exists but wealthboxId is different, generate a new email
          const newEmail = `contact_${data.wealthboxId}_${Date.now()}@placeholder.com`;
          logger.warn(`Email ${data.email} already exists, using new email: ${newEmail}`);
          data.email = newEmail;
        }

        // Create new user
        const user = await prisma.user.create({
          data,
        });
        logger.info('Successfully created user:', { id: user.id, email: user.email });
        return user;
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error('Error upserting user:', {
          error: error.message,
          stack: error.stack,
          data: { email: data.email, wealthboxId: data.wealthboxId }
        });
      } else {
        logger.error('Unknown error upserting user:', error);
      }
      throw new Error('Failed to upsert user');
    }
  }

  async findByOrganizationId(organizationId: number) {
    try {
      logger.info('Finding users by organization ID:', organizationId);
      const users = await prisma.user.findMany({
        where: { organizationId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          firstName: 'asc'
        }
      });
      logger.info(`Found ${users.length} users for organization:`, organizationId);
      return users;
    } catch (error) {
      logger.error('Error finding users by organization ID:', error);
      throw new Error('Failed to find users');
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    organizationId?: number;
  } = {}) {
    try {
      const { page = 1, limit = 10, search, organizationId } = params;
      const skip = (page - 1) * limit;

      const where: UserWhereInput = {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }),
        ...(organizationId && { organizationId })
      };

      logger.info('Finding all users with params:', { page, limit, search, organizationId });

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            organization: {
              select: {
                id: true,
                name: true
              }
            },
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            firstName: 'asc'
          },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      logger.info(`Found ${users.length} users out of ${total} total`);
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw new Error('Failed to find users');
    }
  }

  async deleteByWealthboxId(wealthboxId: number) {
    try {
      logger.info('Deleting user by Wealthbox ID:', wealthboxId);
      await prisma.user.delete({
        where: { wealthboxId },
      });
      logger.info('Successfully deleted user with Wealthbox ID:', wealthboxId);
    } catch (error) {
      logger.error('Error deleting user by Wealthbox ID:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export const userRepository = new UserRepository(); 