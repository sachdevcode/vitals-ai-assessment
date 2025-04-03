import axios from 'axios';
import env from '../config/env';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import logger from '../utils/logger';

interface WealthboxContact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  organization?: {
    id: number;
    name: string;
  };
}

interface WealthboxTask {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  contactId: number;
}

export class WealthboxService {
  private readonly baseURL: string;
  private readonly apiKey: string;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.baseURL = env.WEALTHBOX_API_URL;
    this.apiKey = env.WEALTHBOX_API_KEY;
  }

  private getHeaders() {
    return {
      'ACCESS_TOKEN': this.apiKey,
      'Content-Type': 'application/json',
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

  async fetchContacts(page: number = 1, perPage: number = 100): Promise<WealthboxContact[]> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/contacts`, {
          headers: this.getHeaders(),
          params: { page, per_page: perPage }
        })
      );

      if (!response.data || !Array.isArray(response.data)) {
        logger.error('Unexpected response structure from Wealthbox API');
        throw new Error('Invalid response from Wealthbox API');
      }

      return response.data;
    } catch (error) {
      logger.error('Error fetching contacts from Wealthbox:', error);
      throw new Error('Failed to fetch contacts from Wealthbox');
    }
  }

  async fetchAllContacts(): Promise<WealthboxContact[]> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/contacts`, {
          headers: this.getHeaders()
        })
      );

      if (!response.data || !Array.isArray(response.data)) {
        logger.error('Unexpected response structure from Wealthbox API');
        throw new Error('Invalid response from Wealthbox API');
      }

      logger.info(`Successfully fetched ${response.data.length} contacts from Wealthbox`);
      return response.data;
    } catch (error) {
      logger.error('Error fetching all contacts from Wealthbox:', error);
      throw new Error('Failed to fetch all contacts from Wealthbox');
    }
  }

  async getTask(id: number): Promise<WealthboxTask> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.baseURL}/tasks/${id}`, {
          headers: this.getHeaders()
        })
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching task from Wealthbox:', error);
      throw new Error('Failed to fetch task from Wealthbox');
    }
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
      logger.error('Error testing Wealthbox API connection:', error);
      return false;
    }
  }
}

export const wealthboxService = new WealthboxService(); 