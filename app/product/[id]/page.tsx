'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle, translateProductDescription, translateCategory } from '@/lib/translations';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { addItem, addFavorite, removeFavorite, isFavorite } = useCart();
  const { products } = useStore();
  const { country, formatPrice, t, language } = useLocale();

  const product = products.find((p) => p.id === id || (p as any).slug === id) || products[0];
  const localizedTitle = translateProductTitle(product.name, language, product.id);
  const localizedDescription = translateProductDescription(product.description, language, product.id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.variations?.forEach((v) => {
      initial[v.name] = v.options[0];
    });
    return initial;
  });
  const [personalizationText, setPersonalizationText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'delivery' | 'placement' | 'reviews'>('details');
  const [addedToast, setAddedToast] = useState(false);

  const productIsFavorite = isFavorite(product.id);

  const toggleProductFavorite = () => {
    if (productIsFavorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  };

  const handleAddToCart = () => {
    const success = addItem(product, quantity, selectedVariations, personalizationText);
    if (success) {
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3000);
    }
  };

  const handleBuyItNow = () => {
    const success = addItem(product, quantity, selectedVariations, personalizationText);
    if (success) {
      router.push('/cart');
    }
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const viewedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(4, 9);

  // Split details into two columns for specifications
  const midIndex = Math.ceil((product.itemDetails?.length || 4) / 2);
  const col1Details = product.itemDetails?.slice(0, midIndex) || [];
  const col2Details = product.itemDetails?.slice(midIndex) || [];

  return (
    <div className="bg-white min-h-screen text-[#111111]">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-4 text-[13px] border border-white/20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <i className="fa-solid fa-circle-check text-emerald-400 text-lg" />
          <div>
            <p className="font-semibold text-white">Added to your bag!</p>
            <p className="text-[11px] text-gray-300">Proceed to checkout whenever ready.</p>
          </div>
          <Link
            href="/cart"
            className="px-3 py-1.5 bg-[#F1641E] text-white rounded-lg font-bold text-[12px] hover:bg-[#D75200] transition-colors ml-2"
          >
            View Bag →
          </Link>
        </div>
      )}

      <div className="etsy-container max-w-[1220px] py-6 sm:py-8">
        {/* Modern Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12.5px] text-gray-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-black flex items-center gap-1.5 transition-colors">
            <i className="fa-solid fa-house text-[11px] text-gray-400" />
            <span>Home</span>
          </Link>
          <span className="text-gray-300">›</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-black transition-colors"
          >
            {translateCategory(product.category, language)}
          </Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-600 font-normal truncate max-w-[300px]">
            {localizedTitle}
          </span>
        </nav>

        {/* 2-Column Standard Luxury Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* LEFT: IMAGE GALLERY (Decreased size & balanced width) */}
          <div className="lg:col-span-5 max-w-[440px] w-full mx-auto lg:mx-0 space-y-3.5">
            {/* Main Stage Image (Edge-to-Edge Fit) */}
            <div className="relative aspect-square max-w-[440px] max-h-[440px] w-full bg-[#F8F8F8] border border-gray-200/80 rounded-2xl overflow-hidden group shadow-2xs">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={localizedTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Badges on main image (Clean, minimal luxury, no tacky icons) */}
              <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10 pointer-events-none">
                {product.bestseller && (
                  <span className="bg-[#111111]/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs backdrop-blur-xs">
                    Bestseller
                  </span>
                )}
                <span className="bg-white/95 text-[#111111] text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border border-black/10 shadow-xs backdrop-blur-xs">
                  Master Consecrated
                </span>
              </div>

              {/* Floating Wishlist Button */}
              <button
                type="button"
                onClick={toggleProductFavorite}
                aria-label={productIsFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
                className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-[#111111] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
              >
                <i
                  className={`fa-heart text-[15px] transition-colors ${
                    productIsFavorite
                      ? 'fa-solid text-[#F1641E]'
                      : 'fa-regular text-[#111111]'
                  }`}
                />
              </button>
            </div>

            {/* Horizontal Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 max-w-[440px]">
                {product.images.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-square bg-[#F8F8F8] rounded-xl border overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#111111] ring-2 ring-[#111111] shadow-xs'
                        : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO & PURCHASE CONTROLS (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title (Modern clean font, decreased size & lighter elegant font weight) */}
            <h1 style={{ fontWeight: 400 }} className="font-sans text-[20px] sm:text-[23px] font-normal text-[#111111] tracking-normal leading-snug">
              {localizedTitle}
            </h1>

            {/* Star Rating - Premium Standard Font Awesome Stars */}
            <div className="flex items-center gap-2.5 text-[13px]">
              <div className="flex items-center gap-0.5 text-[#E59819]">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star text-[13px] leading-none" />
                ))}
              </div>
              <span className="font-semibold text-[#111111]">
                {product.rating || 4.9}
              </span>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-gray-600 hover:text-black underline cursor-pointer text-[13px]"
              >
                ({product.reviewCount || 2840} customer reviews)
              </button>
            </div>

            {/* Price & Discounts */}
            <div className="flex items-baseline gap-3 flex-wrap pt-1">
              <span className="text-[28px] sm:text-[32px] font-bold text-[#111111]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-[17px] text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  {product.discount}
                </span>
              )}
            </div>
            <p className="text-[12px] text-gray-500 flex items-center gap-1.5">
              <i className="fa-solid fa-truck-fast text-emerald-600" />
              <span>
                {country === 'UAE'
                  ? t('product.tax_notice_uae', 'VAT Included • Express Air Shipping in 3–5 days to Dubai, Abu Dhabi & All Emirates')
                  : t('product.tax_notice_india', 'Inclusive of all GST • Free Express Insured Delivery in 2–4 business days')}
              </span>
            </p>

            {/* In Demand Notice */}
            <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-[#FFF9F5] border border-[#FDE6D8] rounded-xl text-[13px]">
              <span className="w-2 h-2 rounded-full bg-[#F1641E] shrink-0" />
              <p className="text-[#333333] leading-snug">
                <strong className="font-semibold text-[#111111]">{t('product.in_high_demand', 'In high demand')}:</strong>{' '}
                <span className="text-gray-600">
                  {product.inDemandCount || 18} {t('product.seekers_welcomed', 'seekers welcomed this sacred piece into their sanctuary in the last 24 hours.')}
                </span>
              </p>
            </div>

            {/* Short Description */}
            <p className="text-[13.5px] text-gray-600 leading-relaxed border-b border-gray-100 pb-5">
              {product.description}
            </p>

            {/* 4 Feature Trust Strip */}
            <div className="grid grid-cols-2 gap-2.5 text-[12px] py-1">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2.5">
                <i className="fa-solid fa-om text-[#111111] text-[15px] w-5 text-center shrink-0" />
                <div>
                  <span className="font-bold text-[#111111] block leading-tight">{t('product.blessed_by_master', 'Blessed by Master')}</span>
                  <span className="text-[10.5px] text-gray-500">{t('product.blessed_sub', 'Mantra energized')}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2.5">
                <i className="fa-solid fa-gem text-[#111111] text-[15px] w-5 text-center shrink-0" />
                <div>
                  <span className="font-bold text-[#111111] block leading-tight">{t('product.authentic', '100% Authentic')}</span>
                  <span className="text-[10.5px] text-gray-500">{t('product.authentic_sub', 'Certified Grade-A')}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2.5">
                <i className="fa-solid fa-truck-fast text-[#111111] text-[15px] w-5 text-center shrink-0" />
                <div>
                  <span className="font-bold text-[#111111] block leading-tight">{t('product.express_shipping', 'Express Shipping')}</span>
                  <span className="text-[10.5px] text-gray-500">{t('product.express_sub', 'Insured 2–4 days')}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center gap-2.5">
                <i className="fa-solid fa-shield-halved text-[#111111] text-[15px] w-5 text-center shrink-0" />
                <div>
                  <span className="font-bold text-[#111111] block leading-tight">{t('product.energy_warranty', 'Sanctuary Harmony')}</span>
                  <span className="text-[10.5px] text-gray-500">{t('product.energy_sub', 'Sacred energy alignment')}</span>
                </div>
              </div>
            </div>

            {/* Variations / Options */}
            {product.variations && product.variations.length > 0 && (
              <div className="space-y-3 pt-1">
                {product.variations.map((v) => (
                  <div key={v.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-bold text-[#111111]">{v.name}:</span>
                      <span className="text-gray-500 text-[12px]">
                        {selectedVariations[v.name] || v.options[0]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => {
                        const isSelected =
                          (selectedVariations[v.name] || v.options[0]) === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelectedVariations({
                                ...selectedVariations,
                                [v.name]: opt,
                              })
                            }
                            className={`px-3.5 py-2 rounded-xl text-[12.5px] font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Personalization Note */}
            {product.allowsPersonalization && (
              <div className="space-y-1.5 bg-[#FAFAFA] p-3.5 rounded-xl border border-gray-200 text-left">
                <label className="text-[12.5px] font-bold text-[#111111] flex items-center justify-between">
                  <span>Custom Dedication / Prayer (Optional):</span>
                </label>
                <input
                  type="text"
                  value={personalizationText}
                  onChange={(e) => setPersonalizationText(e.target.value)}
                  placeholder="e.g. For Family Harmony & Wealth Flow"
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-[#111111] focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            )}

            {/* Quantity Stepper & Price */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-[13px]">
                <span className="font-bold text-[#111111]">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-semibold transition-colors cursor-pointer"
                  >
                    –
                  </button>
                  <span className="w-10 text-center font-bold text-[13.5px] text-[#111111]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-semibold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <span className="text-[20px] font-bold text-[#111111]">
                {t('product.total', 'Total')}: {formatPrice(product.price * quantity)}
              </span>
            </div>

            {/* Stock Urgency Notice (< 10 products left) */}
            {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
              <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl text-[13px] text-[#C2410C] font-semibold animate-in fade-in">
                <i className="fa-solid fa-fire text-[#EA580C] text-[15px]" />
                <span>
                  <strong>Only {product.stock} left in stock</strong> — order soon to secure yours!
                </span>
              </div>
            )}
            {product.stock === 0 && (
              <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-rose-50 border border-rose-200 rounded-xl text-[13px] text-rose-700 font-semibold">
                <i className="fa-solid fa-circle-exclamation text-rose-600 text-[15px]" />
                <span>Currently out of stock. New consecrated batch arriving soon.</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{ backgroundColor: product.stock === 0 ? '#9CA3AF' : '#111111', color: '#FFFFFF' }}
                className={`w-full font-bold text-[13px] uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  product.stock === 0 ? 'cursor-not-allowed opacity-60' : 'hover:bg-black hover:shadow-lg cursor-pointer'
                }`}
              >
                <i className="fa-solid fa-bag-shopping text-[14px]" />
                <span>{product.stock === 0 ? 'Out of Stock' : t('product.add_to_cart', 'Add To Bag')}</span>
              </button>

              <button
                type="button"
                onClick={toggleProductFavorite}
                style={{
                  backgroundColor: productIsFavorite ? '#FFF0EB' : '#F5F5F3',
                  color: productIsFavorite ? '#F1641E' : '#111111',
                  borderColor: productIsFavorite ? '#F1641E' : '#222222',
                }}
                className="w-full border-2 hover:opacity-90 font-bold text-[13px] uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <i
                  className={`text-[14px] ${
                    productIsFavorite
                      ? 'fa-solid fa-heart text-[#F1641E]'
                      : 'fa-regular fa-heart text-[#111111]'
                  }`}
                />
                <span>{productIsFavorite ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            {/* Instant Buy It Now */}
            <button
              type="button"
              onClick={handleBuyItNow}
              disabled={product.stock === 0}
              style={{ backgroundColor: product.stock === 0 ? '#9CA3AF' : '#F1641E', color: '#FFFFFF' }}
              className={`w-full font-bold text-[13px] uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                product.stock === 0 ? 'cursor-not-allowed opacity-60' : 'hover:bg-[#D75200] cursor-pointer'
              }`}
            >
              <i className="fa-solid fa-bolt text-[13px]" />
              <span>{product.stock === 0 ? 'Unavailable' : t('product.buy_now', 'Buy It Now')}</span>
            </button>

            {/* Social Share Strip */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[12px] text-gray-500">
              <span className="font-semibold text-gray-700">Share this sacred piece:</span>
              <div className="flex items-center gap-2.5 text-gray-500">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${localizedTitle} on Miracle Feng Shui`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:text-emerald-600 hover:border-emerald-600 transition-colors"
                  aria-label="Share on WhatsApp"
                >
                  <i className="fa-brands fa-whatsapp text-[14px]" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:text-blue-600 hover:border-blue-600 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <i className="fa-brands fa-facebook-f text-[12px]" />
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:text-red-600 hover:border-red-600 transition-colors"
                  aria-label="Share on Pinterest"
                >
                  <i className="fa-brands fa-pinterest-p text-[12px]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FULL WIDTH TABBED INFORMATION SECTION */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-16 bg-white shadow-xs">
          {/* Tabs Navigation Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-200 bg-[#FAFAFA] text-center text-[13px]">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`py-3.5 px-4 font-semibold flex items-center justify-center gap-2 border-r border-gray-200 transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-white text-black border-b-2 border-b-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-circle-info text-[13px]" />
              <span>Specifications</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`py-3.5 px-4 font-semibold flex items-center justify-center gap-2 border-r border-gray-200 transition-colors cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-white text-black border-b-2 border-b-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-truck-fast text-[13px]" />
              <span>Delivery &amp; Returns</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('placement')}
              className={`py-3.5 px-4 font-semibold flex items-center justify-center gap-2 border-r border-gray-200 transition-colors cursor-pointer ${
                activeTab === 'placement'
                  ? 'bg-white text-black border-b-2 border-b-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-compass text-[13px]" />
              <span>Placement Guide</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-3.5 px-4 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-white text-black border-b-2 border-b-black shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <i className="fa-solid fa-star text-[13px]" />
              <span>Rating &amp; Reviews</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-6 sm:p-10">
            {activeTab === 'details' && (
              <div className="space-y-6 text-[13.5px] text-gray-700 leading-relaxed">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                  <ul className="space-y-2.5">
                    {col1Details.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <i className="fa-solid fa-check text-emerald-600 text-[12px] mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2.5">
                    {col2Details.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <i className="fa-solid fa-check text-emerald-600 text-[12px] mt-1 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 border-t border-gray-100">
                  <h4 className="font-bold text-[#111111] text-[14.5px] mb-2">
                    Craft Lineage &amp; Sacred Provenance
                  </h4>
                  <p className="text-gray-600 leading-relaxed">{localizedDescription}</p>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-6 text-[13.5px] text-gray-700 leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xs">
                      <i className="fa-solid fa-truck-fast text-[14px]" />
                    </div>
                    <h5 className="font-bold text-[#111111] pt-1">Express Insured Delivery</h5>
                    <p className="text-[12.5px] text-gray-500">
                      Dispatched within 24 hours. Estimated delivery: 2–4 business days via BlueDart &amp; DTDC Express.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-white text-amber-600 flex items-center justify-center shadow-2xs">
                      <i className="fa-solid fa-box-open text-[14px]" />
                    </div>
                    <h5 className="font-bold text-[#111111] pt-1">Sacred Protective Packaging</h5>
                    <p className="text-[12.5px] text-gray-500">
                      Sealed with protective cushioning, consecrated red ribbon, and includes a Certificate of Authenticity.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-2xs">
                      <i className="fa-solid fa-rotate-left text-[14px]" />
                    </div>
                    <h5 className="font-bold text-[#111111] pt-1">14-Day Harmony Guarantee</h5>
                    <p className="text-[12.5px] text-gray-500">
                      If you feel the energetic resonance is not suited for your sanctuary, return for a prompt, full replacement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'placement' && (
              <div className="space-y-6 text-[13.5px] text-gray-700 leading-relaxed">
                <p className="text-gray-600">
                  Align this sacred artifact according to ancient Feng Shui Bagua principles to maximize the flow of auspicious Chi into your home:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      Southeast Sector
                    </span>
                    <h5 className="font-bold text-[#111111] pt-1">Wealth &amp; Abundance (Xun)</h5>
                    <p className="text-[12.5px] text-gray-500">
                      Place in the far-left corner from your primary room entrance to energize continuous financial prosperity.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-full">
                      North Sector
                    </span>
                    <h5 className="font-bold text-[#111111] pt-1">Career &amp; Life Journey (Kan)</h5>
                    <p className="text-[12.5px] text-gray-500">
                      Position on desk or north facing wall to accelerate career promotions, business stability, and wisdom.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Main Entryway
                    </span>
                    <h5 className="font-bold text-[#111111] pt-1">Sanctuary Protection</h5>
                    <p className="text-[12.5px] text-gray-500">
                      Display facing inwards from the entryway to dispel stagnant energy before it crosses your threshold.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[#E59819]">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fa-solid fa-star text-[16px] leading-none" />
                      ))}
                    </div>
                    <span className="font-bold text-[18px] text-[#111111]">
                      {product.rating || 5.0} out of 5
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-[13px] text-gray-500 font-medium">
                      Authentic Sanctified Rating
                    </span>
                  </div>
                </div>

                <div className="bg-[#FAF9F5] border border-gray-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-white text-amber-600 flex items-center justify-center mx-auto shadow-2xs border border-gray-200/60">
                    <i className="fa-solid fa-certificate text-lg" />
                  </div>
                  <h5 className="font-bold text-[#111111] text-[15px]">Consecrated &amp; Authenticated</h5>
                  <p className="text-[13px] text-gray-500 max-w-md mx-auto leading-relaxed">
                    Each sacred item is spiritually consecrated before dispatch. Verified customers receive an official Certificate of Authenticity and Tax Invoice with their delivery.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAY WE SUGGEST (Images fit card edge-to-edge with generous spacing) */}
        {relatedProducts.length > 0 && (
          <div
            style={{ marginTop: '64px', paddingTop: '48px', marginBottom: '80px' }}
            className="border-t border-gray-200/80"
          >
            <h2
              style={{ marginBottom: '32px' }}
              className="font-sans text-[22px] sm:text-[24px] font-bold text-[#111111] block"
            >
              {t('product.may_we_suggest', 'May We Suggest')}
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 hover:border-gray-400 hover:shadow-md transition-all bg-white overflow-hidden no-underline text-inherit"
                >
                  <div className="relative aspect-square w-full bg-[#F8F8F8] overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 sm:p-3.5 flex flex-col flex-grow">
                    <h3 style={{ fontWeight: 400 }} className="font-sans text-[13px] sm:text-[13.5px] font-normal text-[#111111] line-clamp-1 group-hover:underline">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="font-sans text-[14px] sm:text-[15px] font-bold text-[#111111]">
                        {formatPrice(item.price)}
                      </span>
                      <span className="font-sans text-[11.5px] text-amber-600 font-semibold flex items-center gap-1">
                        <i className="fa-solid fa-star text-amber-400 text-[10px]" />
                        {item.rating}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* YOUR VIEWED PRODUCTS (Images fit card edge-to-edge with generous spacing) */}
        {viewedProducts.length > 0 && (
          <div
            style={{ marginTop: '64px', paddingTop: '48px', marginBottom: '80px' }}
            className="border-t border-gray-200/80"
          >
            <h2
              style={{ marginBottom: '32px' }}
              className="font-sans text-[22px] sm:text-[24px] font-bold text-[#111111] block"
            >
              Your Viewed Products
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-4">
              {viewedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group block aspect-square rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all overflow-hidden bg-[#F8F8F8]"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
