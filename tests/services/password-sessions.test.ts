import { afterEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { authService } from '@/server/services/auth.service';
import { orderService } from '@/server/services/order.service';
import { userRepository } from '@/server/repositories/user.repository';
import { authOptions } from '@/lib/auth';

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
    sessionVersion: 0,
    addresses: [],
    ...overrides,
  }) as any;

afterEach(() => vi.restoreAllMocks());

describe('no order without payment', () => {
  it('refuses to create an online-payment order directly', async () => {
    await expect(
      orderService.createFromCart('u1', { paymentMethod: 'RAZORPAY', shippingAddress: {} } as any)
    ).rejects.toThrow('once your payment goes through');
  });
});

describe('spaces around passwords', () => {
  it('saves a reset password without the spaces around it', async () => {
    vi.spyOn(userRepository, 'findByResetToken').mockResolvedValueOnce(user());
    const update = vi.spyOn(userRepository, 'updatePassword').mockResolvedValueOnce(user());
    vi.spyOn(userRepository, 'bumpSessionVersion').mockResolvedValueOnce({ sessionVersion: 1 });

    await authService.resetPassword('token', '  newpass1  ');

    expect(await bcrypt.compare('newpass1', update.mock.calls[0][1])).toBe(true);
  });

  it('refuses a reset password that is too short once trimmed', async () => {
    await expect(authService.resetPassword('token', '  abc   ')).rejects.toThrow('at least 6 characters');
  });

  it('still signs in an account whose password was saved with a stray space', async () => {
    const passwordHash = await bcrypt.hash('oldpass ', 4);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(user({ passwordHash }));

    await expect(authService.validateCredentials({ email: 'priya@example.com', password: 'oldpass ' })).resolves.toMatchObject({ id: 'u1' });
  });

  it('signs in with spaces typed around a normal password', async () => {
    const passwordHash = await bcrypt.hash('secret123', 4);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(user({ passwordHash }));

    await expect(authService.validateCredentials({ email: 'priya@example.com', password: ' secret123 ' })).resolves.toMatchObject({ id: 'u1' });
  });
});

describe('signing out other devices', () => {
  const jwt = (token: Record<string, unknown>) => authOptions.callbacks!.jwt!({ token, user: undefined } as any);

  it('a password change leaves sessions alone until the customer chooses', async () => {
    const passwordHash = await bcrypt.hash('oldpass1', 4);
    vi.spyOn(userRepository, 'findById').mockResolvedValue(user({ passwordHash }));
    vi.spyOn(userRepository, 'updatePassword').mockResolvedValueOnce(user());
    const bump = vi.spyOn(userRepository, 'bumpSessionVersion');

    await authService.changePassword('u1', 'oldpass1', 'newpass1');

    expect(bump).not.toHaveBeenCalled();
  });

  it('a reset by email signs out every session', async () => {
    vi.spyOn(userRepository, 'findByResetToken').mockResolvedValueOnce(user());
    vi.spyOn(userRepository, 'updatePassword').mockResolvedValueOnce(user());
    const bump = vi.spyOn(userRepository, 'bumpSessionVersion').mockResolvedValueOnce({ sessionVersion: 1 });

    const result = await authService.resetPassword('token', 'newpass1');

    expect(bump).toHaveBeenCalledWith('u1');
    expect(result.message).toContain('signed out on all devices');
  });

  it('ends a session holding an older version, and keeps one holding the current version', async () => {
    vi.spyOn(userRepository, 'findSessionStatus').mockResolvedValue({ deactivatedAt: null, sessionVersion: 2 });
    await expect(jwt({ id: 'u1', sessionVersion: 1 })).rejects.toThrow('SessionEnded');
    await expect(jwt({ id: 'u1', sessionVersion: 2 })).resolves.toMatchObject({ id: 'u1' });
  });

  it('keeps sessions from before this change, which carry no version, while the account is at 0', async () => {
    vi.spyOn(userRepository, 'findSessionStatus').mockResolvedValueOnce({ deactivatedAt: null, sessionVersion: 0 });
    await expect(jwt({ id: 'u1' })).resolves.toMatchObject({ id: 'u1' });
  });

  it('records the version on a new sign-in', async () => {
    const token = await authOptions.callbacks!.jwt!({ token: {}, user: { id: 'u1', role: 'CUSTOMER', sessionVersion: 3 } } as any);
    expect(token.sessionVersion).toBe(3);
  });
});
