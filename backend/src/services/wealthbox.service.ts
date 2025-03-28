import axios, { AxiosError } from 'axios';
import { config } from '../config';
import logger from '../utils/logger';

interface WealthboxEmail {
  email: string;
  primary: boolean;
}

interface WealthboxContact {
  id: number;
  first_name: string;
  last_name: string;
  email_addresses: WealthboxEmail[];
  company_name?: string;
}

interface WealthboxResponse {
  data: WealthboxContact[];
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
}

export class WealthboxService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    if (!config.wealthbox.apiKey) {
      throw new Error('WEALTHBOX_API_KEY is required');
    }
    this.apiUrl = config.wealthbox.apiUrl;
    this.apiKey = config.wealthbox.apiKey;
  }

  private getHeaders() {
    return {
      'ACCESS_TOKEN': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async delay(ms: number) {
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
        if (error.response?.status === 429) { // Rate limit
          await this.delay(this.retryDelay * (this.maxRetries - retries + 1));
          return this.retryWithBackoff(operation, retries - 1);
        }
      }
      throw error;
    }
  }

  async fetchContacts(page: number = 1, perPage: number = 100): Promise<WealthboxResponse> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.apiUrl}/contacts`, {
          headers: this.getHeaders(),
          params: {
            type: 'Person',
            page,
            per_page: perPage,
          },
        })
      );
      console.log("check data here",response.data);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Error fetching contacts from Wealthbox:', error.response?.data || error.message);
      } else {
        logger.error('Unknown error fetching contacts from Wealthbox:', error);
      }
      throw new Error('Failed to fetch contacts from Wealthbox');
    }
  }

  async fetchAllContacts(): Promise<WealthboxContact[]> {
    let allContacts: WealthboxContact[] = [];
    let currentPage = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.fetchContacts(currentPage);
      allContacts = [...allContacts, ...response.data];
      
      hasMore = response.data.length === response.meta.per_page;
      currentPage++;
      
      // Add a small delay between requests to avoid rate limiting
      await this.delay(100);
    }

    return allContacts;
  }

  async getContact(id: number) {
    try {
      const response = await axios.get(`${this.apiUrl}/contacts/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Error fetching contact from Wealthbox:', error.response?.data || error.message);
      } else {
        logger.error('Unknown error fetching contact from Wealthbox:', error);
      }
      throw new Error('Failed to fetch contact from Wealthbox');
    }
  }

  async getTasks() {
    try {
      const response = await axios.get(`${this.apiUrl}/tasks`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Error fetching tasks from Wealthbox:', error.response?.data || error.message);
      } else {
        logger.error('Unknown error fetching tasks from Wealthbox:', error);
      }
      throw new Error('Failed to fetch tasks from Wealthbox');
    }
  }

  async getTask(id: number) {
    try {
      const response = await axios.get(`${this.apiUrl}/tasks/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Error fetching task from Wealthbox:', error.response?.data || error.message);
      } else {
        logger.error('Unknown error fetching task from Wealthbox:', error);
      }
      throw new Error('Failed to fetch task from Wealthbox');
    }
  }

  async getEvents() {
    try {
      const response = await axios.get(`${this.apiUrl}/events`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Error fetching events from Wealthbox:', error.response?.data || error.message);
      } else {
        logger.error('Unknown error fetching events from Wealthbox:', error);
      }
      throw new Error('Failed to fetch events from Wealthbox');
    }
  }

  async getEvent(id: number) {
    try {
      const response = await axios.get(`${this.apiUrl}/events/${id}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Error fetching event from Wealthbox:', error.response?.data || error.message);
      } else {
        logger.error('Unknown error fetching event from Wealthbox:', error);
      }
      throw new Error('Failed to fetch event from Wealthbox');
    }
  }
}

export const wealthboxService = new WealthboxService(); 