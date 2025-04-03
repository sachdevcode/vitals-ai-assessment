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

  async findById(id: number) {
    try {
      return await prisma.organization.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error finding organization by ID:', error);
      throw new Error('Failed to find organization');
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

  async update(id: number, data: { name: string }) {
    try {
      return await prisma.organization.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('Error updating organization:', error);
      throw new Error('Failed to update organization');
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

  async delete(id: number) {
    try {
      return await prisma.organization.delete({
        where: { id },
      });
    } catch (error) {
      logger.error('Error deleting organization:', error);
      throw new Error('Failed to delete organization');
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