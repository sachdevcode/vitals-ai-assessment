import prisma from '../config/prisma';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
}

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
      logger.error('Error finding users by organization:', error);
      throw error;
    }
  }

  async upsert(data: {
    wealthboxId: number;
    firstName: string;
    lastName: string;
    email: string;
    organizationId?: number;
  }) {
    try {
      return await prisma.user.upsert({
        where: { wealthboxId: data.wealthboxId },
        create: {
          wealthboxId: data.wealthboxId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          organizationId: data.organizationId,
        },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          organizationId: data.organizationId,
        },
      });
    } catch (error) {
      logger.error('Error upserting user:', error);
      throw error;
    }
  }

  async findAll(params: FindAllParams) {
    try {
      const { page = 1, limit = 10, search, organizationId } = params;
      const skip = (page - 1) * limit;

      const where: Prisma.UserWhereInput = {};
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ];
      }
      if (organizationId) {
        where.organizationId = organizationId;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            organization: true,
          },
          skip,
          take: limit,
          orderBy: {
            firstName: 'asc',
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error finding users:', error);
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