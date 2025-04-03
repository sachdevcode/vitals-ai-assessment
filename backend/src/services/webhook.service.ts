import crypto from 'crypto';
import { Request } from 'express';
import { userRepository } from '../repositories/user.repository';
import logger from '../utils/logger';

interface WebhookEvent {
  type: string;
  data: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    organization?: {
      id: number;
      name: string;
    };
  };
}

export class WebhookService {
  private readonly webhookSecret: string;

  constructor() {
    const secret = process.env.WEALTHBOX_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('WEALTHBOX_WEBHOOK_SECRET is required');
    }
    this.webhookSecret = secret;
  }

  verifyWebhookSignature(req: Request): boolean {
    const signature = req.headers['x-wealthbox-signature'];
    if (!signature) {
      logger.warn('Missing webhook signature');
      return false;
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const calculatedSignature = hmac
      .update(JSON.stringify(req.body))
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature as string),
      Buffer.from(calculatedSignature)
    );

    if (!isValid) {
      logger.warn('Invalid webhook signature');
    }

    return isValid;
  }

  async handleWebhook(req: Request): Promise<void> {
    if (!this.verifyWebhookSignature(req)) {
      throw new Error('Invalid webhook signature');
    }

    const event = req.body as WebhookEvent;
    await this.handleWebhookEvent(event);
  }

  private async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'contact.created':
        case 'contact.updated':
          await this.handleContactChange(event.data);
          break;
        case 'contact.deleted':
          await this.handleContactDeletion(event.data.id);
          break;
        default:
          logger.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error handling webhook event:', error);
      throw error;
    }
  }

  private async handleContactChange(data: WebhookEvent['data']): Promise<void> {
    try {
      await userRepository.upsert({
        wealthboxId: data.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        organizationId: data.organization?.id,
      });
      logger.info(`Successfully processed contact change for ID: ${data.id}`);
    } catch (error) {
      logger.error('Error handling contact change:', error);
      throw error;
    }
  }

  private async handleContactDeletion(wealthboxId: number): Promise<void> {
    try {
      await userRepository.delete(wealthboxId);
      logger.info(`Successfully processed contact deletion for ID: ${wealthboxId}`);
    } catch (error) {
      logger.error('Error handling contact deletion:', error);
      throw error;
    }
  }
}

export const webhookService = new WebhookService(); 