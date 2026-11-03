import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Miracle Feng Shui',
  description:
    'Learn how Miracle Feng Shui collects, uses, protects, and handles your personal information with absolute security and transparency.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 16, 2026';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#222222] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-xs text-gray-500">
            <li>
              <Link href="/" className="hover:text-[#3A1F62] transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li className="text-[#3A1F62] font-semibold" aria-current="page">
              Privacy Policy
            </li>
          </ol>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E4DA] shadow-xs mb-10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#3A1F62]/5 rounded-full pointer-events-none blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEFC] text-[#3A1F62] text-xs font-bold uppercase tracking-wider mb-4">
              <i className="fa-solid fa-shield-halved text-xs" />
              <span>Trust & Security</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#140D1F] mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              At Miracle Feng Shui, we hold your trust and privacy with sacred respect. This policy outlines how we safeguard your personal information when you visit, explore, or purchase from our sanctuary of authentic handcrafted talismans.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>
                <strong>Last Updated:</strong> {lastUpdated}
              </span>
              <span>&bull;</span>
              <span>Effective Globally</span>
              <span>&bull;</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <i className="fa-solid fa-lock text-[11px]" />
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E4DA] shadow-xs space-y-10 text-[15px] leading-relaxed text-gray-700">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Information We Collect
              </h2>
            </div>
            <p className="mb-3">
              When you interact with Miracle Feng Shui, we collect information necessary to fulfill your orders, provide sacred energy consultations, and ensure an effortless shopping experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
              <li>
                <strong>Contact & Delivery Details:</strong> Full name, shipping address, billing address, phone number, and email address for order delivery and courier dispatch.
              </li>
              <li>
                <strong>Order Specifications:</strong> Product selections, customized consecration requests, zodiac birth dates (if willingly provided for personalized talisman blessing).
              </li>
              <li>
                <strong>Payment Information:</strong> All payment transactions are processed securely through certified third-party payment gateways (such as Razorpay, Stripe, or Apple Pay). We never store your full credit/debit card numbers or CVV on our servers.
              </li>
              <li>
                <strong>Technical & Device Data:</strong> IP address, browser type, operating system, and browsing habits collected anonymously to prevent fraudulent transactions and improve site performance.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                How We Use Your Sacred Information
              </h2>
            </div>
            <p className="mb-3">We strictly utilize your data for purposeful, legitimate business needs:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/70">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-truck-fast text-[#3A1F62]" />
                  Order Dispatch & Tracking
                </h3>
                <p className="text-gray-600">
                  Coordinating with reputable national and international logistics carriers to deliver your sacred pieces intact.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/70">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-envelope text-[#3A1F62]" />
                  Transaction Notifications
                </h3>
                <p className="text-gray-600">
                  Sending instant invoices, order status confirmations, and doorstep tracking links via email or SMS.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/70">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-wand-magic-sparkles text-[#3A1F62]" />
                  Consecration & Ritual Customization
                </h3>
                <p className="text-gray-600">
                  Preparing specific intention rituals and personalized feng shui placement cards when requested.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/70">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-shield-check text-[#3A1F62]" />
                  Fraud Prevention & Safety
                </h3>
                <p className="text-gray-600">
                  Detecting unauthorized activity and protecting both patrons and our artisan community from fraudulent chargebacks.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Payment Security & Encryption
              </h2>
            </div>
            <p className="mb-3">
              Your security is our absolute priority. We adhere strictly to <strong>PCI-DSS Level 1</strong> compliance standards. All sensitive checkout data is transmitted using encrypted Transport Layer Security (TLS/SSL).
            </p>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 text-sm flex items-start gap-3">
              <i className="fa-solid fa-lock text-amber-600 text-lg mt-0.5" />
              <div>
                <strong>Zero Card Storage Guarantee:</strong> Miracle Feng Shui does not store, view, or retain your raw debit/credit card numbers or UPI PINs. All financial handoffs happen directly inside encrypted banking gateways.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Cookies & Session Preferences
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              We employ cookies and local storage tokens to retain items in your shopping bag, remember your currency preferences, and ensure seamless navigation across our site. You may adjust your browser settings to decline cookies at any time, though some interactive features may experience limitations.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                5
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Third-Party Sharing & Logistics
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              We do not sell, rent, or lease your private information to marketing brokers or unrelated third parties. We share information only with:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-gray-600">
              <li>Verified courier partners (e.g., Blue Dart, Delhivery, FedEx) solely for accurate door delivery.</li>
              <li>Encrypted transaction processors (e.g., Razorpay, Stripe) to authorize payments.</li>
              <li>Law enforcement authorities only if compelled by formal, legally mandated court orders.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                6
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Your Rights & Choices
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Regardless of your location, you hold full autonomy over your stored information:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-gray-600">
              <li><strong>Access & Rectification:</strong> You may request an export of data we hold or request corrections to shipping details.</li>
              <li><strong>Erasure & Opt-Out:</strong> You may request deletion of your account and opt-out of promotional newsletters at any moment with one click.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="border-t border-gray-100 pt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                7
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Contact Our Privacy Concierge
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              If you have inquiries, suggestions, or wish to exercise any of your privacy rights, please reach out directly:
            </p>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm">Miracle Feng Shui Care Sanctuary</p>
                <p className="text-xs text-gray-500 mt-0.5">Email: privacy@miraclefengshui.com &bull; Support: 10:00 AM – 7:00 PM IST</p>
              </div>
              <Link
                href="/shop"
                className="px-5 py-2.5 rounded-full bg-[#3A1F62] text-white hover:bg-[#2B154C] text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Return to Shop
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
