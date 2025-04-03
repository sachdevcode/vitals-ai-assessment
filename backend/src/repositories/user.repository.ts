import { PrismaClient, Prisma } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

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
  }) {
    try {
      return await prisma.user.create({
        data,
        include: {
          organization: true,
        },
      });
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        },
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByWealthboxId(wealthboxId: number) {
    try {
      return await prisma.user.findUnique({
        where: { wealthboxId },
        include: {
          organization: true,
        },
      });
    } catch (error) {
      logger.error('Error finding user by Wealthbox ID:', error);
      throw error;
    }
  }

  async findByOrganizationId(organizationId: number) {
    try {
      return await prisma.user.findMany({
        where: { organizationId },
        include: {
          organization: true,
        },
        orderBy: {
          firstName: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error finding users by organization ID:', error);
      throw error;
    }
  }

  async upsert(data: {
    wealthboxId: number;
    firstName: string;
    lastName?: string;
    email: string;
    organizationId?: number;
  }) {
    try {
      // Ensure lastName is provided, use a default if not
      const lastName = data.lastName || 'Unknown';

      const existingUser = await this.findByWealthboxId(data.wealthboxId);

      if (existingUser) {
        // Update existing user
        return await prisma.user.update({
          where: { wealthboxId: data.wealthboxId },
          data: {
            firstName: data.firstName || existingUser.firstName,
            lastName: lastName,
            email: data.email,
            organizationId: data.organizationId,
          },
          include: {
            organization: true,
          },
        });
      } else {
        // Create new user
        return await prisma.user.create({
          data: {
            wealthboxId: data.wealthboxId,
            firstName: data.firstName,
            lastName: lastName,
            email: data.email,
            organizationId: data.organizationId,
          },
          include: {
            organization: true,
          },
        });
      }
    } catch (error) {
      logger.error('Error upserting user:', { data, error });
      throw new Error('Failed to upsert user');
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    organizationId?: number;
  }) {
    try {
      const { page = 1, limit = 10, search, organizationId } = params;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }),
        ...(organizationId && { organizationId }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            organization: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error finding all users:', error);
      throw error;
    }
  }

  async delete(wealthboxId: number) {
    try {
      return await prisma.user.delete({
        where: { wealthboxId },
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository(); 