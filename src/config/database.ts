import { PrismaClient } from '@prisma/client';
import config from '../config';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (config.nodeEnv !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
