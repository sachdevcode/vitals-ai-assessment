import { Request, Response } from 'express';
import { wealthboxService } from '../services/wealthbox.service';
import logger from '../utils/logger';

export class WealthboxController {
  async getContacts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const contacts = await wealthboxService.getContacts(page, limit);
      res.json(contacts);
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  }

  async getAllContacts(req: Request, res: Response) {
    try {
      const contacts = await wealthboxService.fetchAllContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const task = await wealthboxService.getTask(id);
      res.json(task);
    } catch (error) {
      logger.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-wealthbox-signature'] as string;
      const payload = JSON.stringify(req.body);

      await wealthboxService.handleWebhook(payload, signature);
      res.json({ message: 'Webhook processed successfully' });
    } catch (error) {
      logger.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }
}

export const wealthboxController = new WealthboxController(); 