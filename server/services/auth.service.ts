import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator';
import { emailService } from './email.service';
import { ACCOUNT_DEACTIVATED } from '@/lib/authErrors';

const GOOGLE_ONLY_MESSAGE = 'This account signs in with Google, so it has no password. Use "Continue with Google".';

/** A display name from the email address, for when Google gives none: "priya.sharma92" becomes "Priya Sharma". */
export function nameFromEmail(email: string) {
  const words = email
    .split('@')[0]
    .replace(/\+.*$/, '')
    .split(/[._\-]+/)
    .map((word) => word.replace(/\d+/g, ''))
    .filter(Boolean);
  const name = words.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  return name.length >= 2 ? name : 'Customer';
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict(
        existing.passwordHash
          ? 'An account with this email already exists'
          : 'This email already has an account that signs in with Google. Use "Continue with Google".'
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: 'CUSTOMER',
    });

    return user;
  },

  async validateCredentials(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const password = input.password.trim();

    // Let any database error propagate: we must never hand out a session when
    // the user lookup fails. No demo/in-memory admin fallback.
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    // Only said after the right password, so it can't be used to find out which emails have accounts.
    if (user.deactivatedAt) {
      throw ApiError.forbidden(ACCOUNT_DEACTIVATED);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
  },

  /**
   * Signs a customer in with their Google account, making the account the first time.
   * Google has already checked the email, so an existing account with that email is linked to Google.
   */
  async signInWithGoogle(input: { googleId: string; email?: string | null; emailVerified?: boolean; name?: string | null }) {
    if (!input.googleId || !input.email || input.emailVerified !== true) {
      throw ApiError.unauthorized('Your Google account needs a verified email address.');
    }
    const email = input.email.trim().toLowerCase();

    const linked = await userRepository.findByGoogleId(input.googleId);
    if (linked) {
      if (linked.deactivatedAt) throw ApiError.forbidden(ACCOUNT_DEACTIVATED);
      return linked;
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      if (existing.deactivatedAt) throw ApiError.forbidden(ACCOUNT_DEACTIVATED);
      if (existing.googleId && existing.googleId !== input.googleId) {
        throw ApiError.conflict('This email is linked to a different Google account.');
      }
      return userRepository.linkGoogle(existing.id, input.googleId);
    }

    const name = input.name?.trim() || nameFromEmail(email);
    return userRepository.create({ name, email, googleId: input.googleId, role: 'CUSTOMER' });
  },

  async getProfile(userId: string) {
    const profile = await userRepository.findById(userId);
    if (!profile) {
      throw ApiError.notFound('User profile not found');
    }
    const { passwordHash, googleId, resetToken: _token, resetTokenExpiry: _expiry, ...safeProfile } = profile;
    // Tells the profile page which sign-in the account uses, without sending the hash or Google's id.
    return { ...safeProfile, hasPassword: Boolean(passwordHash), googleLinked: Boolean(googleId) };
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return userRepository.update(userId, {
      name: input.name,
      ...(input.phone !== undefined && { phone: input.phone || null }),
    });
  },

  /** Throws unless this is the account's current password. Login trims passwords, so this does too. */
  async verifyCurrentPassword(userId: string, currentPassword: string) {
    const user = await userRepository.findById(userId);
    if (user && !user.passwordHash) {
      throw ApiError.badRequest(GOOGLE_ONLY_MESSAGE);
    }
    if (!user || !user.passwordHash || !(await bcrypt.compare(currentPassword.trim(), user.passwordHash))) {
      throw ApiError.badRequest("That password isn't correct. Try again, or reset it by email.");
    }
    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Checked again here: the earlier Verify step only unlocks the form, and proves nothing to the server.
    const user = await this.verifyCurrentPassword(userId, currentPassword);
    if (await bcrypt.compare(newPassword, user.passwordHash!)) {
      throw ApiError.badRequest('Choose a new password that is different from your current one.');
    }
    await userRepository.updatePassword(user.id, await bcrypt.hash(newPassword, 12));
    return { changed: true };
  },

  async requestPasswordReset(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);
    // Google accounts have no password to reset. The reply is the same, so it can't reveal which emails have accounts.
    if (!user || !user.passwordHash) {
      return { message: 'If that email exists in our records, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour validity

    await userRepository.setResetToken(email, resetToken, resetTokenExpiry);

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await emailService.sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    return { message: 'If that email exists in our records, a reset link has been sent.' };
  },

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 6) {
      throw ApiError.badRequest('Valid token and a password of at least 6 characters are required.');
    }

    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw ApiError.badRequest('This password reset link is invalid or has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await userRepository.updatePassword(user.id, passwordHash);

    return { message: 'Password has been reset successfully. You may now sign in.' };
  },
};
