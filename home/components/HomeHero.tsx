'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore, defaultSections, type HomeSectionConfig } from '@/context/StoreContext';
import { useLocale } from '@/context/CurrencyContext';

/** The homepage's opening banner: a headline with its call to action, rotating photos and a side card. */
export default function HomeHero() {
  const { language, t } = useLocale();
  const { sections, heroBanner } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto rotate banner image every 5 seconds with smooth crossfade
  useEffect(() => {
    const slideCount = heroBanner?.slides?.length || 1;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanner?.slides?.length]);

  // 1. HERO SECTION
  const renderHero = (section: HomeSectionConfig) => {
    const slides =
      heroBanner?.slides && heroBanner.slides.length > 0
        ? heroBanner.slides
        : [
            {
              id: 'slide-1',
              image: '/images/feng_shui_hero_banner.jpg',
              alt: 'Feng Shui Prosperity Bonsai Tree & Brass Dragon Turtle',
            },
          ];
    const rightCard = heroBanner?.rightCard || {
      badge: 'Harmonious Living',
      title: 'Sacred Feng Shui Finds',
      subtitle: 'Explore energy decor',
      link: '/shop?category=Feng%20Shui%20Decor',
      image: '/images/feng_shui_sacred_finds.jpg',
    };

    return (
      <section key="hero" className="etsy-container py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Card: Feng Shui Harmony & Prosperity Banner */}
          <div className="lg:col-span-7 xl:col-span-8 bg-[#2A1D38] text-white rounded-[18px] sm:rounded-[22px] overflow-hidden shadow-xs flex flex-row items-stretch justify-between relative min-h-[220px] sm:min-h-[280px] md:h-[375px]">
            {/* Left Content */}
            <div className="p-4 sm:p-7 md:p-10 w-[58%] sm:w-[60%] md:w-[62%] flex flex-col items-start text-left z-20 justify-center h-full">
              <h1
                style={{ color: '#ffffff', marginBottom: '24px' }}
                className="text-[17px] xs:text-[20px] sm:text-[28px] md:text-[36px] lg:text-[40px] font-serif font-normal text-white leading-[1.18] tracking-tight"
              >
                {language === 'ar' ? t('home.hero_title') : (heroBanner?.title || section.title)}
              </h1>
              <Link
                href={heroBanner?.ctaLink || section.ctaLink || '/shop?q=feng+shui'}
                style={{ backgroundColor: '#ffffff', color: '#222222' }}
                className="bg-white hover:bg-gray-100 text-[#222222] font-bold text-[12px] sm:text-[14px] md:text-[15px] px-4 sm:px-7 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full shadow-sm transition-transform hover:scale-102 active:scale-98 inline-block no-underline shrink-0"
              >
                {language === 'ar' ? t('home.hero_cta') : (heroBanner?.ctaText || section.ctaText || 'Shop Feng Shui')}
              </Link>
            </div>

            {/* Right Artwork / Auto-rotating Images */}
            <div className="w-[42%] sm:w-[40%] md:w-[38%] h-full relative overflow-hidden self-stretch bg-[#1E132A] flex items-center justify-center">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 w-full h-full flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
                    activeSlide % slides.length === idx
                      ? 'opacity-100 z-10'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.alt || 'Feng Shui Hero Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/feng_shui_hero_banner.jpg';
                    }}
                  />
                </div>
              ))}

              {/* Slide Indicators */}
              {slides.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                        activeSlide % slides.length === idx
                          ? 'w-3 sm:w-4 bg-white'
                          : 'w-1 sm:w-1.5 bg-white/60 hover:bg-white/90'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Card: Sacred Space & Local Energy Shops */}
          <Link
            href={rightCard.link || '/shop?category=Feng%20Shui%20Decor'}
            className="hidden lg:flex lg:col-span-5 xl:col-span-4 group relative bg-[#2A1D38] rounded-[18px] sm:rounded-[22px] overflow-hidden shadow-xs flex-col justify-end p-8 sm:p-10 min-h-[320px] md:h-[375px] hover:shadow-md transition-all border border-[#3D2952] no-underline"
          >
            <div className="absolute inset-0 opacity-70">
              <img
                src={rightCard.image || '/images/feng_shui_sacred_finds.jpg'}
                alt={rightCard.title || 'Sacred Golden Feng Shui Abundance'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/feng_shui_sacred_finds.jpg';
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E26]/95 via-[#1A0E26]/40 to-transparent" />
            <div className="relative z-10 text-white">
              <span className="text-[12px] uppercase tracking-widest text-[#E9D5FF] font-semibold mb-1 block">
                {language === 'ar' ? t('home.hero_badge') : (rightCard.badge || 'Harmonious Living')}
              </span>
              <h2
                style={{ color: '#ffffff' }}
                className="text-[26px] sm:text-[30px] font-bold text-white leading-tight"
              >
                {language === 'ar' ? t('home.sacred_finds') : (rightCard.title || 'Sacred Feng Shui Finds')}
              </h2>
              <p
                style={{ color: '#ffffff' }}
                className="text-[15px] text-white font-medium mt-1.5 group-hover:opacity-90 flex items-center gap-1.5 no-underline"
              >
                <span>{language === 'ar' ? t('home.explore_energy') : (rightCard.subtitle || 'Explore energy decor')}</span>
                <i className="fa-solid fa-arrow-right text-[13px]" />
              </p>
            </div>
          </Link>
        </div>
      </section>
    );
  };

  const section = sections.find((s) => s.id === 'hero') ?? defaultSections[0];
  return renderHero(section);
}
