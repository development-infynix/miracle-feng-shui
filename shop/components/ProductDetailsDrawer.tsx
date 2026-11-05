'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import type { Product, ProductSummary } from '@/lib/placeholder-data';
import { translateCategory, translateProductDescription, translateProductTitle } from '@/lib/translations';
import { ProductReviewList, useProductReviews } from './ProductReviews';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const LOW_STOCK = 10;
const ADDED_MESSAGE_MS = 4000;

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3A1F62]';
const imagePill = 'rounded-md px-2 py-1 font-outfit text-[11px] font-semibold leading-none';
const sectionLabel = 'block font-outfit text-[13px] font-semibold text-[#431769]';
const skeleton = 'animate-pulse rounded-sm bg-[#431769]/10 motion-reduce:animate-none';
const fieldClass =
  'h-12 w-full rounded-md border border-white/70 bg-white/55 px-4 font-outfit text-[16px] font-medium text-[#111111] caret-[#7A2FC0] transition-[border-color,box-shadow] placeholder:font-normal placeholder:text-[#5B4A70] focus:border-[#7A2FC0] focus:shadow-[0_0_0_3px_rgba(122,47,192,0.18)]';

type Tab = 'details' | 'reviews';
type LoadStatus = 'loading' | 'ready' | 'not-found' | 'failed';

/** Loads one product's full details, only for the product that was opened. */
function useProductDetails(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/products/${encodeURIComponent(productId)}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.status === 404) {
          setStatus('not-found');
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(`Request failed: ${res.status}`);
        setProduct(json.data);
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('failed');
      });
    return () => controller.abort();
  }, [productId, attempt]);

  const retry = () => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  };

  return { product, status, retry };
}

function Gallery({ images, title, outOfStock, bestseller, heart }: {
  images: string[];
  title: string;
  outOfStock: boolean;
  bestseller: boolean;
  heart: React.ReactNode;
}) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const src = images[activeIndex] || images[0] || FALLBACK_IMAGE;

  return (
    <div className="space-y-2">
      {/* Height is capped so the name and price stay in view. The whole photo always shows. */}
      <div className="relative aspect-square max-h-[46vh] w-full overflow-hidden rounded-md bg-white/50">
        <img
          src={src}
          alt={title}
          className={`h-full w-full object-contain ${outOfStock ? 'opacity-60' : ''}`}
          onError={(e) => {
            const image = e.currentTarget;
            if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          {outOfStock && <span className={`${imagePill} bg-[#111111] text-white`}>{t('shop.out_of_stock', 'Out of stock')}</span>}
          {bestseller && <span className={`${imagePill} bg-[#F3ECFB] text-[#431769]`}>{t('badge.bestseller', 'Bestseller')}</span>}
        </div>
        {heart}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar p-0.5">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-current={index === activeIndex}
              aria-label={t('product.show_image', 'Show image {number}').replace('{number}', String(index + 1))}
              onClick={() => setActiveIndex(index)}
              className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-white/50 transition-colors ${focusRing} ${index === activeIndex ? 'border-[#7A2FC0]' : 'border-transparent hover:border-[#431769]/40'}`}
            >
              <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <div className={`${skeleton} h-3 w-full`} />
      <div className={`${skeleton} h-3 w-full`} />
      <div className={`${skeleton} h-3 w-2/3`} />
    </div>
  );
}

function DrawerContent({ productId, seed, onClose, titleId }: {
  productId: string;
  seed?: ProductSummary;
  onClose: () => void;
  titleId: string;
}) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { items, cartLoading, addItem, addFavorite, removeFavorite, isFavorite, userLoggedIn } = useCart();
  const { formatPrice, language, t } = useLocale();
  const { product: details, status, retry } = useProductDetails(productId);

  const [tab, setTab] = useState<Tab>('details');
  const [reviewsOpened, setReviewsOpened] = useState(false);
  const reviews = useProductReviews(details?.id ?? productId, reviewsOpened);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [personalization, setPersonalization] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ details: null, reviews: null });

  useEffect(() => () => {
    if (addedTimer.current) clearTimeout(addedTimer.current);
  }, []);

  // What the card already had shows straight away while the rest loads.
  const shown: ProductSummary | null = details ?? seed ?? null;
  const title = shown ? translateProductTitle(shown.name, language, shown.id) : '';
  const stock = shown?.stock;
  const outOfStock = stock === 0;
  if (stock !== undefined && stock > 0 && quantity > stock) setQuantity(stock);
  const lowStock = stock !== undefined && stock > 0 && stock < LOW_STOCK;
  const originalPrice = shown?.originalPrice && shown.originalPrice > shown.price ? shown.originalPrice : null;
  const rating = shown?.rating ?? 0;
  const variations = Array.isArray(details?.variations) ? details.variations : [];
  const favorited = shown ? isFavorite(shown.id) : false;
  const reviewCount = reviews.total ?? details?.reviewCount ?? null;
  const signedIn = sessionStatus === 'authenticated' || userLoggedIn;
  // Waits for the session check, so signed-in customers don't see the login button flash.
  const guest = sessionStatus === 'unauthenticated' && !userLoggedIn;
  const inCart = shown ? items.some((item) => (item.product?.id ?? item.productId) === shown.id) : false;

  const askToSignIn = () => {
    window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'signin' } }));
  };

  const selectTab = (next: Tab) => {
    setTab(next);
    if (next === 'reviews') setReviewsOpened(true);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next: Tab = tab === 'details' ? 'reviews' : 'details';
    selectTab(next);
    tabRefs.current[next]?.focus();
  };

  const toggleFavorite = () => {
    if (!shown) return;
    if (!signedIn) {
      askToSignIn();
      return;
    }
    if (favorited) removeFavorite(shown.id);
    else addFavorite((details ?? shown) as Product);
  };

  const addToCart = async () => {
    if (!details || adding) return false;
    setAdding(true);
    setAddError('');
    setAdded(false);
    const selected = Object.fromEntries(variations.map((v) => [v.name, choices[v.name] ?? v.options[0]]));
    const result = await addItem(details, quantity, selected, personalization.trim() || undefined);
    setAdding(false);
    if (result.ok) return true;

    setAddError(result.error || t('product.add_failed', "We couldn't add this to your cart. Please try again."));
    // The usual reason is stock running out while this was open, so show what's left now.
    retry();
    return false;
  };

  const handleAddToCart = async () => {
    if (!(await addToCart())) return;
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), ADDED_MESSAGE_MS);
  };

  const handleBuyNow = async () => {
    if (!(await addToCart())) return;
    onClose();
    router.push('/cart');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'details', label: t('product.details_tab', 'Product details') },
    { id: 'reviews', label: t('product.reviews', 'Reviews') },
  ];

  const unavailable = status === 'not-found' || (status === 'failed' && !shown);

  return (
    <>
      <header className="flex h-16 shrink-0 items-end justify-between gap-3 border-b border-[#431769]/15 pl-6 pr-3">
        <div role="tablist" aria-label={t('product.details_tab', 'Product details')} onKeyDown={handleTabKeyDown} className="flex min-w-0 gap-6">
          {tabs.map(({ id, label }) => {
            const selected = tab === id;
            return (
              <button
                key={id}
                ref={(element) => {
                  tabRefs.current[id] = element;
                }}
                id={`product-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`product-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(id)}
                className={`group relative h-12 cursor-pointer whitespace-nowrap ${focusRing}`}
              >
                <span className={`font-outfit text-[15px] font-semibold transition-colors group-hover:text-[#7A2FC0] ${selected ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}>
                  {label}
                  {id === 'reviews' && reviewCount !== null && <span className="tabular-nums"> ({reviewCount})</span>}
                </span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 -bottom-px h-0.5 origin-left bg-[#7A2FC0] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${selected ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label={t('auth.close', 'Close')}
          onClick={onClose}
          className={`group mb-3 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full ${focusRing}`}
        >
          <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]" />
        </button>
      </header>

      <div
        id="product-panel-details"
        role="tabpanel"
        aria-labelledby="product-tab-details"
        hidden={tab !== 'details'}
        className="min-h-0 flex-1 overflow-y-auto no-scrollbar"
      >
        {unavailable ? (
          <div className="mx-auto max-w-[38ch] px-6 py-16 text-center">
            <h2 id={titleId}>
              <span className="block font-serif text-[24px] font-bold text-[#111111]">
                {status === 'not-found'
                  ? t('product.not_found_title', 'This product is no longer available')
                  : t('product.load_error_title', "We couldn't load this product")}
              </span>
            </h2>
            <p role={status === 'failed' ? 'alert' : undefined} className="mt-2 font-outfit text-[15px] leading-relaxed text-[#2B1A3F]">
              {status === 'not-found'
                ? t('product.not_found_hint', 'It may have been removed. You can browse the rest of the shop instead.')
                : t('product.load_error_hint', 'Check your connection and try again.')}
            </p>
            {status === 'failed' ? (
              <button type="button" onClick={retry} className={`mt-5 h-12 cursor-pointer rounded-md bg-[#431769] px-6 transition-colors hover:bg-[#3A1F62] ${focusRing}`}>
                <span className="font-outfit text-[15px] font-semibold text-white">{t('product.reviews_retry', 'Try again')}</span>
              </button>
            ) : (
              <Link href="/shop" onClick={onClose} className={`mt-5 inline-flex h-12 items-center rounded-md bg-[#431769] px-6 transition-colors hover:bg-[#3A1F62] ${focusRing}`}>
                <span className="font-outfit text-[15px] font-semibold text-white">{t('product.browse', 'Browse products')}</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5 p-4 sm:p-6">
            {shown ? (
              <Gallery
                key={details ? 'full' : 'card'}
                images={shown.images}
                title={title}
                outOfStock={outOfStock}
                bestseller={Boolean(shown.bestseller)}
                heart={
                  <button
                    type="button"
                    aria-pressed={favorited}
                    aria-label={`${favorited ? t('shop.remove_favorite', 'Remove from favorites') : t('shop.save_favorite', 'Save to favorites')}: ${title}`}
                    onClick={toggleFavorite}
                    className={`group/heart absolute right-2.5 top-2.5 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-[#F3ECFB]/85 backdrop-blur-sm ${focusRing}`}
                  >
                    <i aria-hidden="true" className={`${favorited ? 'fa-solid text-[#7A2FC0]' : 'fa-regular text-[#111111]'} fa-heart text-[15px] transition-colors group-hover/heart:text-[#7A2FC0]`} />
                  </button>
                }
              />
            ) : (
              <div className={`${skeleton} aspect-square w-full rounded-md`} />
            )}

            {shown ? (
              <section>
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-outfit text-[13px] text-[#5B4A70]">
                    {translateCategory(shown.category, language)}
                  </span>
                  {rating > 0 && (
                    <span
                      aria-label={t('shop.rating_label', 'Rated {rating} out of 5').replace('{rating}', rating.toFixed(1))}
                      className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md border border-white/70 bg-white/45 px-1.5 font-outfit text-[12px] font-semibold tabular-nums text-[#111111]"
                    >
                      <i aria-hidden="true" className="fa-solid fa-star text-[10px] text-[#431769]" />
                      {rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <h2 id={titleId} className="mt-1.5">
                  <span className="block font-serif text-[24px] font-bold leading-tight tracking-tight text-[#111111] [text-wrap:balance]">{title}</span>
                </h2>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2 tabular-nums">
                  <span className="font-outfit text-[24px] font-bold text-[#111111]">{formatPrice(shown.price)}</span>
                  {originalPrice && <span className="font-outfit text-[15px] text-[#5B4A70] line-through">{formatPrice(originalPrice)}</span>}
                </p>
                {lowStock && (
                  <p className="mt-1 font-outfit text-[13px] text-[#5B4A70]">
                    {t('shop.only_left', 'Only {count} left').replace('{count}', String(stock))}
                  </p>
                )}
              </section>
            ) : (
              <div aria-hidden="true" className="space-y-3">
                <div className={`${skeleton} h-3 w-1/3`} />
                <div className={`${skeleton} h-7 w-5/6`} />
                <div className={`${skeleton} h-6 w-1/4`} />
              </div>
            )}

            {status === 'failed' && (
              <div role="alert" className="border-t border-[#431769]/15 pt-4 font-outfit text-[14px] text-[#2B1A3F]">
                {t('product.details_error', "We couldn't load the rest of this product's details.")}{' '}
                <button type="button" onClick={retry} className={`group cursor-pointer ${focusRing}`}>
                  <span className="font-outfit text-[14px] font-semibold text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]">
                    {t('product.reviews_retry', 'Try again')}
                  </span>
                </button>
              </div>
            )}

            {status === 'loading' && <DetailsSkeleton />}

            {details && (
              <>
                {details.description && (
                  <p className="max-w-[65ch] whitespace-pre-line font-outfit text-[15px] leading-relaxed text-[#2B1A3F]">
                    {translateProductDescription(details.description, language, details.id)}
                  </p>
                )}

                {variations.map((variation) => {
                  const chosen = choices[variation.name] ?? variation.options[0];
                  return (
                    <section key={variation.name} className="border-t border-[#431769]/15 pt-4">
                      <h3><span className={sectionLabel}>{variation.name}</span></h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {variation.options.map((option) => {
                          const selected = chosen === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setChoices((current) => ({ ...current, [variation.name]: option }))}
                              className={`group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/70 bg-white/45 px-3 ${focusRing}`}
                            >
                              {selected && <i aria-hidden="true" className="fa-solid fa-check text-[11px] text-[#7A2FC0]" />}
                              <span className={`font-outfit text-[13px] font-semibold transition-colors group-hover:text-[#7A2FC0] ${selected ? 'text-[#7A2FC0]' : 'text-[#111111]'}`}>
                                {option}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}

                {details.allowsPersonalization && (
                  <section className="border-t border-[#431769]/15 pt-4">
                    <label htmlFor="product-personalization" className={sectionLabel}>
                      {details.personalizationPrompt || t('product.personalization', 'Personalization (optional)')}
                    </label>
                    <input
                      id="product-personalization"
                      type="text"
                      value={personalization}
                      onChange={(e) => setPersonalization(e.target.value)}
                      style={{ outline: 'none' }}
                      className={`${fieldClass} mt-2`}
                    />
                  </section>
                )}

                {!outOfStock && !inCart && (
                  <section className="flex items-center justify-between gap-3 border-t border-[#431769]/15 pt-4">
                    <div className="flex items-center gap-3">
                      <span id="product-quantity-label" className={sectionLabel}>{t('product.quantity', 'Quantity')}</span>
                      <div role="group" aria-labelledby="product-quantity-label" className="flex h-10 items-center rounded-md border border-white/70 bg-white/45">
                        <button
                          type="button"
                          aria-label={t('product.decrease', 'Decrease quantity')}
                          disabled={quantity <= 1}
                          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                          className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                        >
                          <i aria-hidden="true" className="fa-solid fa-minus text-[12px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]" />
                        </button>
                        <span aria-live="polite" className="w-8 text-center font-outfit text-[15px] font-semibold tabular-nums text-[#111111]">{quantity}</span>
                        <button
                          type="button"
                          aria-label={t('product.increase', 'Increase quantity')}
                          disabled={stock !== undefined && quantity >= stock}
                          onClick={() => setQuantity((value) => value + 1)}
                          className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                        >
                          <i aria-hidden="true" className="fa-solid fa-plus text-[12px] text-[#111111] transition-colors group-hover:text-[#7A2FC0]" />
                        </button>
                      </div>
                    </div>
                    <p className="font-outfit text-[15px] font-semibold tabular-nums text-[#111111]">
                      {t('product.total', 'Total')}: {formatPrice(details.price * quantity)}
                    </p>
                  </section>
                )}

                {details.itemDetails?.length > 0 && (
                  <section className="border-t border-[#431769]/15 pt-4">
                    <h3><span className={sectionLabel}>{t('product.item_details', 'Item details')}</span></h3>
                    <ul className="mt-2 space-y-1.5">
                      {details.itemDetails.map((item, index) => (
                        <li key={index} className="flex gap-2.5 font-outfit text-[14px] leading-snug text-[#2B1A3F]">
                          <i aria-hidden="true" className="fa-solid fa-check mt-1 text-[11px] text-[#431769]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {(details.materials?.length || details.maker) && (
                  <dl className="space-y-2 border-t border-[#431769]/15 pt-4 font-outfit text-[14px]">
                    {details.materials && details.materials.length > 0 && (
                      <div className="grid grid-cols-[6rem_1fr] gap-3">
                        <dt className="text-[#5B4A70]">{t('product.materials', 'Materials')}</dt>
                        <dd className="text-[#111111]">{details.materials.join(', ')}</dd>
                      </div>
                    )}
                    {details.maker && (
                      <div className="grid grid-cols-[6rem_1fr] gap-3">
                        <dt className="text-[#5B4A70]">{t('product.made_by', 'Made by')}</dt>
                        <dd className="text-[#111111]">{details.maker}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div
        id="product-panel-reviews"
        role="tabpanel"
        aria-labelledby="product-tab-reviews"
        hidden={tab !== 'reviews'}
        className="min-h-0 flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6"
      >
        {reviewsOpened && (
          <ProductReviewList
            state={reviews}
            productId={details?.id ?? productId}
            signedIn={signedIn}
            guest={guest}
            onSignIn={askToSignIn}
          />
        )}
      </div>

      {tab === 'details' && !unavailable && (
        <footer className="shrink-0 border-t border-[#431769]/15 p-4">
          {addError && (
            <p role="alert" className="mb-3 font-outfit text-[14px] font-medium text-[#8F1610]">
              {addError}
            </p>
          )}
          <p role="status" className="font-outfit text-[14px] text-[#2B1A3F] empty:hidden">
            {added && (
              <span className="mb-3 flex items-center justify-between gap-3">
                <span>{t('product.added', 'Added to your cart.')}</span>
                <Link href="/cart" onClick={onClose} className={`group shrink-0 ${focusRing}`}>
                  <span className="font-semibold text-[#431769] underline underline-offset-2 transition-colors group-hover:text-[#7A2FC0]">
                    {t('product.view_cart_short', 'View cart')}
                  </span>
                </Link>
              </span>
            )}
          </p>
          {outOfStock ? (
            <button type="button" disabled className="h-12 w-full cursor-not-allowed rounded-md bg-[#431769] opacity-50">
              <span className="font-outfit text-[15px] font-semibold text-white">{t('shop.out_of_stock', 'Out of stock')}</span>
            </button>
          ) : guest ? (
            <button
              type="button"
              onClick={askToSignIn}
              className={`h-12 w-full cursor-pointer rounded-md bg-[#431769] transition-colors hover:bg-[#3A1F62] ${focusRing}`}
            >
              <span className="font-outfit text-[15px] font-semibold text-white">{t('product.login_to_cart', 'Login to cart')}</span>
            </button>
          ) : inCart ? (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/cart"
                onClick={onClose}
                className={`group flex h-12 items-center justify-center rounded-md border border-[#431769] ${focusRing}`}
              >
                <span className="font-outfit text-[15px] font-semibold text-[#431769] transition-colors group-hover:text-[#7A2FC0]">
                  {t('product.view_cart_short', 'View cart')}
                </span>
              </Link>
              <button type="button" disabled className="h-12 cursor-not-allowed rounded-md bg-[#431769] opacity-50">
                <span className="font-outfit text-[15px] font-semibold text-white">{t('product.already_in_cart', 'Already in cart')}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!details || !signedIn || cartLoading || adding}
                onClick={() => void handleBuyNow()}
                className={`group h-12 cursor-pointer rounded-md border border-[#431769] disabled:cursor-wait disabled:opacity-50 ${focusRing}`}
              >
                <span className="font-outfit text-[15px] font-semibold text-[#431769] transition-colors group-hover:text-[#7A2FC0]">
                  {t('product.buy_now', 'Buy It Now')}
                </span>
              </button>
              <button
                type="button"
                disabled={!details || !signedIn || cartLoading || adding}
                onClick={() => void handleAddToCart()}
                className={`h-12 cursor-pointer rounded-md bg-[#431769] transition-colors hover:bg-[#3A1F62] disabled:cursor-wait disabled:opacity-50 ${focusRing}`}
              >
                <span className="font-outfit text-[15px] font-semibold text-white">{adding ? t('product.adding', 'Adding…') : t('product.add_to_cart', 'Add to Cart')}</span>
              </button>
            </div>
          )}
        </footer>
      )}
    </>
  );
}

interface ProductDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  /** The card's fields, shown while the full details load. */
  seed?: ProductSummary;
}

/** One product's details in a glass drawer from the right. Each part loads only when it's needed. */
export default function ProductDetailsDrawer({ open, onClose, productId, seed }: ProductDetailsDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const slidIn = useGlassModal({ open, onClose, panelRef, initialFocusRef: panelRef });

  return (
    <div
      inert={!open}
      className={`fixed inset-0 z-[9998] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-[#2B154C]/25 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${slidIn ? 'opacity-100' : 'opacity-0'}`}
      />

      <aside
        ref={panelRef}
        tabIndex={-1}
        // It takes focus on open for screen readers, and shows no ring because it isn't a control.
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-hidden glass-veil shadow-[-6px_0_24px_rgba(67,23,105,0.18),inset_2px_0_2px_rgba(255,255,255,0.7)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${slidIn ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* The key starts everything fresh for each product: tab, quantity, choices and loaded reviews. */}
        <DrawerContent key={productId} productId={productId} seed={seed} onClose={onClose} titleId={titleId} />
      </aside>
    </div>
  );
}
