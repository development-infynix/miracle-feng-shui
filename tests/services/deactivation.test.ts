import { afterEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { authService } from '@/server/services/auth.service';
import { adminService } from '@/server/services/admin.service';
import { userRepository } from '@/server/repositories/user.repository';
import { adminRepository } from '@/server/repositories/admin.repository';
import { authOptions } from '@/lib/auth';
import { ACCOUNT_DEACTIVATED } from '@/lib/authErrors';

const user = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'u1',
    name: 'Priya',
    email: 'priya@example.com',
    passwordHash: null,
    googleId: null,
    role: 'CUSTOMER',
    phone: null,
    deactivatedAt: null,
    addresses: [],
    ...overrides,
  }) as any;

afterEach(() => vi.restoreAllMocks());

describe('signing in to a deactivated account', () => {
  it('says the account is deactivated only after the right password', async () => {
    const passwordHash = await bcrypt.hash('secret123', 4);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(user({ passwordHash, deactivatedAt: new Date() }));

    await expect(authService.validateCredentials({ email: 'priya@example.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password'
    );
    await expect(authService.validateCredentials({ email: 'priya@example.com', password: 'secret123' })).rejects.toThrow(
      ACCOUNT_DEACTIVATED
    );
  });

  it('refuses Google sign-in, whether the account is linked by Google id or by email', async () => {
    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(user({ googleId: 'g1', deactivatedAt: new Date() }));
    await expect(
      authService.signInWithGoogle({ googleId: 'g1', email: 'priya@example.com', emailVerified: true })
    ).rejects.toThrow(ACCOUNT_DEACTIVATED);

    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(null);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user({ deactivatedAt: new Date() }));
    const link = vi.spyOn(userRepository, 'linkGoogle');
    await expect(
      authService.signInWithGoogle({ googleId: 'g2', email: 'priya@example.com', emailVerified: true })
    ).rejects.toThrow(ACCOUNT_DEACTIVATED);
    expect(link).not.toHaveBeenCalled();
  });
});

describe('open sessions', () => {
  const jwt = (token: Record<string, unknown>) => authOptions.callbacks!.jwt!({ token, user: undefined } as any);

  it('keeps an active account signed in', async () => {
    vi.spyOn(userRepository, 'findSessionStatus').mockResolvedValueOnce({ deactivatedAt: null, sessionVersion: 0 });
    await expect(jwt({ id: 'u1', role: 'CUSTOMER' })).resolves.toMatchObject({ id: 'u1' });
  });

  it('ends the session of a deactivated or deleted account', async () => {
    vi.spyOn(userRepository, 'findSessionStatus').mockResolvedValueOnce({ deactivatedAt: new Date(), sessionVersion: 0 });
    await expect(jwt({ id: 'u1' })).rejects.toThrow(ACCOUNT_DEACTIVATED);
    vi.spyOn(userRepository, 'findSessionStatus').mockResolvedValueOnce(null);
    await expect(jwt({ id: 'u1' })).rejects.toThrow(ACCOUNT_DEACTIVATED);
  });

  it('keeps the session when the database is briefly unreachable', async () => {
    vi.spyOn(userRepository, 'findSessionStatus').mockRejectedValueOnce(new Error('connection lost'));
    await expect(jwt({ id: 'u1' })).resolves.toMatchObject({ id: 'u1' });
  });
});

describe('admin deactivate and reactivate', () => {
  it('stamps the date when deactivating, and clears it when reactivating', async () => {
    const set = vi.spyOn(adminRepository, 'setCustomerDeactivatedAt').mockImplementation(async (id, deactivatedAt) => ({ id, deactivatedAt }));

    const off = await adminService.setCustomerActive('u1', false);
    expect(off.deactivatedAt).toBeInstanceOf(Date);
    const on = await adminService.setCustomerActive('u1', true);
    expect(on.deactivatedAt).toBeNull();
    expect(set).toHaveBeenLastCalledWith('u1', null);
  });

  it('404s for an id that is not a customer, such as an admin', async () => {
    vi.spyOn(adminRepository, 'setCustomerDeactivatedAt').mockResolvedValueOnce(null);
    await expect(adminService.setCustomerActive('admin-1', false)).rejects.toThrow('Customer not found');
  });
});
