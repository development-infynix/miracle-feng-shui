'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset link.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF9F6]">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E4DA] shadow-xs relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#F3EEFC] text-[#3A1F62] text-2xl mb-4 shadow-2xs">
              <i className="fa-solid fa-key" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs mx-auto">
              Enter your registered email address and we will send you a secure link to reset your account password.
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                <i className="fa-solid fa-circle-check text-emerald-600 text-base mb-1 block" />
                <strong>Reset Link Sent!</strong>
                <p className="mt-1 text-emerald-700">
                  If an account is associated with <strong>{email}</strong>, we have dispatched a password reset link. Please check your inbox and spam folder.
                </p>
              </div>
              <p className="text-xs text-gray-400">
                The link is valid for 60 minutes.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } })
                      );
                    }
                  }}
                  className="w-full py-3 rounded-full bg-[#140D1F] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <i className="fa-regular fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-hidden focus:border-[#3A1F62] focus:ring-1 focus:ring-[#3A1F62]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-[#140D1F] hover:bg-black disabled:opacity-60 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } })
                      );
                    }
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-black hover:underline cursor-pointer"
                >
                  &larr; Remember your password? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
