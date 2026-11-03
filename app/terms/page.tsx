import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Miracle Feng Shui',
  description:
    'Read our terms of service, conditions of purchase, artisan craftsmanship policies, and spiritual item disclaimers at Miracle Feng Shui.',
};

export default function TermsAndConditionsPage() {
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
              Terms & Conditions
            </li>
          </ol>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E4DA] shadow-xs mb-10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#C2410C]/5 rounded-full pointer-events-none blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] text-[#C2410C] text-xs font-bold uppercase tracking-wider mb-4 border border-[#FFEDD5]">
              <i className="fa-solid fa-scale-balanced text-xs" />
              <span>Legal Guidelines</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#140D1F] mb-3">
              Terms & Conditions
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Welcome to Miracle Feng Shui. By accessing our platform, purchasing our sacred handcrafted artifacts, or engaging with our artisan network, you accept and agree to abide by the following terms.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>
                <strong>Effective Date:</strong> {lastUpdated}
              </span>
              <span>&bull;</span>
              <span>Global Artisan Agreement</span>
            </div>
          </div>
        </div>

        {/* Terms Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E4DA] shadow-xs space-y-10 text-[15px] leading-relaxed text-gray-700">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                1
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                General Agreement & Eligibility
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              These terms govern all visits, orders, and interactions across miraclefengshui.com and its affiliated channels. By placing an order, you warrant that you are at least 18 years of age or possess legal parental consent, and that all information supplied during checkout is truthful, accurate, and up to date.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                2
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Natural Materials & Artisan Variations
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Miracle Feng Shui honors authentic artisan heritage. Most of our pieces—including citrine crystals, black obsidian, natural jade, sandalwood beads, and cast bronze—are hand-carved and naturally formed:
            </p>
            <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200/80 space-y-2 text-sm text-gray-600">
              <p>
                &bull; <strong>Natural Inclusions:</strong> Natural gemstones possess authentic mineral veins, slight color gradations, and organic inclusions. These are not flaws; they verify genuine natural extraction.
              </p>
              <p>
                &bull; <strong>Handmade Uniqueness:</strong> Because our master carvers craft each piece by hand, slight size variations (1-3mm) or bead string tensions are typical and celebrate human craftsmanship.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                3
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Spiritual Heritage & Purpose Disclaimer
              </h2>
            </div>
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200/60 text-sm text-purple-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#3A1F62]">
                <i className="fa-solid fa-circle-info" />
                Cultural & Mindfulness Purpose
              </div>
              <p>
                Our Feng Shui talismans, Pixiu bracelets, singing bowls, and sacred trees are inspired by centuries-old Eastern philosophy, cultural aesthetics, and spiritual traditions intended to inspire mindfulness, serenity, and harmony.
              </p>
              <p className="text-xs text-purple-800">
                They are not intended as substitutes for professional financial, legal, psychiatric, or medical diagnosis or therapy. Individual energetic resonance and subjective experiences will naturally vary.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                4
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Pricing, Currency & Order Acceptance
              </h2>
            </div>
            <ul className="list-disc pl-6 space-y-1.5 text-sm text-gray-600">
              <li>All displayed prices are in Indian Rupees (₹ INR) inclusive of applicable taxes, unless indicated otherwise.</li>
              <li>We reserve the right to cancel or refuse any order due to pricing typographical errors, stock unavailability, or suspected fraudulent activity. In such events, immediate full refunds are credited back to the original payment source.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                5
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Shipping, Consecration Time & Delivery
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Because consecrated items undergo ritual cleansing prior to dispatch, handling times generally range between <strong>1 to 2 business days</strong>. Standard transit times:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200">
                <p className="font-bold text-gray-900">Domestic Deliveries (India)</p>
                <p className="text-xs text-gray-500 mt-1">3 – 6 business days via air express carriers with live SMS tracking.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-gray-200">
                <p className="font-bold text-gray-900">International Orders</p>
                <p className="text-xs text-gray-500 mt-1">7 – 14 business days. Customs duties, if levied by local destination laws, are the recipient&apos;s responsibility.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                6
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Damaged Items & 7-Day Guarantee
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              If an item arrives damaged or broken during transit, notify our concierge within <strong>7 days of delivery</strong> with unboxing photographs or video proof. We will promptly dispatch an energized replacement free of charge or issue a full refund.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-t border-gray-100 pt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#FFEDD5]">
                7
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Governing Law & Legal Inquiries
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. For questions or formal notices:
            </p>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm">Legal & Compliance Department</p>
                <p className="text-xs text-gray-500 mt-0.5">Email: legal@miraclefengshui.com &bull; Miracle Feng Shui, Inc.</p>
              </div>
              <Link
                href="/shop"
                className="px-5 py-2.5 rounded-full bg-[#3A1F62] text-white hover:bg-[#2B154C] text-xs font-bold transition-all shadow-xs shrink-0"
              >
                Browse Sanctuary
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
