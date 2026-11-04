'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const performLogin = async (emailInput: string, passwordInput: string) => {
    setError('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: emailInput.trim().toLowerCase(),
        password: passwordInput.trim(),
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      let target = '/admin';
      const params = new URLSearchParams(window.location.search);
      const cb = params.get('callbackUrl');
      if (cb && !cb.includes('/admin/login')) target = cb;
      window.location.href = target;
    } catch {
      setError('An error occurred during sign in');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE & TABLET VIEW (< md): Layout matches reference screenshot,
          Theme matches Desktop (Noir / Luxury Black & White)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden min-h-screen bg-[#F0F1F5] flex flex-col">
        {/* Top Cover Image / Banner with Back Button */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#161619] flex-shrink-0">
          <img
            src="/images/feng_shui_hero_banner.jpg"
            alt="Miracle Feng Shui Banner"
            className="w-full h-full object-cover brightness-[0.65] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Floating '< Back' Pill Button */}
          <Link
            href="/"
            className="absolute top-5 left-4 z-20 inline-flex items-center gap-1.5 bg-black/60 hover:bg-black text-white text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-md no-underline"
          >
            <i className="fa-solid fa-chevron-left text-[10px]" />
            <span>Back</span>
          </Link>

          {/* Brand Pill Badge */}
          <div className="absolute top-5 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full">
            <img src="/images/miracle.jpeg" alt="Logo" className="w-4 h-4 rounded-full object-cover" />
            <span className="text-[10.5px] font-semibold text-white/90">Miracle Feng Shui</span>
          </div>

          {/* Bottom text inside banner */}
          <div className="absolute bottom-10 left-6 z-10" />
        </div>

        {/* Sliding White Sheet with rounded-t-[32px] */}
        <div className="relative z-10 -mt-7 bg-white rounded-t-[32px] shadow-2xl px-6 pt-7 pb-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Title & Subtitle matching Desktop */}
            <h1
              style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
              className="text-3xl sm:text-4xl text-gray-900 tracking-wide font-normal mb-1 text-center leading-none"
            >
              Admin Sign In
            </h1>
            <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              Access your store dashboard &amp; management tools
            </p>

            {/* Error Alert */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 mb-4 animate-in fade-in">
                <i className="fa-solid fa-circle-exclamation shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile Form matching Desktop styling */}
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {/* Email with floating label */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[11px] font-bold text-gray-700 z-10">
                  Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-3 text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                  />
                  <i className="fa-regular fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
              </div>

              {/* Password with floating label & eye toggle */}
              <div className="relative">
                <label className="absolute -top-2.5 left-3.5 bg-white px-1.5 text-[11px] font-bold text-gray-700 z-10">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-3 text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="mobile-agree"
                  defaultChecked
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                />
                <label htmlFor="mobile-agree" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                  Remember this device
                </label>
              </div>

              {/* Sign In button matching Desktop */}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#111111', color: '#ffffff' }}
                className="w-full py-3.5 px-5 rounded-lg text-xs sm:text-sm font-bold tracking-wider uppercase bg-[#111111] hover:bg-black text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-1"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back link */}
          <div className="text-center mt-5">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-400 hover:text-black inline-flex items-center gap-1.5 transition-colors no-underline"
            >
              <i className="fa-solid fa-arrow-left text-[10px]" />
              <span>Back to store</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (>= md): Existing 2-column layout kept intact
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex min-h-screen bg-[#F0F1F5] items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-2 my-auto animate-in fade-in zoom-in-95 duration-200">

          {/* LEFT: Form Panel */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            {/* Brand logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 no-underline">
              <img src="/images/logofull.svg" alt="Miracle Feng Shui" className="h-8 w-auto" />
              <span className="font-bold text-sm text-gray-900 tracking-tight">Feng Shui</span>
            </Link>

            {/* Heading */}
            <h1
              style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
              className="text-3xl lg:text-4xl text-gray-900 tracking-wide font-normal mb-1 leading-none"
            >
              Admin Sign In
            </h1>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Access your store dashboard &amp; management tools
            </p>

            {/* Error Alert */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 mb-4 animate-in fade-in">
                <i className="fa-solid fa-circle-exclamation shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email<span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs lg:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                  />
                  <i className="fa-regular fa-envelope absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password<span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs lg:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-black transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#111111', color: '#ffffff' }}
                className="w-full py-3 px-5 rounded-lg text-xs lg:text-sm font-bold tracking-wider uppercase bg-[#111111] hover:bg-black text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 mt-1"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </>
                )}
              </button>
            </form>

            {/* Back link */}
            <div className="mt-5">
              <Link
                href="/"
                className="text-xs font-semibold text-gray-400 hover:text-black inline-flex items-center gap-1.5 transition-colors no-underline"
              >
                <i className="fa-solid fa-arrow-left text-[10px]" />
                <span>Back to store</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: Image Panel */}
          <div className="relative overflow-hidden min-h-[420px] flex flex-col justify-end p-8 bg-[#161619] text-white">
            <img
              src="/images/feng_shui_hero_banner.jpg"
              alt="Feng Shui sanctuary"
              className="absolute inset-0 w-full h-full object-cover brightness-[0.6] contrast-[1.1]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative z-10 space-y-2.5">
              <h2
                style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
                className="text-3xl lg:text-4xl text-white tracking-wide font-normal leading-none"
              >
                Your Admin<br />Sanctuary Awaits
              </h2>
              <p className="text-xs text-white/70 leading-relaxed max-w-xs">
                Manage products, harmonize your catalog, and oversee fulfillment in one clean workspace.
              </p>

              <div className="flex gap-2 flex-wrap pt-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10.5px] font-semibold text-white/85 backdrop-blur-xs">
                  <i className="fa-solid fa-circle-check text-emerald-400 text-[10px]" />
                  <span>Products &amp; Orders</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10.5px] font-semibold text-white/85 backdrop-blur-xs">
                  <i className="fa-solid fa-layer-group text-amber-300 text-[10px]" />
                  <span>Layout Manager</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
