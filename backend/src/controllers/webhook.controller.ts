import { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service';
import logger from '../utils/logger';

export class WebhookController {
  async handleWebhook(req: Request, res: Response) {
    try {
      await webhookService.handleWebhook(req);
      res.json({ message: 'Webhook processed successfully' });
    } catch (error) {
      logger.error('Error handling webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  }
}

export const webhookController = new WebhookController(); 