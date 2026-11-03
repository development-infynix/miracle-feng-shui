'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Missing or invalid reset token. Please request a new link.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <i className="fa-solid fa-triangle-exclamation text-amber-600 text-base mb-1 block" />
          <strong>Invalid Reset Link</strong>
          <p className="mt-1 text-amber-700">
            No reset token found in the URL. Please request a new password reset link.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block px-5 py-2.5 rounded-full bg-[#140D1F] text-white text-xs font-bold hover:bg-black transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4 animate-in fade-in duration-300">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
          <i className="fa-solid fa-circle-check text-emerald-600 text-base mb-1 block" />
          <strong>Password Reset Complete!</strong>
          <p className="mt-1 text-emerald-700">
            Your password has been securely updated. You can now log into your Miracle Feng Shui account.
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } })
                );
              }
              router.push('/');
            }}
            className="w-full py-3 rounded-full bg-[#140D1F] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="block text-xs font-bold text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-[#3A1F62] focus:ring-1 focus:ring-[#3A1F62]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs cursor-pointer"
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your new password"
            className="w-full pl-3 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-[#3A1F62] focus:ring-1 focus:ring-[#3A1F62]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full bg-[#140D1F] hover:bg-black disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
      >
        {loading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <span>Update Password</span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E4DA] shadow-xs relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F3EEFC] text-[#3A1F62] text-2xl mb-4 shadow-2xs">
              <i className="fa-solid fa-lock" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
              Set New Password
            </h1>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto">
              Please enter and confirm your new secure password.
            </p>
          </div>

          <Suspense
            fallback={
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#140D1F] rounded-full animate-spin mx-auto mb-2" />
                <span className="text-xs text-gray-400">Loading reset session...</span>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
