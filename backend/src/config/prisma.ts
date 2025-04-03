import { PrismaClient } from '@prisma/client';
import env from './env';

const prisma = new PrismaClient({
  log: ['error'], // Only log errors, regardless of environment
});


export default prisma; 