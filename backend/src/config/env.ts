import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  WEALTHBOX_API_URL: z.string().url(),
  WEALTHBOX_API_KEY: z.string(),
  WEALTHBOX_WEBHOOK_SECRET: z.string(),
  API_KEY: z.string(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']),
});

const env = envSchema.parse(process.env);

export default env; 