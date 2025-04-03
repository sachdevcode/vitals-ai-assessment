import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { wealthboxService } from '../services/wealthbox.service';
import { userService } from "../services/user.service";

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;

      const users = await userService.findAll(page, limit, search, organizationId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async syncUsers(req: Request, res: Response) {
    try {
      const result = await userService.syncUsers();
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid Wealthbox API credentials") {
        res.status(401).json({ error: "Invalid Wealthbox API credentials" });
      } else {
        res.status(500).json({ error: "Failed to sync users" });
      }
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const { page, limit, search, organizationId } = req.query;

      const params = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string | undefined,
        organizationId: organizationId ? parseInt(organizationId as string) : undefined
      };

      const result = await userRepository.findAll(params);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async testConnection(req: Request, res: Response) {
    try {
      const isConnected = await wealthboxService.testConnection();
      if (isConnected) {
        res.json({ message: 'Successfully connected to Wealthbox API' });
      } else {
        res.status(401).json({ error: 'Invalid Wealthbox API credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to test Wealthbox API connection' });
    }
  }
}

export const userController = new UserController(); 