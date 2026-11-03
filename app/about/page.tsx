'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FaqSlide {
  question: string;
  answer: string;
  linkText?: string;
  linkHref?: string;
}

const faqSlides: FaqSlide[] = [
  {
    question: 'How do I know my crystals & talismans are 100% authentic?',
    answer:
      'Every gemstone, obsidian carving, and jade talisman in our collection is strictly certified natural and unheated. We work directly with hereditary artisan families in Yunnan, Tibet, and Southeast Asia. Each talisman arrives with our Certificate of Authenticity and mineral origin guarantee.',
    linkText: 'Learn about our natural minerals',
    linkHref: '/shop',
  },
  {
    question: 'What makes the sacred consecration blessing unique?',
    answer:
      'Unlike mass-produced commercial decor, each Miracle Feng Shui piece is cleansed with pure mountain sage and consecrated through traditional sound resonance using high-frequency Tibetan singing bowls before leaving our sanctuary. This awakens the dormant Chi of the crystal.',
    linkText: 'Explore consecrated talismans',
    linkHref: '/shop?category=Feng%20Shui%20Jewelry',
  },
  {
    question: 'Where should I place the Pixiu or Citrine Tree in my home?',
    answer:
      'According to classical Eight Mansions Feng Shui, the Citrine Money Tree flourishes best in the South-East (Wealth Sector) or beside your cash desk/home office. For Pixiu, keep its head facing toward your primary entrance or window to attract auspicious abundance.',
    linkText: 'View wealth placement guide',
    linkHref: '/shop?category=Crystals%20%26%20Trees',
  },
  {
    question: 'Can I wear multiple Feng Shui bracelets simultaneously?',
    answer:
      'Yes, complementary energies amplify each other. For example, wearing a Black Obsidian Wealth Bracelet on your receptive (left) wrist pairs harmoniously with a Rose Quartz or Tiger Eye bracelet to balance spiritual protection with prosperity.',
    linkText: 'Discover bracelet pairings',
    linkHref: '/shop?category=Feng%20Shui%20Jewelry',
  },
  {
    question: 'What is your ethical artisan sourcing commitment?',
    answer:
      'We practice fair-trade artisan compensation, zero plastic sustainable packaging, and support master carver guilds whose craft spans generations. By choosing handcrafted artifacts, you keep human devotion and cultural heritage alive.',
    linkText: 'Support our artisan families',
    linkHref: '/shop',
  },
];

export default function AboutPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [currentFaqIndex, setCurrentFaqIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeSubnav, setActiveSubnav] = useState('about');

  // Step Refs for sticky scroll detection in the dark section
  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Scroll listener to update sticky animation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 1024;
      const offset = window.innerHeight * (isMobile ? 0.65 : 0.45);
      const getTop = (el: HTMLElement | null) =>
        el ? el.getBoundingClientRect().top : Infinity;

      const top1 = getTop(step1Ref.current);
      const top2 = getTop(step2Ref.current);
      const top3 = getTop(step3Ref.current);

      if (top3 <= offset) {
        setActiveStep(2); // Shop securely
      } else if (top2 <= offset) {
        setActiveStep(1); // Buy extraordinary
      } else if (top1 <= offset) {
        setActiveStep(0); // Sell/Craft extraordinarily
      } else {
        setActiveStep(0); // Intro
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-cycle FAQ every 8s if user hasn't clicked
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFaqIndex((prev) => (prev + 1) % faqSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevFaq = () => {
    setCurrentFaqIndex((prev) => (prev === 0 ? faqSlides.length - 1 : prev - 1));
  };

  const handleNextFaq = () => {
    setCurrentFaqIndex((prev) => (prev + 1) % faqSlides.length);
  };

  const scrollToStep = (index: number) => {
    const targets = [step1Ref, step2Ref, step3Ref];
    const target = targets[index]?.current;
    if (target) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = scrollTop + rect.top - 280;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      {/* Sticky Secondary Subnav (Clean navigation row without duplicate logo/name) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E4DA] transition-all duration-200">
        <div className="etsy-container flex items-center justify-between h-13">
          <nav className="flex items-center gap-1.5 sm:gap-4 text-[13px] font-semibold text-gray-600 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => {
                setActiveSubnav('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeSubnav === 'about'
                  ? 'bg-[#F3EEFC] text-[#3A1F62] font-bold'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubnav('how-it-works');
                document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeSubnav === 'how-it-works'
                  ? 'bg-[#F3EEFC] text-[#3A1F62] font-bold'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubnav('artisans');
                document.getElementById('artisan-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeSubnav === 'artisans'
                  ? 'bg-[#F3EEFC] text-[#3A1F62] font-bold'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Artisans & Lineage
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubnav('faq');
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeSubnav === 'faq'
                  ? 'bg-[#F3EEFC] text-[#3A1F62] font-bold'
                  : 'hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              Curious Minds
            </button>
          </nav>

          <Link
            href="/shop"
            style={{ color: '#FFFFFF' }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#3A1F62] hover:bg-[#2B154C] !text-white text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <span>Explore Collection</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>
      </div>


      {/* SECTION 1: HERO STATEMENT SLIDE (Custom Miracle Feng Shui Master Craftsmanship Imagery) */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-[#E8E4DA] bg-white">
        <div className="etsy-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Authentic Handcrafted Artisan Visual Frame */}
            <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-[440px] aspect-[4/4.2] rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-black/10 group">
                <img
                  src="/images/artisan_carving_jade.jpg"
                  alt="Master Artisan Carving Authentic Feng Shui Jade"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating Authentic Consecration Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-amber-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#140D1F]">
                    Authentic Hand-Carved Jade
                  </span>
                </div>

                {/* Bottom Gradient Overprint with Artisan Quote */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                  <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <i className="fa-solid fa-certificate text-[10px]" />
                    Generational Mastery
                  </p>
                  <p className="text-sm font-serif italic text-gray-100">
                    &ldquo;Every gemstone carries its own breath. We only reveal the energy that nature placed inside.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Statement Content & Interactive Links (Crisp High-Contrast Text) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <h1
                style={{ color: '#140D1F' }}
                className="text-[28px] sm:text-[36px] lg:text-[42px] font-serif font-normal tracking-tight leading-[1.18] mb-5"
              >
                Keep Spiritual Living <br className="hidden sm:inline" />
                <span className="text-[#3A1F62] font-semibold">Authentic & Sacred</span>
              </h1>

              <div
                style={{ color: '#222222' }}
                className="space-y-5 text-[15px] sm:text-[17px] leading-relaxed font-normal"
              >
                <p>
                  Miracle Feng Shui is the global marketplace for unique and authentic sacred goods. It&apos;s home to a{' '}
                  <button
                    type="button"
                    onClick={() => setActivePanel('items')}
                    className="text-[#3A1F62] font-bold underline decoration-[#3A1F62]/40 hover:decoration-[#3A1F62] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>universe of special, extraordinary items</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" />
                  </button>
                  , from unheated natural crystals to consecrated obsidian talismans.
                </p>

                <p>
                  In a time of increasing automation and synthetic plastics, it&apos;s our mission to keep human connection and ancestral wisdom at the heart of commerce. That&apos;s why we built a sanctuary where creativity lives and thrives because it&apos;s powered by master craftspeople. We help our{' '}
                  <button
                    type="button"
                    onClick={() => setActivePanel('artisans')}
                    className="text-[#3A1F62] font-bold underline decoration-[#3A1F62]/40 hover:decoration-[#3A1F62] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>community of sellers & carvers</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" />
                  </button>{' '}
                  turn their generational devotion into thriving livelihoods. Our platform connects them with{' '}
                  <button
                    type="button"
                    onClick={() => setActivePanel('homes')}
                    className="text-[#3A1F62] font-bold underline decoration-[#3A1F62]/40 hover:decoration-[#3A1F62] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>millions of buyers</span>
                  </button>{' '}
                  looking for an authentic alternative – something special with a human touch, for those moments in life that deserve imagination and peace.
                </p>

                <p>
                  As a company, we strive to lead with{' '}
                  <button
                    type="button"
                    onClick={() => setActivePanel('values')}
                    className="text-[#3A1F62] font-bold underline decoration-[#3A1F62]/40 hover:decoration-[#3A1F62] transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>our guiding principles</span>
                    <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" />
                  </button>{' '}
                  and to help spread ideas of sustainability and spiritual responsibility whose impact reaches far beyond our own business.
                </p>
              </div>

              {/* Action Buttons (One Row on both Mobile & Desktop) */}
              <div className="mt-6 sm:mt-8 flex flex-row flex-nowrap items-center gap-2.5 sm:gap-4 w-full max-w-md">
                <Link
                  href="/shop"
                  style={{ color: '#FFFFFF' }}
                  className="flex-1 min-w-0 text-center py-3 px-2 sm:px-6 rounded-full bg-[#3A1F62] hover:bg-[#2B154C] !text-white text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span style={{ color: '#FFFFFF' }}>Explore Sanctum</span>
                  <i className="fa-solid fa-arrow-right text-[10px] sm:text-xs" style={{ color: '#FFFFFF' }} />
                </Link>
                <button
                  type="button"
                  onClick={() => setActivePanel('values')}
                  style={{ color: '#FFFFFF' }}
                  className="flex-1 min-w-0 text-center py-3 px-2 sm:px-6 rounded-full bg-[#140D1F] hover:bg-black !text-white text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-xs whitespace-nowrap flex items-center justify-center"
                >
                  <span style={{ color: '#FFFFFF' }}>Guiding Principles</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE SLIDE-OVER DRAWER */}
        {activePanel && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
            <div
              className="w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto p-6 sm:p-10 flex flex-col justify-between border-l border-gray-200 animate-in slide-in-from-right duration-300"
              role="dialog"
              aria-modal="true"
            >
              <div>
                {/* Close Button */}
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#3A1F62]">
                    Deep Dive
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePanel(null)}
                    aria-label="Close panel"
                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-xmark text-base" />
                  </button>
                </div>

                {/* Panel Content Based on Selected Tab */}
                {activePanel === 'items' && (
                  <div className="mt-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center text-2xl mb-6 shadow-inner">
                      <i className="fa-solid fa-gem" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Our Living Archive
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#140D1F] mt-1 mb-4">
                      120,000+ Sacred Artifacts
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                      Miracle Feng Shui celebrates the transformative power of authentic earthly elements. It is the one sanctuary where you can discover certified A-Grade Burmese jade pendants, 7 Chakra Gemstone trees, hand-hammered 7-metal singing bowls, and tailor-blessed Pixiu wealth rings.
                    </p>
                    <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E4DA] space-y-3 text-xs text-gray-700">
                      <div className="flex items-center gap-2 font-bold text-[#3A1F62]">
                        <i className="fa-solid fa-check-circle" />
                        Zero Synthetic Resin or Imitation Glass
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[#3A1F62]">
                        <i className="fa-solid fa-check-circle" />
                        Ethically Mined Crystals with Natural Inclusions
                      </div>
                      <div className="flex items-center gap-2 font-bold text-[#3A1F62]">
                        <i className="fa-solid fa-check-circle" />
                        Individually Inspected by Senior Gemologists
                      </div>
                    </div>
                  </div>
                )}

                {activePanel === 'artisans' && (
                  <div className="mt-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center text-2xl mb-6 shadow-inner">
                      <i className="fa-solid fa-hands" />
                    </div>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Generational Lineage
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#140D1F] mt-1 mb-4">
                      150+ Hereditary Master Carvers
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                      Every single day, master artisans pour ancestral knowledge, devotion, and stillness into every stroke of the carving chisel. Rather than automated factories, our artisan workshops sustain families, preserve historic carving methods, and safeguard the spiritual soul of each mineral.
                    </p>
                    <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] space-y-2 text-xs text-amber-900">
                      <p className="font-bold flex items-center gap-2">
                        <i className="fa-solid fa-heart" />
                        Fair-Trade & Cultural Sustainability
                      </p>
                      <p className="leading-relaxed">
                        We pay living wages well above standard market benchmarks and invest directly into artisan apprentice guilds.
                      </p>
                    </div>
                  </div>
                )}

                {activePanel === 'homes' && (
                  <div className="mt-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] text-emerald-700 flex items-center justify-center text-2xl mb-6 shadow-inner">
                      <i className="fa-solid fa-house-chimney-window" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                      Global Harmony
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#140D1F] mt-1 mb-4">
                      98,000+ Harmonized Sanctuaries
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                      Whether you are welcoming prosperity into a new home, cleansing heavy office energy, or seeking peaceful meditation in your living space, Miracle Feng Shui empowers you with exact directional placement manuals and personalized guidance.
                    </p>
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                      <div className="flex items-center justify-between font-bold text-gray-900 mb-1">
                        <span>Verified Patron Rating</span>
                        <span className="text-amber-600">4.98 / 5.0 ★</span>
                      </div>
                      <p className="text-gray-500">Based on over 24,000+ verified customer reviews worldwide.</p>
                    </div>
                  </div>
                )}

                {activePanel === 'values' && (
                  <div className="mt-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#F3EEFC] text-[#3A1F62] flex items-center justify-center text-2xl mb-6 shadow-inner">
                      <i className="fa-solid fa-scale-balanced" />
                    </div>
                    <span className="text-xs font-bold text-[#3A1F62] uppercase tracking-wide">
                      Ethical Foundations
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#140D1F] mt-1 mb-4">
                      Our 5 Guiding Principles
                    </h2>
                    <ul className="space-y-4 text-sm text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#3A1F62] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <strong className="block text-gray-900">We Commit to Pure Intention:</strong>
                          Never sell plastic or false representations of natural earth crystals.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#3A1F62] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <strong className="block text-gray-900">We Honor Master Lineage:</strong>
                          Champion human craftsmanship over automated assembly lines.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#3A1F62] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <strong className="block text-gray-900">We Minimize Earth Waste:</strong>
                          Utilize plastic-free cardboard packaging, hemp cordage, and reusable silk pouches.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#3A1F62] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          4
                        </span>
                        <div>
                          <strong className="block text-gray-900">We Consecrate with Care:</strong>
                          Cleanse and invoke high-frequency blessing sound waves before dispatch.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#3A1F62] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          5
                        </span>
                        <div>
                          <strong className="block text-gray-900">We Lead with Compassion:</strong>
                          Treat every patron as a sacred guest on their spiritual wellness journey.
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Panel Footer CTA */}
              <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  href="/shop"
                  onClick={() => setActivePanel(null)}
                  className="w-full py-3 rounded-full bg-[#3A1F62] text-white text-center font-bold text-xs hover:bg-[#2B154C] transition-colors"
                >
                  Browse Sacred Catalog
                </Link>
                <button
                  type="button"
                  onClick={() => setActivePanel(null)}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: HOW IT WORKS (Guaranteed Pure White Text Visibility & Authentic Feng Shui Photography) */}
      <section
        id="how-it-works-section"
        style={{ backgroundColor: '#2F2E41', color: '#FFFFFF' }}
        className="relative py-16 sm:py-24"
      >
        <div className="etsy-container">
          {/* Section Intro */}
          <div ref={step0Ref} className="pt-4 sm:pt-8 mb-6 sm:mb-12 max-w-2xl">
            <h2
              style={{ color: '#FFFFFF' }}
              className="text-2xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight leading-[1.18] mb-4 !text-white"
            >
              How Miracle Feng Shui Works
            </h2>
            <p
              style={{ color: '#F1F5F9' }}
              className="text-sm sm:text-base md:text-lg leading-relaxed font-normal"
            >
              Our global marketplace is a vibrant community of authentic artisans connecting over sacred handcrafted goods. The platform empowers master carvers to preserve ancestral art and helps seekers discover genuine spiritual harmony.
            </p>
          </div>

          {/* Dual layout: Sticky on both Mobile & Desktop */}
          <div className="relative lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start">
            
            {/* Sticky 3-Circle Cluster (Sticky on BOTH Mobile & Desktop) */}
            <div className="sticky top-13 sm:top-14 lg:top-[20vh] z-30 lg:col-span-5 lg:order-2 py-3 sm:py-4 lg:py-0 flex flex-col items-center justify-center bg-[#2F2E41]/95 backdrop-blur-md lg:bg-transparent rounded-2xl lg:rounded-none border-b border-white/10 lg:border-b-0 shadow-lg lg:shadow-none mb-6 lg:mb-0">
              <div className="relative w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[390px] aspect-[4/3] sm:aspect-square flex items-center justify-center mx-auto">
                {/* Background Silhouette Disk */}
                <div className="absolute inset-1 sm:inset-2 rounded-full bg-[#242335] opacity-90 transition-transform duration-700 pointer-events-none" />

                {/* 3 Circular Badges in Triangular Composition with fluid sliding & scaling */}
                <div className="relative w-full h-full">
                  {/* Circle 1: TOP (Craft / Master Carved) */}
                  <div
                    onClick={() => scrollToStep(0)}
                    className={`absolute left-1/2 -translate-x-1/2 top-1 sm:top-3 w-24 h-24 sm:w-34 sm:h-34 lg:w-40 lg:h-40 rounded-full overflow-hidden transition-all duration-500 cursor-pointer shadow-xl ${
                      activeStep === 0
                        ? 'scale-110 sm:scale-115 ring-4 ring-amber-400 z-20 shadow-2xl brightness-105 -translate-y-1'
                        : 'scale-90 opacity-70 z-10 hover:opacity-100 hover:scale-95'
                    }`}
                  >
                    <img
                      src="/images/artisan_carving_jade.jpg"
                      alt="Artisan Carving Jade"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-center pb-1 sm:pb-2">
                      <span className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 drop-shadow-sm">
                        Master Carved
                      </span>
                    </div>
                  </div>

                  {/* Circle 2: BOTTOM LEFT (Bless / Consecrated) */}
                  <div
                    onClick={() => scrollToStep(1)}
                    className={`absolute left-1 sm:left-2 bottom-1 sm:bottom-3 w-24 h-24 sm:w-34 sm:h-34 lg:w-40 lg:h-40 rounded-full overflow-hidden transition-all duration-500 cursor-pointer shadow-xl ${
                      activeStep === 1
                        ? 'scale-110 sm:scale-115 ring-4 ring-purple-400 z-20 shadow-2xl brightness-105 -translate-y-1'
                        : 'scale-90 opacity-70 z-10 hover:opacity-100 hover:scale-95'
                    }`}
                  >
                    <img
                      src="/images/consecration_singing_bowl.jpg"
                      alt="Singing Bowl Consecration"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-center pb-1 sm:pb-2">
                      <span className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-200 drop-shadow-sm">
                        Consecrated
                      </span>
                    </div>
                  </div>

                  {/* Circle 3: BOTTOM RIGHT (Protect / Delivery) */}
                  <div
                    onClick={() => scrollToStep(2)}
                    className={`absolute right-1 sm:right-2 bottom-1 sm:bottom-3 w-24 h-24 sm:w-34 sm:h-34 lg:w-40 lg:h-40 rounded-full overflow-hidden transition-all duration-500 cursor-pointer shadow-xl ${
                      activeStep === 2
                        ? 'scale-110 sm:scale-115 ring-4 ring-emerald-400 z-20 shadow-2xl brightness-105 -translate-y-1'
                        : 'scale-90 opacity-70 z-10 hover:opacity-100 hover:scale-95'
                    }`}
                  >
                    <img
                      src="/images/sacred_talisman_delivery.jpg"
                      alt="Sacred Talisman Delivery"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-center pb-1 sm:pb-2">
                      <span className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-300 drop-shadow-sm">
                        Protected Delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Quick Step Indicator Pills with dynamic color match */}
              <div className="lg:hidden flex items-center justify-center gap-2 mt-2 pb-1 w-full">
                {[
                  { idx: 0, label: '01. Craft', activeColor: 'bg-amber-400 text-[#140D1F]' },
                  { idx: 1, label: '02. Bless', activeColor: 'bg-purple-300 text-[#140D1F]' },
                  { idx: 2, label: '03. Protect', activeColor: 'bg-emerald-400 text-[#140D1F]' },
                ].map((item) => (
                  <button
                    key={item.idx}
                    type="button"
                    onClick={() => scrollToStep(item.idx)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      activeStep === item.idx
                        ? `${item.activeColor} scale-105 shadow-md`
                        : 'bg-white/15 text-gray-200 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Left Column: Scrolling Content Blocks */}
            <div className="lg:col-span-7 lg:order-1 space-y-16 sm:space-y-28 lg:space-y-36 pt-4 lg:pt-0">
              
              {/* Step 1: Craft Extraordinarily */}
              <div ref={step1Ref} className="min-h-[35vh] sm:min-h-[45vh] flex flex-col justify-center">
                <h3
                  style={{ color: '#FFFFFF' }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-tight mb-3 !text-white"
                >
                  Sell extraordinarily
                </h3>
                <p
                  style={{ color: '#F1F5F9' }}
                  className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mb-5 font-normal"
                >
                  With low fees, powerful tools, and support and education, we help creative artisans and lapidaries start, manage, and scale their businesses. Want to become a Miracle Feng Shui artisan seller? All it takes is $0.20 to get started.
                </p>
                <div>
                  <Link
                    href="/shop"
                    style={{ color: '#FFFFFF' }}
                    className="inline-block px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white bg-white/10 hover:bg-white/20 !text-white text-xs sm:text-sm font-semibold transition-all shadow-xs whitespace-nowrap"
                  >
                    <span style={{ color: '#FFFFFF' }}>Become a seller</span>
                  </Link>
                </div>
              </div>

              {/* Step 2: Buy Extraordinary */}
              <div ref={step2Ref} className="min-h-[35vh] sm:min-h-[45vh] flex flex-col justify-center">
                <h3
                  style={{ color: '#FFFFFF' }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-tight mb-3 !text-white"
                >
                  Buy extraordinary
                </h3>
                <p
                  style={{ color: '#F1F5F9' }}
                  className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mb-5 font-normal"
                >
                  From natural unheated crystals to personalized zodiac talismans, our curation helps seekers explore genuine one-of-a-kind artifacts. Our Journal and Curated Selections showcase auspicious blessings discovered in the marketplace by our master practitioners.
                </p>
                <div>
                  <Link
                    href="/shop"
                    style={{ color: '#FFFFFF' }}
                    className="inline-block px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border border-white bg-white/10 hover:bg-white/20 !text-white text-xs sm:text-sm font-semibold transition-all shadow-xs whitespace-nowrap"
                  >
                    <span style={{ color: '#FFFFFF' }}>Start shopping</span>
                  </Link>
                </div>
              </div>

              {/* Step 3: Shop Securely */}
              <div ref={step3Ref} className="min-h-[35vh] sm:min-h-[45vh] pb-8 sm:pb-12 flex flex-col justify-center">
                <h3
                  style={{ color: '#FFFFFF' }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-tight mb-3 !text-white"
                >
                  Shop securely
                </h3>
                <p
                  style={{ color: '#F1F5F9' }}
                  className="text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal"
                >
                  We provide the technology behind the Miracle Feng Shui marketplace, ensuring certified mineral authenticity, encrypted transactions, and insured delivery. Keeping your sacred sanctuary protected and joyful is our priority, and we&apos;re always{' '}
                  <Link
                    href="/privacy-policy"
                    style={{ color: '#FDE047' }}
                    className="underline hover:brightness-110 transition-colors font-semibold"
                  >
                    here to help
                  </Link>
                  .
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: ARTISAN SHOWCASE & IMPACT STATS */}
      <section id="artisan-section" className="py-20 sm:py-28 bg-[#FAF9F6] border-b border-[#E8E4DA]">
        <div className="etsy-container">
          {/* Numbers Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 sm:p-12 rounded-3xl bg-white border border-[#E8E4DA] shadow-xs mb-16 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#3A1F62]">120K+</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Sacred Talismans Delivered</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#C2410C]">150+</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Hereditary Master Artisans</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-emerald-700">100%</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Natural Certified Minerals</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-600">4.98★</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Global Patron Trust Rating</p>
            </div>
          </div>

          {/* Artisan Story Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3A1F62]">
                Behind the Chisel & Silk
              </span>
              <h2
                style={{ color: '#140D1F' }}
                className="text-3xl sm:text-4xl font-serif font-bold tracking-tight leading-tight"
              >
                Generations of Mastery, <br />
                Crafted for Your Modern Sanctuary.
              </h2>
              <p className="text-base text-gray-700 leading-relaxed">
                In an era dominated by high-speed factories, the ancient methods of lapidary stone-cutting, lost-wax bronze casting, and sacred knotting require patience, meditation, and pure intention.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Our master carver families have dedicated their lives to understanding the unique cleavage planes of jadeite, the cooling crystalline structures of natural citrine quartz, and the resonant metallurgy of seven-metal singing bowls.
              </p>

              <div className="pt-2">
                <blockquote className="border-l-4 border-[#3A1F62] pl-4 py-1 text-sm italic text-gray-800 font-serif">
                  &ldquo;A stone is not merely carved; it is awakened. When you hold a talisman crafted with reverence, you hold the calm of the mountain itself.&rdquo;
                </blockquote>
                <p className="text-xs font-bold text-[#3A1F62] mt-2 pl-4">
                  — Master Chen, 4th Generation Jade Carver
                </p>
              </div>

              <div className="pt-4">
                <Link
                  href="/shop"
                  style={{ color: '#FFFFFF' }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#140D1F] hover:bg-black !text-white text-xs font-bold transition-all shadow-sm w-full sm:w-auto"
                >
                  <span style={{ color: '#FFFFFF' }}>Support Artisan Craftsmanship</span>
                  <i className="fa-solid fa-arrow-right text-[10px]" style={{ color: '#FFFFFF' }} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl bg-white border border-[#E8E4DA] p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#3A1F62] flex items-center justify-center text-lg mb-3">
                    <i className="fa-solid fa-seedling" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Sustainable Harvesting</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Zero dynamite blasting or destructive strip-mining. We preserve ecological balance.
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-[#E8E4DA] p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg mb-3">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Guaranteed Authenticity</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Rigorous mineralogical laboratory inspection card accompanies every single parcel.
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:mt-6">
                <div className="rounded-2xl bg-white border border-[#E8E4DA] p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg mb-3">
                    <i className="fa-solid fa-hand-holding-dollar" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Living Wage Direct</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Fair, transparent compensation directly empowers hereditary artisan lineages.
                  </p>
                </div>
                <div className="rounded-2xl bg-white border border-[#E8E4DA] p-5 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#C2410C] flex items-center justify-center text-lg mb-3">
                    <i className="fa-solid fa-box-open" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Eco-Conscious Packaging</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Delivered in reusable raw silk pouches and biodegradable paper materials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CURIOUS MINDS CAROUSEL */}
      <section id="faq-section" className="py-20 sm:py-28 bg-white border-b border-[#E8E4DA]">
        <div className="etsy-container max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3A1F62] block mb-2">
                Wisdom & Inquiries
              </span>
              <h2
                style={{ color: '#140D1F' }}
                className="text-3xl sm:text-4xl font-serif font-bold"
              >
                Curious Minds Want to Know
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevFaq}
                aria-label="Previous question"
                className="w-11 h-11 rounded-full border border-gray-300 hover:border-[#3A1F62] hover:bg-[#F3EEFC] text-gray-700 hover:text-[#3A1F62] flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-chevron-left text-sm" />
              </button>
              <button
                type="button"
                onClick={handleNextFaq}
                aria-label="Next question"
                className="w-11 h-11 rounded-full border border-gray-300 hover:border-[#3A1F62] hover:bg-[#F3EEFC] text-gray-700 hover:text-[#3A1F62] flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <i className="fa-solid fa-chevron-right text-sm" />
              </button>
            </div>
          </div>

          {/* Active Carousel Card */}
          <div className="bg-[#FAF9F6] border border-[#E8E4DA] rounded-3xl p-8 sm:p-12 transition-all duration-300 relative overflow-hidden min-h-[260px] flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#F3EEFC] text-[#3A1F62] text-xs font-bold">
                  Question {currentFaqIndex + 1} of {faqSlides.length}
                </span>
              </div>
              <h3
                style={{ color: '#140D1F' }}
                className="text-xl sm:text-2xl font-serif font-bold mb-4"
              >
                {faqSlides[currentFaqIndex].question}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                {faqSlides[currentFaqIndex].answer}
              </p>
            </div>

            {faqSlides[currentFaqIndex].linkText && (
              <div className="mt-6 pt-6 border-t border-gray-200/80 flex items-center justify-between">
                <Link
                  href={faqSlides[currentFaqIndex].linkHref || '/shop'}
                  className="text-xs sm:text-sm font-bold text-[#3A1F62] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>{faqSlides[currentFaqIndex].linkText}</span>
                  <i className="fa-solid fa-arrow-right text-[10px]" />
                </Link>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5">
                  {faqSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentFaqIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentFaqIndex === i ? 'w-6 bg-[#3A1F62]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CALL TO ACTION BANNER */}
      <section className="py-20 bg-gradient-to-r from-[#3A1F62] to-[#20103A] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="etsy-container relative z-10 max-w-2xl mx-auto">
          {/* Original Brand Logo Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300/60 shadow-xl mx-auto mb-6">
            <img
              src="/images/miracle.jpeg"
              alt="Miracle feng shui"
              className="w-full h-full object-cover scale-105"
            />
          </div>
          <h2
            style={{ color: '#FFFFFF' }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4 !text-white"
          >
            Invite Harmony & Abundance Into Your Life.
          </h2>
          <p
            style={{ color: '#E2E8F0' }}
            className="text-sm sm:text-base mb-8 leading-relaxed font-light"
          >
            Every home deserves serenity, prosperity, and authentic energetic balance. Experience the genuine difference of consecrated, artisan-carved talismans.
          </p>
          <div className="flex flex-row flex-nowrap items-center justify-center gap-2.5 sm:gap-4 w-full max-w-md mx-auto px-2">
            <Link
              href="/shop"
              style={{ color: '#FFFFFF' }}
              className="flex-1 min-w-0 text-center py-3 px-2.5 sm:px-6 rounded-full bg-[#E05A47] hover:bg-[#C2410C] !text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap flex items-center justify-center"
            >
              <span style={{ color: '#FFFFFF' }}>Start Exploring</span>
            </Link>
            <Link
              href="/shop?category=Feng%20Shui%20Decor"
              style={{ color: '#FFFFFF' }}
              className="flex-1 min-w-0 text-center py-3 px-2.5 sm:px-6 rounded-full bg-white/15 hover:bg-white/25 !text-white font-bold text-xs sm:text-sm border border-white/30 transition-all active:scale-95 whitespace-nowrap flex items-center justify-center"
            >
              <span style={{ color: '#FFFFFF' }}>Browse Blessed Gifts</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
