import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { RegisterInput, LoginInput } from '../validators/auth.validator';
import { emailService } from './email.service';

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };
  },

  async requestPasswordReset(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    const user = await userRepository.findByEmail(email);
    if (!user) {
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
