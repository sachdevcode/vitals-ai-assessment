import { Request, Response } from 'express';
import { organizationRepository } from '../repositories/organization.repository';
import { userRepository } from '../repositories/user.repository';
import logger from '../utils/logger';
import { z } from 'zod';

// Validation schema for organization creation and updates
const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255, 'Organization name is too long'),
});

export class OrganizationController {
  async getAllOrganizations(req: Request, res: Response) {
    try {
      const organizations = await organizationRepository.findAll();
      res.json(organizations);
    } catch (error) {
      logger.error('Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  }

  async createOrganization(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = organizationSchema.parse(req.body);

      // Create organization
      const organization = await organizationRepository.create({
        name: validatedData.name,
      });

      res.status(201).json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      logger.error('Error creating organization:', error);
      res.status(500).json({ error: 'Failed to create organization' });
    }
  }

  async updateOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = parseInt(id);

      // Validate request body
      const validatedData = organizationSchema.parse(req.body);

      // Check if organization exists
      const existingOrg = await organizationRepository.findById(organizationId);
      if (!existingOrg) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Update organization
      const organization = await organizationRepository.update(organizationId, {
        name: validatedData.name,
      });

      res.json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
        return;
      }
      logger.error('Error updating organization:', error);
      res.status(500).json({ error: 'Failed to update organization' });
    }
  }

  async deleteOrganization(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const organizationId = parseInt(id);

      // Check if organization exists
      const organization = await organizationRepository.findById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Delete the organization
      await organizationRepository.delete(organizationId);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting organization:', error);
      res.status(500).json({ error: 'Failed to delete organization' });
    }
  }

  async getOrganizationUsers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const users = await userRepository.findByOrganizationId(parseInt(id));
      res.json(users);
    } catch (error) {
      logger.error('Error fetching organization users:', error);
      res.status(500).json({ error: 'Failed to fetch organization users' });
    }
  }

  async getOrganizationStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await organizationRepository.getStats(parseInt(id));
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching organization stats:', error);
      res.status(500).json({ error: 'Failed to fetch organization stats' });
    }
  }
}

export const organizationController = new OrganizationController(); 