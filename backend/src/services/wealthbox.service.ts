import axios from 'axios';
import env from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import logger from '../utils/logger';

export interface WealthboxContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WealthboxTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  contactId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WealthboxEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  contactId?: string;
  createdAt: string;
  updatedAt: string;
}

export class WealthboxService {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;
  private readonly webhookSecret: string;

  constructor() {
    this.baseURL = env.WEALTHBOX_API_URL;
    this.apiKey = env.WEALTHBOX_API_KEY;
    this.webhookSecret = env.WEALTHBOX_WEBHOOK_SECRET;

    if (!this.baseURL || !this.apiKey || !this.webhookSecret) {
      throw new Error("Missing required Wealthbox configuration");
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (retries === 0) throw error;
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          await this.delay(this.retryDelay * (this.maxRetries - retries + 1));
          return this.retryWithBackoff(operation, retries - 1);
        }
      }
      throw error;
    }
  }

  async getContacts(page: number = 1, limit: number = 10): Promise<{
    data: WealthboxContact[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/contacts`, {
          headers: this.getHeaders(),
          params: { page, limit },
        })
      );

      if (!response.data || !Array.isArray(response.data.contacts)) {
        return {
          data: [],
          pagination: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        };
      }

      return {
        data: response.data.contacts,
        pagination: {
          total: response.data.total || 0,
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          totalPages: Math.ceil((response.data.total || 0) / (response.data.limit || 10)),
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Invalid Wealthbox API credentials");
      }
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }
  }

  async fetchAllContacts(): Promise<WealthboxContact[]> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/contacts/all`, {
          headers: this.getHeaders(),
        })
      );

      if (!response.data || !Array.isArray(response.data.contacts)) {
        return [];
      }

      return response.data.contacts;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Invalid Wealthbox API credentials");
      }
      return [];
    }
  }

  async getTask(id: string): Promise<WealthboxTask | null> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/tasks/${id}`, {
          headers: this.getHeaders(),
        })
      );

      if (!response.data || !response.data.task) {
        return null;
      }

      return response.data.task;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error("Invalid Wealthbox API credentials");
      }
      return null;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    const expectedSignature = this.webhookSecret;
    return signature === expectedSignature;
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error("Invalid webhook signature");
    }

    try {
      const event = JSON.parse(payload) as {
        type: string;
        data: {
          id: string;
          firstName?: string;
          lastName?: string;
          email?: string;
          organizationId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };

      await this.handleWebhookEvent(event);
    } catch (error) {
      throw new Error("Failed to process webhook");
    }
  }

  private async handleWebhookEvent(event: {
    type: string;
    data: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      organizationId?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  }): Promise<void> {
    switch (event.type) {
      case "contact.created":
      case "contact.updated":
        await this.handleContactChange(event.data);
        break;
      case "contact.deleted":
        await this.handleContactDeletion(event.data.id);
        break;
    }
  }

  private async handleContactChange(data: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    organizationId?: string;
    createdAt?: string;
    updatedAt?: string;
  }): Promise<void> {
    // Implementation
  }

  private async handleContactDeletion(wealthboxId: string): Promise<void> {
    // Implementation
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/contacts`, {
          headers: this.getHeaders(),
          params: { page: 1, per_page: 1 }
        })
      );
      return true;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return false;
    }
  }
}

export const wealthboxService = new WealthboxService(); 