import axios, { AxiosError } from 'axios';
import env from '../config/env';
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

class WealthboxService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor() {
    this.apiUrl = env.WEALTHBOX_API_URL;
    this.apiKey = env.WEALTHBOX_API_KEY;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
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
    } catch (error) {
      if (retries === 0) throw error;
      
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) { // Rate limit
        await this.delay(this.retryDelay * (this.maxRetries - retries + 1));
        return this.retryWithBackoff(operation, retries - 1);
      }
      throw error;
    }
  }

  async fetchContacts(page: number = 1, perPage: number = 100): Promise<WealthboxResponse> {
    try {
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.apiUrl}/contacts`, {
          headers: this.headers,
          params: {
            type: 'Person',
            page,
            per_page: perPage,
          },
        })
      );

      return response.data;
    } catch (error) {
      logger.error('Error fetching contacts from Wealthbox:', error);
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
}

export const wealthboxService = new WealthboxService(); 