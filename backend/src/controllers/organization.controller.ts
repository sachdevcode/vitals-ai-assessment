import { Request, Response } from 'express';
import { organizationRepository } from '../repositories/organization.repository';
import { userRepository } from '../repositories/user.repository';
import logger from '../utils/logger';

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