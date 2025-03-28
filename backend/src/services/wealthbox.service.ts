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
  type: string;
}

interface WealthboxResponse {
  data: WealthboxContact[];
  meta: {
    total_count: number;
    total_pages: number;
    page: number;
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
      logger.info(`Fetching contacts from Wealthbox API - Page: ${page}, Per Page: ${perPage}`);
      logger.debug('Request headers:', this.getHeaders());
      
      const response = await this.retryWithBackoff(() =>
        axios.get(`${this.apiUrl}/contacts`, {
          headers: this.getHeaders(),
          params: {
            type: 'Person',  // Only fetch Person type contacts
            page,
            per_page: perPage,
          },
        })
      );
      
      logger.debug('Raw Wealthbox API Response:', JSON.stringify(response.data, null, 2));
      
      // Check if response.data exists
      if (!response.data) {
        logger.error('Empty response from Wealthbox API');
        throw new Error('Empty response from Wealthbox API');
      }

      // Handle different possible response structures
      let contacts: WealthboxContact[] = [];
      let meta = {
        total_count: 0,
        total_pages: 0,
        page: page
      };

      // Case 1: Response has data array directly
      if (Array.isArray(response.data)) {
        contacts = response.data;
        meta.total_count = contacts.length;
        meta.total_pages = Math.ceil(contacts.length / perPage);
      }
      // Case 2: Response has data property with array
      else if (response.data.data && Array.isArray(response.data.data)) {
        contacts = response.data.data;
        meta = {
          total_count: response.data.meta?.total_count || contacts.length,
          total_pages: response.data.meta?.total_pages || Math.ceil(contacts.length / perPage),
          page: response.data.meta?.page || page
        };
      }
      // Case 3: Response has contacts array
      else if (response.data.contacts && Array.isArray(response.data.contacts)) {
        contacts = response.data.contacts;
        meta.total_count = response.data.total_count || contacts.length;
        meta.total_pages = response.data.total_pages || Math.ceil(contacts.length / perPage);
      }
      else {
        logger.error('Unexpected response structure from Wealthbox API:', response.data);
        throw new Error('Invalid response structure from Wealthbox API');
      }
      
      // Filter to ensure we only have Person type contacts
      const filteredData = contacts.filter((contact: WealthboxContact) => contact.type === 'Person');
      
      logger.info(`Successfully fetched ${filteredData.length} Person contacts from Wealthbox API`);
      
      return {
        data: filteredData,
        meta
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Axios error fetching contacts from Wealthbox:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            params: error.config?.params
          }
        });
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

    logger.info('Starting to fetch all Person contacts from Wealthbox API');
    while (hasMore) {
      const response = await this.fetchContacts(currentPage);
      allContacts = [...allContacts, ...response.data];
      
      hasMore = currentPage < response.meta.total_pages;
      currentPage++;
      
      logger.info(`Fetched page ${currentPage - 1}, total contacts so far: ${allContacts.length}`);
      
      // Add a small delay between requests to avoid rate limiting
      await this.delay(100);
    }

    logger.info(`Completed fetching all Person contacts from Wealthbox API. Total contacts: ${allContacts.length}`);
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

  async testConnection(): Promise<boolean> {
    try {
      logger.info('Testing Wealthbox API connection...');
      const response = await axios.get(`${this.apiUrl}/contacts`, {
        headers: this.getHeaders(),
        params: {
          type: 'Person',
          page: 1,
          per_page: 1
        }
      });
      
      logger.info('Wealthbox API connection successful');
      logger.debug('Test response structure:', {
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        hasDataProperty: !!response.data?.data,
        hasContactsProperty: !!response.data?.contacts,
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error('Wealthbox API connection failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            params: error.config?.params
          }
        });
      } else {
        logger.error('Unknown error testing Wealthbox API connection:', error);
      }
      return false;
    }
  }
}

export const wealthboxService = new WealthboxService(); 