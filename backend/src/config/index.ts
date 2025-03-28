import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  wealthbox: {
    apiUrl: process.env.WEALTHBOX_API_URL || 'https://api.crmworkspace.com/v1',
    apiKey: process.env.WEALTHBOX_API_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const; 