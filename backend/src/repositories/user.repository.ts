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
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async findByWealthboxId(wealthboxId: number) {
    try {
      return await prisma.user.findUnique({
        where: { wealthboxId },
      });
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
      return await prisma.user.upsert({
        where: { wealthboxId: data.wealthboxId },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          organizationId: data.organizationId,
          integrationId: data.integrationId,
        },
        create: data,
      });
    } catch (error) {
      logger.error('Error upserting user:', error);
      throw new Error('Failed to upsert user');
    }
  }

  async findByOrganizationId(organizationId: number) {
    try {
      return await prisma.user.findMany({
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
      await prisma.user.delete({
        where: { wealthboxId },
      });
    } catch (error) {
      logger.error('Error deleting user by Wealthbox ID:', error);
      throw new Error('Failed to delete user');
    }
  }
}

export const userRepository = new UserRepository(); 