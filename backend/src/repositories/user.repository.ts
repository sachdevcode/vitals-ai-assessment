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
    firstName?: string;
    lastName?: string;
    email?: string;
    organizationId?: number;
  }) {
    try {
      logger.info(`Upserting user: ${data.firstName || 'Unknown'} ${data.lastName || ''} (${data.wealthboxId})`);
      


      const existingUser = await this.prisma.user.findUnique({
        where: { wealthboxId: data.wealthboxId }
      });

      if (existingUser) {
        logger.info(`Found existing user by wealthboxId: ${data.wealthboxId}`);

        return await this.prisma.user.update({
          where: { wealthboxId: data.wealthboxId },
          data: {
            firstName: data.firstName || existingUser.firstName,
            lastName: data.lastName || existingUser.lastName,
            email: data.email || existingUser.email,
            organizationId: data.organizationId || existingUser.organizationId
          }
        });
      }


      if (data.email) {
        const userByEmail = await this.prisma.user.findUnique({
          where: { email: data.email }
        });

        if (userByEmail) {
          logger.info(`Found existing user by email: ${data.email}`);
          
          if (userByEmail.wealthboxId !== data.wealthboxId) {
            logger.warn(`Updating user with different wealthboxId. Old: ${userByEmail.wealthboxId}, New: ${data.wealthboxId}`);
          }
          
   
          return await this.prisma.user.update({
            where: { email: data.email },
            data: {
              wealthboxId: data.wealthboxId,
              firstName: data.firstName || userByEmail.firstName,
              lastName: data.lastName || userByEmail.lastName,
              organizationId: data.organizationId || userByEmail.organizationId
            }
          });
        }
      }


      try {
        logger.info(`Creating new user with wealthboxId: ${data.wealthboxId}`);
        return await this.prisma.user.create({
          data: {
            wealthboxId: data.wealthboxId,
            firstName: data.firstName || 'Unknown',
            lastName: data.lastName || '',
            email: data.email || '',
            organizationId: data.organizationId || undefined
          }
        });
      } catch (createError: any) {
  
        if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
          logger.warn(`Email conflict detected for ${data.email}, attempting to find and update existing user`);
          
     
          const conflictingUser = await this.prisma.user.findUnique({
            where: { email: data.email || '' }
          });

          if (conflictingUser) {
            logger.info(`Found conflicting user by email: ${data.email}`);

            return await this.prisma.user.update({
              where: { email: data.email || '' },
              data: {
                wealthboxId: data.wealthboxId,
                firstName: data.firstName || conflictingUser.firstName,
                lastName: data.lastName || conflictingUser.lastName,
                organizationId: data.organizationId || conflictingUser.organizationId
              }
            });
          }
        }
        throw createError;
      }
    } catch (error) {
      logger.error('Error upserting user:', error);
      throw new Error('Failed to upsert user');
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