'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from '@/context/CurrencyContext';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const { country, currency, language, t } = useLocale();

  // Completely hide public store footer on all admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#F5F5F1] text-[#222222] border-t border-[#E1E3DF] mt-auto">
      {/* Main Footer Container */}
      <div className="etsy-container pt-16 pb-12">
        {/* Mission Headline */}
        <h2
          style={{ marginBottom: '64px' }}
          className="text-[26px] sm:text-[30px] md:text-[34px] font-serif font-normal text-[#222222] tracking-tight leading-[1.18]"
        >
          {t('footer.mission', "We're on a mission to keep commerce human.")}
        </h2>

        {/* 4 Columns + Illustration Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Columns 1-4 (8 Columns on Large) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-[14px]">
            {/* Column 1: Shop */}
            <div>
              <h3 className="text-[14px] font-bold text-[#222222] mb-3">{t('footer.shop', 'Shop')}</h3>
              <ul className="list-none p-0 m-0 space-y-2.5 text-[#222222]">
                <li>
                  <Link href="/shop?category=Gifts" className="hover:underline">
                    {t('footer.gift_cards', 'Gift cards')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Wedding%20%26%20Party" className="hover:underline">
                    {t('footer.registry', 'Miracle feng shui Registry')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.sitemap', 'Sitemap')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.blog', 'Miracle feng shui blog')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.uk', 'Miracle feng shui United Kingdom')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.germany', 'Miracle feng shui Germany')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.canada', 'Miracle feng shui Canada')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Sell */}
            <div>
              <h3 className="text-[14px] font-bold text-[#222222] mb-3">{t('footer.sell', 'Sell')}</h3>
              <ul className="list-none p-0 m-0 space-y-2.5 text-[#222222]">
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.sell_on', 'Sell on Miracle feng shui')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.teams', 'Teams')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.forums', 'Forums')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.affiliates', 'Affiliates & Creators')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: About */}
            <div>
              <h3 className="text-[14px] font-bold text-[#222222] mb-3">{t('footer.about', 'About')}</h3>
              <ul className="list-none p-0 m-0 space-y-2.5 text-[#222222]">
                <li>
                  <Link href="/about" className="hover:underline font-medium">
                    {t('footer.about_miracle', 'About Miracle feng shui')}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:underline">
                    {t('footer.privacy', 'Privacy Policy')}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:underline">
                    {t('footer.terms', 'Terms & Conditions')}
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="hover:underline">
                    {t('footer.cancellation_policy', 'Cancellation & Return Policy')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.impact', 'Impact & Artisan Heritage')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.careers', 'Careers')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.press', 'Press')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.legal_imprint', 'Legal Imprint')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Help */}
            <div>
              <h3 className="text-[14px] font-bold text-[#222222] mb-3">{t('footer.help', 'Help')}</h3>
              <ul className="list-none p-0 m-0 space-y-2.5 text-[#222222]">
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.help_centre', 'Help Centre')}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:underline">
                    {t('footer.privacy_settings', 'Privacy settings')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Illustration Column (4 Columns on Large) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <svg
              className="w-full max-w-[280px] h-auto"
              viewBox="0 0 320 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Easel Stand */}
              <path
                d="M170 30L125 215M170 30L215 215M170 30V215M115 130H225M120 138H220"
                stroke="#2B2620"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Canvas on Easel */}
              <rect
                x="130"
                y="50"
                width="80"
                height="75"
                rx="4"
                fill="#FFFFFF"
                stroke="#2B2620"
                strokeWidth="3"
              />
              {/* Painting on Canvas (orange organic shape) */}
              <path
                d="M145 90C140 75 160 65 175 70C190 75 195 90 185 100C175 110 150 105 145 90Z"
                fill="#F1641E"
              />

              {/* Artist 1 (Woman in orange apron) */}
              <g>
                {/* Hair bun */}
                <circle cx="95" cy="52" r="7" fill="#F1641E" />
                {/* Head */}
                <circle
                  cx="95"
                  cy="68"
                  r="14"
                  fill="#FFFFFF"
                  stroke="#2B2620"
                  strokeWidth="3"
                />
                {/* Headband */}
                <circle cx="95" cy="62" r="11" fill="#F1641E" />
                <path
                  d="M80 82C80 72 90 68 98 70C108 72 110 82 110 82"
                  stroke="#2B2620"
                  strokeWidth="2.5"
                />
                {/* Apron & Body */}
                <path
                  d="M75 125C75 110 85 105 95 105C105 105 115 110 115 125L120 215H70L75 125Z"
                  fill="#F1641E"
                  stroke="#2B2620"
                  strokeWidth="3"
                />
                <path
                  d="M85 105L80 135M105 105L110 135"
                  stroke="#2B2620"
                  strokeWidth="3"
                />
              </g>

              {/* Artist 2 (Man painting on canvas) */}
              <g>
                {/* Head */}
                <circle cx="270" cy="95" r="16" fill="#2B2620" />
                {/* Arm reaching with paintbrush */}
                <path
                  d="M260 120C240 100 220 95 190 95"
                  stroke="#2B2620"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Paintbrush */}
                <path
                  d="M190 95L178 95"
                  stroke="#F1641E"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {/* Body in dark coat */}
                <path
                  d="M250 125C240 125 230 145 230 170L225 215H310L305 160C305 135 295 125 285 125H250Z"
                  fill="#2B2620"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* App Store & Google Play Badges */}
        <div className="flex flex-wrap items-center gap-3 mt-12 pt-4">
          <a
            href="https://apple.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-xl transition-all shadow-sm group"
          >
            <svg className="w-6 h-6 mr-2.5 fill-white text-white shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.88-.91.04-2.01.61-2.66 1.37-.57.65-1.07 1.73-.94 2.76 1.02.08 2.05-.49 2.67-1.25z" />
            </svg>
            <div className="text-left leading-none">
              <span className="text-[10px] text-gray-300 font-medium tracking-wide block uppercase mb-0.5">
                {t('footer.download_on', 'Download on the')}
              </span>
              <span className="text-[15px] font-bold text-white block">
                {t('footer.app_store', 'App Store')}
              </span>
            </div>
          </a>

          <a
            href="https://google.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center bg-[#111111] hover:bg-black text-white px-4 py-2 rounded-xl transition-all shadow-sm group"
          >
            <svg className="w-6 h-6 mr-2.5 fill-white text-white shrink-0" viewBox="0 0 24 24">
              <path d="M3.609 1.814L13.792 12 3.61 22.186A2.222 2.222 0 0 1 3 20.617V3.383c0-.623.23-1.18.609-1.569zm11.597 11.597l2.42 2.42-12.01 6.864 9.59-9.284zm0-2.822L5.616 1.305l12.01 6.864-2.42 2.42zm1.414 1.414l3.197-1.827c1.043-.596 1.043-1.57 0-2.166l-3.197-1.827-2.122 2.122 2.122 2.122z" />
            </svg>
            <div className="text-left leading-none">
              <span className="text-[10px] text-gray-300 font-medium tracking-wide block uppercase mb-0.5">
                {t('footer.get_it_on', 'GET IT ON')}
              </span>
              <span className="text-[15px] font-bold text-white block">
                {t('footer.google_play', 'Google Play')}
              </span>
            </div>
          </a>
        </div>
      </div>

      {/* Bottom Light-Grey Bar */}
      <div className="bg-[#EAE9E4] border-t border-[#DCDAD4] py-4 text-[13px] text-[#222222]">
        <div className="etsy-container flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Country flag + currency */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-[17px]">{country === 'UAE' ? '🇦🇪' : '🇮🇳'}</span>
              <span>{country === 'UAE' ? t('footer.uae_display', 'United Arab Emirates | AED (د.إ)') : t('footer.india_display', 'India | INR (₹)')}</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-[#222222]">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>
              {/* Pinterest */}
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.33 1.365-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:opacity-75 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: Copyright & Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[#222222]">
            <span>© {currentYear} Miracle feng shui, Inc. {t('footer.all_rights', 'All rights reserved.')}</span>
            <Link href="/about" className="hover:underline font-medium">
              {t('footer.about', 'About')}
            </Link>
            <Link href="/terms" className="hover:underline">
              {t('footer.terms_of_use', 'Terms of Use')}
            </Link>
            <Link href="/privacy-policy" className="hover:underline">
              {t('footer.privacy_short', 'Privacy')}
            </Link>
            <Link href="/return-policy" className="hover:underline">
              {t('footer.cancellation_policy', 'Cancellation & Return Policy')}
            </Link>
            <Link href="/shop" className="hover:underline">
              {t('footer.interest_ads', 'Interest-based ads')}
            </Link>
            <Link href="/shop" className="hover:underline">
              {t('footer.local_shops', 'Local Shops')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
