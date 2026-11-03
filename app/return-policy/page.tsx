import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cancellation & Return Policy | Miracle Feng Shui',
  description:
    'Read our Cancellation, Return, and Refund Policy for consecrated Feng Shui cures, sacred talismans, and crystals at Miracle Feng Shui.',
};

export default function ReturnPolicyPage() {
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
              Cancellation &amp; Return Policy
            </li>
          </ol>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E4DA] shadow-xs mb-10 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#3A1F62]/5 rounded-full pointer-events-none blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3EEFC] text-[#3A1F62] text-xs font-bold uppercase tracking-wider mb-4">
              <i className="fa-solid fa-scale-balanced text-xs" />
              <span>Sacred Living Policy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#140D1F] mb-3">
              Cancellation, Return &amp; Refund Policy
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              At Miracle Feng Shui, every item is carefully curated, energy-cleansed, and consecrated for personal spiritual harmony. Please review our strict policy regarding cancellations, returns, refunds, and damaged transit replacements.
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>
                <strong>Effective Date:</strong> {lastUpdated}
              </span>
              <span>&bull;</span>
              <span>Global Artisan Agreement</span>
              <span>&bull;</span>
              <span className="text-rose-700 font-medium flex items-center gap-1">
                <i className="fa-solid fa-ban text-[11px]" />
                Zero Cancellation &bull; Final Sale
              </span>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E4DA] shadow-xs space-y-10 text-[15px] leading-relaxed text-gray-700">
          
          {/* Important Notice Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 text-[#B45309] flex items-center justify-center text-base shrink-0 mt-0.5">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                Strict Final Sale Policy: No Cancellations, No Returns, No Refunds
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Due to the sacred spiritual nature of our Taoist-blessed talismans, energized cures, natural healing crystals, and sacred jewelry, <strong>we do not accept cancellations, returns, or issue monetary refunds once an order is placed</strong>. Please review all details prior to checkout.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                1
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Spiritual Consecration &amp; Energetic Purity
              </h2>
            </div>
            <p className="mb-3 text-sm text-gray-600">
              Every talisman, Pixiu bracelet, singing bowl, and Bagua cure undergoes a dedicated consecration (Kaiguang) and purification ceremony before dispatch. When an item enters a customer&apos;s personal space, it bonds directly with their specific vibrational frequency and Chi.
            </p>
            <p className="text-sm text-gray-600">
              To preserve authentic spiritual potency and prevent energy contamination, we never restock or re-bless returned artifacts for another seeker. Consequently, all items are strictly non-returnable and non-refundable.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                2
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Zero Cancellation Policy
              </h2>
            </div>
            <p className="mb-3 text-sm text-gray-600">
              Upon order placement, ceremonial masters and artisan craftsmen immediately commence the purification, dedication, and customized packaging rituals for your sacred items.
            </p>
            <p className="text-sm text-gray-600">
              Because sacred materials and artisan labor are irreversibly allocated as soon as an order is entered into our system, <strong>we do not accept order cancellations under any circumstances</strong>. Please verify product selections, sizes, and shipping addresses before completing your purchase.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                3
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Physical Transit Damage (Free Replacement Only)
              </h2>
            </div>
            <p className="mb-3 text-sm text-gray-600">
              While monetary refunds and returns are not permitted, we guarantee that every treasure arrives in pristine physical condition. In the rare event that your product arrives broken or damaged during courier transit:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
              <li>
                <strong>48-Hour Reporting Window:</strong> You must email our care team within <strong>48 hours</strong> of courier delivery.
              </li>
              <li>
                <strong>Evidence Required:</strong> Email clear photographs or an unboxing video displaying the outer carton, courier shipping label, and the damaged artifact to{' '}
                <a href="mailto:care.miraclefengshui@gmail.com" className="text-[#3A1F62] font-semibold underline">
                  care.miraclefengshui@gmail.com
                </a>.
              </li>
              <li>
                <strong>Free Replacement:</strong> Once verified by our logistics team, we will dispatch a <strong>brand-new identical replacement</strong> at zero extra charge. No monetary refund is provided.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                4
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Cash on Delivery (COD) Commitment
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              For Cash on Delivery orders, customers explicitly agree to receive the shipment and tender cash payment to the logistics partner upon delivery.
            </p>
            <p className="text-sm text-gray-600">
              Refusing an auspicious, consecrated package upon doorstep delivery harms artisan livelihoods and creates logistics overhead. Delivery refusals will result in permanent suspension from COD privileges across our marketplace.
            </p>
          </section>

          {/* Section 5: Contact Concierge */}
          <section className="border-t border-gray-100 pt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center font-bold text-sm shrink-0">
                5
              </div>
              <h2 className="text-xl font-bold font-serif text-[#140D1F]">
                Contact Customer Care Sanctuary
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              If you have inquiries regarding shipment tracking or require guidance regarding your consecrated items, our sanctuary team is at your service:
            </p>
            <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm">Miracle Feng Shui Care Sanctuary</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Email: care.miraclefengshui@gmail.com &bull; Support: 10:00 AM – 7:00 PM IST
                </p>
              </div>
              <Link
                href="/shop"
                className="px-5 py-2.5 rounded-full bg-[#3A1F62] text-white hover:bg-[#2B154C] text-xs font-bold transition-all shadow-xs shrink-0 no-underline"
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
