'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  useStore,
  HeroSlideItem,
  HeroRightCard,
  ProsperityHeroCard,
  SpecialGiftItem,
  GuideCardItem,
  BlogPostItem,
} from '@/context/StoreContext';
import ImageUploadField from '@/components/admin/ImageUploadField';


type ActiveTab =
  | 'hero'
  | 'prosperity'
  | 'special_gifts'
  | 'guide'
  | 'blog';

export default function AdminHomepageManager() {
  const {
    // Dynamic Homepage Data & Actions
    heroBanner,
    updateHeroBanner,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    prosperityCards,
    addProsperityCard,
    updateProsperityCard,
    deleteProsperityCard,
    specialGifts,
    addSpecialGift,
    updateSpecialGift,
    deleteSpecialGift,
    guideCards,
    addGuideCard,
    updateGuideCard,
    deleteGuideCard,
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    resetHomepageContent,
  } = useStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('hero');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Hero Banner State
  const [heroForm, setHeroForm] = useState({
    title: heroBanner?.title || '',
    ctaText: heroBanner?.ctaText || '',
    ctaLink: heroBanner?.ctaLink || '',
    rightBadge: heroBanner?.rightCard?.badge || '',
    rightTitle: heroBanner?.rightCard?.title || '',
    rightSubtitle: heroBanner?.rightCard?.subtitle || '',
    rightLink: heroBanner?.rightCard?.link || '',
    rightImage: heroBanner?.rightCard?.image || '',
  });

  // Modal states for CRUD
  const [slideModal, setSlideModal] = useState<{ isOpen: boolean; slide: Partial<HeroSlideItem> | null }>({
    isOpen: false,
    slide: null,
  });

  const [prosperityModal, setProsperityModal] = useState<{ isOpen: boolean; card: Partial<ProsperityHeroCard> | null }>({
    isOpen: false,
    card: null,
  });

  const [specialGiftModal, setSpecialGiftModal] = useState<{ isOpen: boolean; item: Partial<SpecialGiftItem> | null }>({
    isOpen: false,
    item: null,
  });

  const [guideModal, setGuideModal] = useState<{ isOpen: boolean; card: Partial<GuideCardItem> | null }>({
    isOpen: false,
    card: null,
  });

  const [blogModal, setBlogModal] = useState<{ isOpen: boolean; post: Partial<BlogPostItem> | null }>({
    isOpen: false,
    post: null,
  });

  // Save Hero Banner Texts
  const handleSaveHeroTexts = (e: React.FormEvent) => {
    e.preventDefault();
    updateHeroBanner({
      title: heroForm.title,
      ctaText: heroForm.ctaText,
      ctaLink: heroForm.ctaLink,
      rightCard: {
        badge: heroForm.rightBadge,
        title: heroForm.rightTitle,
        subtitle: heroForm.rightSubtitle,
        link: heroForm.rightLink,
        image: heroForm.rightImage,
      },
    });
    showToast('Hero Banner details updated successfully!');
  };

  return (
    <div
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      className="flex flex-col gap-6 pb-20"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-bottom-5">
          <i className="fa-solid fa-circle-check text-emerald-400 text-base" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Luxury Noir Salon-Style Hero Page Banner with Right-Side Fade Image */}
      <div className="rounded-3xl bg-[#161619] p-6 sm:p-8 text-white shadow-xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 min-h-[190px]">
        {/* Right-Side Photo with Seamless Noir Blend Gradient (matching reference screenshot) */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 lg:w-1/2 pointer-events-none overflow-hidden select-none">
          <img
            src="/images/feng_shui_hero_banner.jpg"
            alt="Miracle Sections Sanctuary"
            className="w-full h-full object-cover object-right brightness-[0.7] contrast-[1.08]"
          />
          {/* Seamless Left Fade Gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #161619 0%, #161619 12%, rgba(22, 22, 25, 0.85) 42%, rgba(22, 22, 25, 0.25) 75%, transparent 100%)',
            }}
          />
          {/* Subtle Top & Bottom Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(22, 22, 25, 0.35) 0%, transparent 25%, transparent 75%, rgba(22, 22, 25, 0.5) 100%)',
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Date Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90 text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold mb-2.5 shadow-2xs backdrop-blur-xs">
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1
            style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-tight"
          >
            Homepage Content Editor
          </h1>
          <p
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl font-normal leading-relaxed"
          >
            Add, edit, and orchestrate slides, showcase banners, and sacred cards across all homepage sections.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (confirm('Reset all homepage images, slides, and cards to original defaults?')) {
                resetHomepageContent();
                showToast('All homepage content reset to original defaults.');
              }
            }}
            className="px-4 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-rose-950/40 rounded-full border border-white/15 transition-all cursor-pointer shadow-2xs"
          >
            <i className="fa-solid fa-rotate-left mr-1.5" />
            Reset Defaults
          </button>
          <Link
            href="/"
            target="_blank"
            style={{ backgroundColor: '#FFFFFF', color: '#111111' }}
            className="text-black text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gray-100 transition-all shadow-md no-underline inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-black" />
            <span>View Live Store</span>
          </Link>
        </div>
      </div>

      {/* SECTION TABS - Wink Pill Aesthetic */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar">
        {[
          { id: 'hero', label: '1. Home Banner & Slides', icon: 'fa-star' },
          { id: 'prosperity', label: '2. Prosperity Gifts', icon: 'fa-gift' },
          { id: 'special_gifts', label: '3. Gifts As Special As They Are', icon: 'fa-hand-holding-heart' },
          { id: 'guide', label: '4. Curated Style & Chi Guide', icon: 'fa-compass' },
          { id: 'blog', label: '5. Blog & Sacred Knowledge', icon: 'fa-book-open' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            style={
              activeTab === tab.id
                ? { backgroundColor: '#111111', color: '#ffffff' }
                : { backgroundColor: '#ffffff', color: '#374151' }
            }
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-xs`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HERO BANNER & SLIDES */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Hero Banner Headlines & Link */}
          <form
            onSubmit={handleSaveHeroTexts}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square text-gray-400" />
                <h2 className="font-bold text-base text-gray-900">Left Main Banner Headlines</h2>
              </div>
              <button
                type="submit"
                style={{ backgroundColor: '#040404', color: '#ffffff' }}
                className="px-4 py-2 bg-[#040404] hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-check text-white" />
                <span>Save Banner Headlines</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Main Banner Headline Text</label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={(e) => setHeroForm({ ...heroForm, title: e.target.value })}
                  placeholder="e.g. Invite wealth, peace & positive energy home"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">CTA Button Text</label>
                <input
                  type="text"
                  value={heroForm.ctaText}
                  onChange={(e) => setHeroForm({ ...heroForm, ctaText: e.target.value })}
                  placeholder="e.g. Shop Feng Shui"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">CTA Target Link</label>
                <input
                  type="text"
                  value={heroForm.ctaLink}
                  onChange={(e) => setHeroForm({ ...heroForm, ctaLink: e.target.value })}
                  placeholder="e.g. /shop?q=feng+shui"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>
            </div>

            {/* Right Card Settings */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-image text-purple-600" />
                <span>Right Banner Card (&ldquo;Sacred Feng Shui Finds&rdquo;)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Badge Text</label>
                  <input
                    type="text"
                    value={heroForm.rightBadge}
                    onChange={(e) => setHeroForm({ ...heroForm, rightBadge: e.target.value })}
                    placeholder="e.g. Harmonious Living"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Card Title</label>
                  <input
                    type="text"
                    value={heroForm.rightTitle}
                    onChange={(e) => setHeroForm({ ...heroForm, rightTitle: e.target.value })}
                    placeholder="e.g. Sacred Feng Shui Finds"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Link Subtitle</label>
                  <input
                    type="text"
                    value={heroForm.rightSubtitle}
                    onChange={(e) => setHeroForm({ ...heroForm, rightSubtitle: e.target.value })}
                    placeholder="e.g. Explore energy decor"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Destination URL</label>
                  <input
                    type="text"
                    value={heroForm.rightLink}
                    onChange={(e) => setHeroForm({ ...heroForm, rightLink: e.target.value })}
                    placeholder="e.g. /shop?category=Feng%20Shui%20Decor"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Featured Artwork Image"
                    value={heroForm.rightImage}
                    onChange={(url) => setHeroForm({ ...heroForm, rightImage: url })}
                    helpText="Upload the featured side artwork image for the hero section."
                  />
                </div>
              </div>
            </div>
          </form>


          {/* Hero Slider Images Management */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">Hero Slider Rotating Images</h3>
                <p className="text-xs text-gray-500">
                  These images crossfade automatically on the homepage hero slider every 5 seconds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSlideModal({ isOpen: true, slide: { image: '', alt: '' } })}
                style={{ backgroundColor: '#040404', color: '#ffffff' }}
                className="px-4 py-2 bg-[#040404] hover:bg-black text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-white" />
                <span>Add New Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {heroBanner.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="group relative border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 flex flex-col justify-between shadow-2xs"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      Slide #{idx + 1}
                    </span>
                  </div>

                  <div className="p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700 line-clamp-2" title={slide.alt}>
                      {slide.alt || 'No alt text provided'}
                    </p>

                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setSlideModal({ isOpen: true, slide })}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-black bg-white hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Delete this hero slide?')) {
                            deleteHeroSlide(slide.id);
                            showToast('Hero slide removed.');
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROSPERITY GIFTS & HERO CARDS */}
      {/* ========================================================================= */}
      {activeTab === 'prosperity' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-base text-gray-900">
                  Miracle Feng Shui - Special Gifts for Prosperity
                </h2>
                <p className="text-xs text-gray-500">
                  Manage the 3 hero showcase category cards and section titles.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setProsperityModal({
                    isOpen: true,
                    card: { title: '', slug: 'Feng Shui Decor', image: '' },
                  })
                }
                style={{ backgroundColor: '#040404', color: '#ffffff' }}
                className="px-4 py-2 bg-[#040404] hover:bg-black text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-white" />
                <span>Add Category Card</span>
              </button>
            </div>

            {/* List of Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {prosperityCards.map((card) => (
                <div
                  key={card.id}
                  className="group relative border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                      <span className="text-white font-bold text-sm leading-snug drop-shadow-xs">
                        {card.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <span className="text-[11.5px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {card.slug}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setProsperityModal({ isOpen: true, card })}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-black bg-white hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete category card "${card.title}"?`)) {
                            deleteProsperityCard(card.id);
                            showToast('Category card removed.');
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GIFTS AS SPECIAL AS THEY ARE */}
      {/* ========================================================================= */}
      {activeTab === 'special_gifts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-base text-gray-900">Gifts as Special as They Are</h2>
                <p className="text-xs text-gray-500">
                  Add, edit, or delete items in the gifts collection grid.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSpecialGiftModal({
                    isOpen: true,
                    item: { name: '', slug: 'Feng Shui Jewelry', image: '' },
                  })
                }
                style={{ backgroundColor: '#040404', color: '#ffffff' }}
                className="px-4 py-2 bg-[#040404] hover:bg-black text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-white" />
                <span>Add Gift Category</span>
              </button>
            </div>

            {/* List of Special Gift Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2">
              {specialGifts.map((gift) => (
                <div
                  key={gift.id}
                  className="flex items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-2xl shadow-2xs hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-gray-900 truncate">{gift.name}</p>
                      <p className="text-xs text-gray-500 truncate">{gift.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSpecialGiftModal({ isOpen: true, item: gift })}
                      className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg cursor-pointer"
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete "${gift.name}"?`)) {
                          deleteSpecialGift(gift.id);
                          showToast('Gift category removed.');
                        }
                      }}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash-can text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CURATED STYLE & CHI GUIDE */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-base text-gray-900">
                  Curated Style &amp; Chi &bull; Energy &amp; Harmony Guide
                </h2>
                <p className="text-xs text-gray-500">
                  Manage the guide visual cards, video cards, subtitles, and destination links.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setGuideModal({
                    isOpen: true,
                    card: { title: '', slug: 'Feng Shui Jewelry', image: '', videoUrl: '', tag: '' },
                  })
                }
                style={{ backgroundColor: '#040404', color: '#ffffff' }}
                className="px-4 py-2 bg-[#040404] hover:bg-black text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-white" />
                <span>Add Guide Card</span>
              </button>
            </div>

            {/* List of Guide Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {guideCards.map((card) => (
                <div
                  key={card.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between">
                        {card.videoUrl ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                            <i className="fa-solid fa-play text-[8px]" />
                            Video
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                            Image Card
                          </span>
                        )}
                        {card.tag && (
                          <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold">
                            {card.tag}
                          </span>
                        )}
                      </div>
                      <span className="text-white font-semibold text-xs leading-snug line-clamp-2">
                        {card.title}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <span className="text-[11.5px] font-medium text-gray-500">{card.slug}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGuideModal({ isOpen: true, card })}
                        className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-black bg-white hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete guide card "${card.title}"?`)) {
                            deleteGuideCard(card.id);
                            showToast('Guide card removed.');
                          }
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BLOG / SACRED KNOWLEDGE SECTION ("blob section") */}
      {/* ========================================================================= */}
      {activeTab === 'blog' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-base text-gray-900">
                  Blog &amp; Sacred Knowledge Articles
                </h2>
                <p className="text-xs text-gray-500">
                  Add, edit, or delete articles and guides shown on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setBlogModal({
                    isOpen: true,
                    post: {
                      title: '',
                      category: 'Shopping Guides',
                      summary: '',
                      slug: '/shop',
                      image: '',
                    },
                  })
                }
                style={{ backgroundColor: '#040404', color: '#ffffff' }}
                className="px-4 py-2 bg-[#040404] hover:bg-black text-white rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus text-white" />
                <span>Add New Article</span>
              </button>
            </div>

            {/* List of Blog Posts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {blogPosts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/75 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.summary}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
                        {post.slug}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBlogModal({ isOpen: true, post })}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-700 hover:text-black bg-white hover:bg-gray-100 rounded-lg border border-gray-300 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete article "${post.title}"?`)) {
                              deleteBlogPost(post.id);
                              showToast('Article deleted.');
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT HERO SLIDE */}
      {/* ========================================================================= */}
      {slideModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 sm:my-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {slideModal.slide?.id ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </h3>
              <button
                type="button"
                onClick={() => setSlideModal({ isOpen: false, slide: null })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const image = slideModal.slide?.image?.trim();
                const alt = (form.elements.namedItem('slideAlt') as HTMLInputElement).value;

                if (!image) {
                  alert('Please upload an image file for the slide');
                  return;
                }

                if (slideModal.slide?.id) {
                  updateHeroSlide(slideModal.slide.id, { image, alt });
                  showToast('Slide updated successfully!');
                } else {
                  addHeroSlide({ image, alt });
                  showToast('New slide added to hero banner!');
                }
                setSlideModal({ isOpen: false, slide: null });
              }}
              className="space-y-4"
            >
              <ImageUploadField
                label="Upload Slide Image"
                required
                value={slideModal.slide?.image || ''}
                onChange={(url) =>
                  setSlideModal({
                    ...slideModal,
                    slide: { ...slideModal.slide, image: url },
                  })
                }
                helpText="Choose a photo from your computer (PNG, JPG, WEBP)."
              />


              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Artwork Alt / Description Text</label>
                <input
                  name="slideAlt"
                  type="text"
                  defaultValue={slideModal.slide?.alt || ''}
                  placeholder="e.g. Citrine Crystal Bonsai Money Tree"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSlideModal({ isOpen: false, slide: null })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs cursor-pointer"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT PROSPERITY CARD */}
      {/* ========================================================================= */}
      {prosperityModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 sm:my-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {prosperityModal.card?.id ? 'Edit Prosperity Card' : 'Add Prosperity Card'}
              </h3>
              <button
                type="button"
                onClick={() => setProsperityModal({ isOpen: false, card: null })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('cardTitle') as HTMLInputElement).value;
                const slug = (form.elements.namedItem('cardSlug') as HTMLInputElement).value;
                const image = prosperityModal.card?.image?.trim();

                if (!title || !image) {
                  alert('Please provide a card title and upload an image');
                  return;
                }

                if (prosperityModal.card?.id) {
                  updateProsperityCard(prosperityModal.card.id, { title, slug, image });
                  showToast('Category card updated!');
                } else {
                  addProsperityCard({ title, slug, image });
                  showToast('New prosperity card added!');
                }
                setProsperityModal({ isOpen: false, card: null });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Card Title</label>
                <input
                  name="cardTitle"
                  type="text"
                  required
                  defaultValue={prosperityModal.card?.title || ''}
                  placeholder="e.g. Feng Shui Wealth Corner Starter Kits"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Category Slug / Link</label>
                <input
                  name="cardSlug"
                  type="text"
                  required
                  defaultValue={prosperityModal.card?.slug || 'Feng Shui Decor'}
                  placeholder="e.g. Feng Shui Decor, Crystals & Trees"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <ImageUploadField
                label="Card Image"
                required
                value={prosperityModal.card?.image || ''}
                onChange={(url) =>
                  setProsperityModal({
                    ...prosperityModal,
                    card: { ...prosperityModal.card, image: url },
                  })
                }
                helpText="Choose an image file for this prosperity card."
              />


              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProsperityModal({ isOpen: false, card: null })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT SPECIAL GIFT ITEM */}
      {/* ========================================================================= */}
      {specialGiftModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 sm:my-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {specialGiftModal.item?.id ? 'Edit Gift Category' : 'Add Gift Category'}
              </h3>
              <button
                type="button"
                onClick={() => setSpecialGiftModal({ isOpen: false, item: null })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const name = (form.elements.namedItem('giftName') as HTMLInputElement).value;
                const slug = (form.elements.namedItem('giftSlug') as HTMLInputElement).value;
                const image = specialGiftModal.item?.image?.trim();

                if (!name || !image) {
                  alert('Please provide a category name and upload an image');
                  return;
                }

                if (specialGiftModal.item?.id) {
                  updateSpecialGift(specialGiftModal.item.id, { name, slug, image });
                  showToast('Gift category updated!');
                } else {
                  addSpecialGift({ name, slug, image });
                  showToast('New gift category added!');
                }
                setSpecialGiftModal({ isOpen: false, item: null });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Category Name</label>
                <input
                  name="giftName"
                  type="text"
                  required
                  defaultValue={specialGiftModal.item?.name || ''}
                  placeholder="e.g. Protection Mirrors & Charms"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Target Category Slug</label>
                <input
                  name="giftSlug"
                  type="text"
                  required
                  defaultValue={specialGiftModal.item?.slug || 'Feng Shui Jewelry'}
                  placeholder="e.g. Feng Shui Jewelry, Zen & Meditation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <ImageUploadField
                label="Gift Category Image"
                required
                value={specialGiftModal.item?.image || ''}
                onChange={(url) =>
                  setSpecialGiftModal({
                    ...specialGiftModal,
                    item: { ...specialGiftModal.item, image: url },
                  })
                }
                helpText="Upload category card image (PNG, JPG, or WEBP)."
              />


              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSpecialGiftModal({ isOpen: false, item: null })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs cursor-pointer"
                >
                  Save Gift Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT GUIDE CARD */}
      {/* ========================================================================= */}
      {guideModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 sm:my-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {guideModal.card?.id ? 'Edit Guide Card' : 'Add Guide Card'}
              </h3>
              <button
                type="button"
                onClick={() => setGuideModal({ isOpen: false, card: null })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('guideTitle') as HTMLInputElement).value;
                const slug = (form.elements.namedItem('guideSlug') as HTMLInputElement).value;
                const videoUrl = (form.elements.namedItem('guideVideo') as HTMLInputElement).value;
                const tag = (form.elements.namedItem('guideTag') as HTMLInputElement).value;
                const image = guideModal.card?.image?.trim();

                if (!title || !image) {
                  alert('Please enter a title and upload a cover image');
                  return;
                }

                if (guideModal.card?.id) {
                  updateGuideCard(guideModal.card.id, { title, slug, image, videoUrl: videoUrl || undefined, tag: tag || undefined });
                  showToast('Guide card updated!');
                } else {
                  addGuideCard({ title, slug, image, videoUrl: videoUrl || undefined, tag: tag || undefined });
                  showToast('New guide card added!');
                }
                setGuideModal({ isOpen: false, card: null });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Card Title / Caption</label>
                <input
                  name="guideTitle"
                  type="text"
                  required
                  defaultValue={guideModal.card?.title || ''}
                  placeholder="e.g. Brass Bagua Pendant Necklace"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Category Slug</label>
                  <input
                    name="guideSlug"
                    type="text"
                    required
                    defaultValue={guideModal.card?.slug || 'Feng Shui Jewelry'}
                    placeholder="e.g. Feng Shui Jewelry"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Pill Tag (Optional)</label>
                  <input
                    name="guideTag"
                    type="text"
                    defaultValue={guideModal.card?.tag || ''}
                    placeholder="e.g. Video Cure, Protection"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Cover Image"
                required
                value={guideModal.card?.image || ''}
                onChange={(url) =>
                  setGuideModal({
                    ...guideModal,
                    card: { ...guideModal.card, image: url },
                  })
                }
                helpText="Upload guide card cover image (PNG, JPG, or WEBP)."
              />


              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Video URL (Optional for hover video card)</label>
                <input
                  name="guideVideo"
                  type="text"
                  defaultValue={guideModal.card?.videoUrl || ''}
                  placeholder="e.g. /videos/fashion-craft-1.mp4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setGuideModal({ isOpen: false, card: null })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs cursor-pointer"
                >
                  Save Guide Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT BLOG ARTICLE */}
      {/* ========================================================================= */}
      {blogModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 sm:my-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">
                {blogModal.post?.id ? 'Edit Blog Article' : 'Add Blog Article'}
              </h3>
              <button
                type="button"
                onClick={() => setBlogModal({ isOpen: false, post: null })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const title = (form.elements.namedItem('postTitle') as HTMLInputElement).value;
                const category = (form.elements.namedItem('postCategory') as HTMLInputElement).value;
                const summary = (form.elements.namedItem('postSummary') as HTMLInputElement).value;
                const slug = (form.elements.namedItem('postSlug') as HTMLInputElement).value;
                const image = blogModal.post?.image?.trim();

                if (!title || !image) {
                  alert('Please enter a title and upload a featured image');
                  return;
                }

                if (blogModal.post?.id) {
                  updateBlogPost(blogModal.post.id, { title, category, summary, slug, image });
                  showToast('Article updated!');
                } else {
                  addBlogPost({ title, category, summary, slug, image });
                  showToast('New article published to homepage!');
                }
                setBlogModal({ isOpen: false, post: null });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Article Title</label>
                <input
                  name="postTitle"
                  type="text"
                  required
                  defaultValue={blogModal.post?.title || ''}
                  placeholder="e.g. How to activate your southeast wealth corner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Category Tag</label>
                  <input
                    name="postCategory"
                    type="text"
                    required
                    defaultValue={blogModal.post?.category || 'Shopping Guides'}
                    placeholder="e.g. Shopping Guides, Energy Balance"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Article Link / Slug</label>
                  <input
                    name="postSlug"
                    type="text"
                    required
                    defaultValue={blogModal.post?.slug || '/shop'}
                    placeholder="e.g. /shop?category=Feng%20Shui%20Decor"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Featured Image"
                required
                value={blogModal.post?.image || ''}
                onChange={(url) =>
                  setBlogModal({
                    ...blogModal,
                    post: { ...blogModal.post, image: url },
                  })
                }
                helpText="Upload article featured cover image (PNG, JPG, or WEBP)."
              />


              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Summary / Excerpt</label>
                <textarea
                  name="postSummary"
                  rows={3}
                  defaultValue={blogModal.post?.summary || ''}
                  placeholder="A brief excerpt explaining the Feng Shui principles covered..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#3A1F62]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setBlogModal({ isOpen: false, post: null })}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#111111] hover:bg-black rounded-full shadow-xs cursor-pointer"
                >
                  Save Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
