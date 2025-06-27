import { PrismaClient } from '@prisma/client';
import { config } from './enviroment';

let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

if (config.nodeEnv === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'minimal'
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty'
    });
  }
  prisma = global.__prisma;
}

export { prisma };

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}