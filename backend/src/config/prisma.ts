import { PrismaClient } from '@prisma/client';
import env from './env';

const prisma = new PrismaClient({
  log: ['error'],
});

export default prisma; 