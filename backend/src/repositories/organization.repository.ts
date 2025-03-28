import prisma from '../config/prisma';
import logger from '../utils/logger';

export class OrganizationRepository {
  async create(data: { name: string }) {
    try {
      return await prisma.organization.create({
        data,
      });
    } catch (error) {
      logger.error('Error creating organization:', error);
      throw new Error('Failed to create organization');
    }
  }

  async findByName(name: string) {
    try {
      return await prisma.organization.findFirst({
        where: { name },
      });
    } catch (error) {
      logger.error('Error finding organization by name:', error);
      throw new Error('Failed to find organization');
    }
  }

  async upsert(data: { name: string }) {
    try {
      return await prisma.organization.upsert({
        where: { name: data.name },
        create: { name: data.name },
        update: {},
      });
    } catch (error) {
      logger.error('Error upserting organization:', error);
      throw new Error('Failed to upsert organization');
    }
  }

  async findAll() {
    try {
      return await prisma.organization.findMany({
        include: {
          _count: {
            select: { users: true }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
    } catch (error) {
      logger.error('Error finding all organizations:', error);
      throw new Error('Failed to find organizations');
    }
  }

  async getStats(id: number) {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true }
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true
            }
          }
        }
      });

      if (!organization) {
        throw new Error('Organization not found');
      }

      return {
        id: organization.id,
        name: organization.name,
        totalUsers: organization._count.users,
        users: organization.users,
        createdAt: organization.createdAt
      };
    } catch (error) {
      logger.error('Error getting organization stats:', error);
      throw new Error('Failed to get organization stats');
    }
  }
}

export const organizationRepository = new OrganizationRepository(); 