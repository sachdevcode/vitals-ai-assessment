import { Request } from 'express';
import crypto from 'crypto';
import env from '../config/env';
import logger from '../utils/logger';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';

interface WebhookEvent {
  type: 'contact.created' | 'contact.updated' | 'contact.deleted';
  data: {
    id: number;
    first_name: string;
    last_name: string;
    email_addresses: Array<{
      email: string;
      primary: boolean;
    }>;
    company_name?: string;
  };
}

export class WebhookService {
  private readonly webhookSecret: string;

  constructor() {
    this.webhookSecret = env.WEALTHBOX_WEBHOOK_SECRET;
  }

  verifySignature(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const calculatedSignature = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }

  async handleWebhook(req: Request): Promise<void> {
    const signature = req.headers['x-wealthbox-signature'] as string;
    if (!signature) {
      throw new Error('No signature provided');
    }

    const payload = JSON.stringify(req.body);
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid signature');
    }

    const event = req.body as WebhookEvent;
    await this.processEvent(event);
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'contact.created':
        case 'contact.updated':
          await this.handleContactChange(event.data, event.type);
          break;
        case 'contact.deleted':
          await this.handleContactDeletion(event.data);
          break;
        default:
          logger.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Error processing webhook event:', error);
      throw error;
    }
  }

  private async handleContactChange(
    data: WebhookEvent['data'], 
    eventType: WebhookEvent['type']
  ): Promise<void> {
    const primaryEmail = data.email_addresses.find(email => email.primary)?.email;
    if (!primaryEmail) {
      logger.warn(`Contact ${data.id} has no primary email`);
      return;
    }

    let organizationId: number | undefined;
    if (data.company_name) {
      const organization = await organizationRepository.upsert({
        name: data.company_name,
      });
      organizationId = organization.id;
    }

    await userRepository.upsert({
      wealthboxId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: primaryEmail,
      organizationId,
    });

    logger.info(`Successfully processed ${eventType} for contact ${data.id}`);
  }

  private async handleContactDeletion(data: { id: number }) {
    try {
      const wealthboxId = data.id;
      await userRepository.delete(wealthboxId);
      //logger.info(`Successfully deleted contact ${wealthboxId}`);
    } catch (error) {
      //logger.error('Error deleting contact:', error);
      throw error;
    }
  }
}

export const webhookService = new WebhookService(); 