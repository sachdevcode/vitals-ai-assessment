import { PrismaClient, Prisma } from "@prisma/client";
import logger from "../utils/logger";

interface FindAllParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
}

export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    wealthboxId: number;
    firstName: string;
    lastName: string;
    email: string;
    organizationId?: number;
  }) {
    try {
      return await this.prisma.user.create({
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
      return await this.prisma.user.findUnique({
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
      return await this.prisma.user.findUnique({
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
      return await this.prisma.user.findMany({
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

  async findAll({
    page = 1,
    limit = 10,
    search,
    organizationId,
  }: FindAllParams = {}) {
    try {
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
        this.prisma.user.findMany({
          where,
          include: {
            organization: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error finding users:", error);
      throw new Error("Failed to find users");
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
      return await this.prisma.user.upsert({
        where: { wealthboxId: data.wealthboxId },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          organizationId: data.organizationId,
        },
        create: {
          ...data,
        },
      });
    } catch (error) {
      logger.error("Error upserting user:", error);
      throw new Error("Failed to upsert user");
    }
  }

  async delete(wealthboxId: number) {
    try {
      return await this.prisma.user.delete({
        where: { wealthboxId },
      });
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
}

export const userRepository = new UserRepository(new PrismaClient()); 