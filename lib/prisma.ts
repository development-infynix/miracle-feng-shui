import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/app/generated/prisma/client';

/**
 * Returns the latest direct database URL for Prisma Pg adapter.
 * Supports environment variable updates during DB credential/host rotation.
 */
export function getDirectUrl(): string {
  const rawUrl = process.env.DATABASE_URL || '';
  return (
    process.env.DIRECT_URL ||
    (rawUrl.startsWith('prisma+postgres://')
      ? 'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable'
      : rawUrl)
  );
}

interface PrismaGlobalState {
  prismaInstance?: PrismaClient;
  activeUrl?: string;
}

const globalForPrisma = globalThis as unknown as PrismaGlobalState;

function instantiatePrismaClient(): { client: PrismaClient; url: string } {
  const connectionString = getDirectUrl();
  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  return { client, url: connectionString };
}

/**
 * Force disconnects current Prisma instance and re-initializes connection
 * upon database credentials/host rotation.
 */
export async function resetPrismaClient(): Promise<PrismaClient> {
  if (globalForPrisma.prismaInstance) {
    try {
      await globalForPrisma.prismaInstance.$disconnect();
    } catch (err) {
      console.warn('Prisma disconnect during rotation warning:', err);
    }
  }

  const { client, url } = instantiatePrismaClient();
  globalForPrisma.prismaInstance = client;
  globalForPrisma.activeUrl = url;
  return client;
}

/**
 * Retrieves active Prisma client instance, re-instantiating if rotated.
 */
export function getPrismaClient(): PrismaClient {
  const currentUrl = getDirectUrl();

  // If connection URL rotated, refresh instance dynamically
  if (
    !globalForPrisma.prismaInstance ||
    (globalForPrisma.activeUrl && globalForPrisma.activeUrl !== currentUrl)
  ) {
    const { client, url } = instantiatePrismaClient();
    globalForPrisma.prismaInstance = client;
    globalForPrisma.activeUrl = url;
  }

  return globalForPrisma.prismaInstance!;
}

// Check DB rotation connection error codes
function isDbRotationOrConnectionError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error).toLowerCase();
  const code = error?.code;
  return (
    code === 'P1001' || // Can't reach database server
    code === 'P1002' || // Database server timed out
    code === 'P1008' || // Operations timed out
    code === 'P1017' || // Server has closed the connection
    msg.includes('connection terminated') ||
    msg.includes('connection closed') ||
    msg.includes('admin shutdown') ||
    msg.includes('password authentication failed') ||
    msg.includes('connection refused')
  );
}

/**
 * Proxy wrapper around Prisma Client to automatically handle credential/host rotation.
 * If a DB operation fails due to rotation, it resets the client connection and retries.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const activeClient = getPrismaClient();
    const value = (activeClient as any)[prop];

    if (typeof value === 'function') {
      return function (...args: any[]) {
        try {
          const result = value.apply(activeClient, args);
          if (result && typeof result.then === 'function') {
            return result.catch(async (err: any) => {
              if (isDbRotationOrConnectionError(err)) {
                console.warn('DB Rotation/Connection error detected. Reconnecting Prisma Client...');
                const newClient = await resetPrismaClient();
                const retryValue = (newClient as any)[prop];
                return retryValue.apply(newClient, args);
              }
              throw err;
            });
          }
          return result;
        } catch (err: any) {
          if (isDbRotationOrConnectionError(err)) {
            console.warn('Sync DB Rotation error detected. Reconnecting Prisma Client...');
            const newClient = getPrismaClient();
            const retryValue = (newClient as any)[prop];
            return retryValue.apply(newClient, args);
          }
          throw err;
        }
      };
    }
    return value;
  },
});

export * from '@/app/generated/prisma/client';
export default prisma;
