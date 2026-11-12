import { describe, expect, it } from 'vitest';
import { getPrismaClient, isDbRotationOrConnectionError, resetPrismaClient } from '@/lib/prisma';

describe('database reconnect', () => {
  it('treats network timeouts and resets as connection errors', () => {
    for (const code of ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'P1001', 'P1017']) {
      expect(isDbRotationOrConnectionError({ code, message: 'x' })).toBe(true);
    }
    expect(isDbRotationOrConnectionError(new Error('Connection terminated due to connection timeout'))).toBe(true);
  });

  it('does not reconnect for ordinary query errors', () => {
    expect(isDbRotationOrConnectionError({ code: 'P2002', message: 'Unique constraint failed' })).toBe(false);
    expect(isDbRotationOrConnectionError({ code: 'P2025', message: 'Record not found' })).toBe(false);
    expect(isDbRotationOrConnectionError(null)).toBe(false);
  });

  it('replaces a failed client only once when many requests fail together', async () => {
    const failed = getPrismaClient();
    const [a, b, c] = await Promise.all([resetPrismaClient(failed), resetPrismaClient(failed), resetPrismaClient(failed)]);
    expect(a).not.toBe(failed);
    expect(b).toBe(a);
    expect(c).toBe(a);
    expect(getPrismaClient()).toBe(a);
  });
});
