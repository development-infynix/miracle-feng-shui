import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService, nameFromEmail } from '@/server/services/auth.service';
import { userRepository } from '@/server/repositories/user.repository';
import { emailService } from '@/server/services/email.service';

const user = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya@gmail.com',
    passwordHash: null,
    googleId: 'google-123',
    role: 'CUSTOMER',
    phone: null,
    resetToken: null,
    resetTokenExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    addresses: [],
    ...overrides,
  }) as any;

afterEach(() => vi.restoreAllMocks());

describe('Google sign-in', () => {
  it('makes an account the first time, named from Google', async () => {
    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(null);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
    const create = vi.spyOn(userRepository, 'create').mockResolvedValueOnce(user());

    await authService.signInWithGoogle({ googleId: 'google-123', email: 'Priya@Gmail.com', emailVerified: true, name: 'Priya Sharma' });

    expect(create).toHaveBeenCalledWith({ name: 'Priya Sharma', email: 'priya@gmail.com', googleId: 'google-123', role: 'CUSTOMER' });
    expect(create.mock.calls[0][0]).not.toHaveProperty('passwordHash');
  });

  it('names the account from the email address when Google gives no name', async () => {
    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(null);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
    const create = vi.spyOn(userRepository, 'create').mockResolvedValueOnce(user());

    await authService.signInWithGoogle({ googleId: 'g', email: 'rahul.k_verma92@gmail.com', emailVerified: true, name: '' });

    expect(create.mock.calls[0][0].name).toBe('Rahul K Verma');
  });

  it('signs a returning customer in without making a new account', async () => {
    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(user());
    const create = vi.spyOn(userRepository, 'create');

    const result = await authService.signInWithGoogle({ googleId: 'google-123', email: 'priya@gmail.com', emailVerified: true, name: 'Priya' });

    expect(result.id).toBe('u1');
    expect(create).not.toHaveBeenCalled();
  });

  it('links Google to an existing password account with the same email, keeping its role', async () => {
    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(null);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user({ googleId: null, passwordHash: 'hash' }));
    const link = vi.spyOn(userRepository, 'linkGoogle').mockResolvedValueOnce(user({ passwordHash: 'hash' }));
    const create = vi.spyOn(userRepository, 'create');

    await authService.signInWithGoogle({ googleId: 'google-123', email: 'priya@gmail.com', emailVerified: true });

    expect(link).toHaveBeenCalledWith('u1', 'google-123');
    expect(create).not.toHaveBeenCalled();
  });

  it('refuses an unverified Google email', async () => {
    const find = vi.spyOn(userRepository, 'findByEmail');
    await expect(
      authService.signInWithGoogle({ googleId: 'g', email: 'priya@gmail.com', emailVerified: false })
    ).rejects.toThrow('verified email');
    expect(find).not.toHaveBeenCalled();
  });

  it('refuses an email already linked to a different Google account', async () => {
    vi.spyOn(userRepository, 'findByGoogleId').mockResolvedValueOnce(null);
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user({ googleId: 'someone-else' }));
    await expect(
      authService.signInWithGoogle({ googleId: 'google-123', email: 'priya@gmail.com', emailVerified: true })
    ).rejects.toThrow('different Google account');
  });
});

describe('Google accounts and passwords', () => {
  it('tells the profile page the account has no password, without sending Google ids', async () => {
    vi.spyOn(userRepository, 'findById').mockResolvedValueOnce(user());
    const profile = await authService.getProfile('u1');
    expect(profile).toMatchObject({ hasPassword: false, googleLinked: true });
    expect(profile).not.toHaveProperty('googleId');
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('refuses to verify or change a password on a Google account', async () => {
    vi.spyOn(userRepository, 'findById').mockResolvedValue(user());
    await expect(authService.verifyCurrentPassword('u1', 'anything')).rejects.toThrow('signs in with Google');
    await expect(authService.changePassword('u1', 'anything', 'newpassword')).rejects.toThrow('signs in with Google');
  });

  it('sends no reset email for a Google account, with the same reply as any other email', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user());
    const setToken = vi.spyOn(userRepository, 'setResetToken');
    const send = vi.spyOn(emailService, 'sendPasswordResetEmail');

    const result = await authService.requestPasswordReset('priya@gmail.com');

    expect(result.message).toContain('If that email exists');
    expect(setToken).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });

  it('points a Google customer who tries to register with a password to Google', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user());
    await expect(
      authService.register({ name: 'Priya', email: 'priya@gmail.com', password: 'password123' })
    ).rejects.toThrow('Continue with Google');
  });

  it('refuses a password sign-in on a Google account', async () => {
    vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user());
    await expect(authService.validateCredentials({ email: 'priya@gmail.com', password: 'x' })).rejects.toThrow('Invalid email or password');
  });
});

describe('nameFromEmail', () => {
  it.each([
    ['priya.sharma92@gmail.com', 'Priya Sharma'],
    ['john+shop@gmail.com', 'John'],
    ['12345@gmail.com', 'Customer'],
  ])('%s becomes %s', (email, name) => expect(nameFromEmail(email)).toBe(name));
});
