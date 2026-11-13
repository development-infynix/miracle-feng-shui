'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { useGlassModal } from '@/home/components/useGlassModal';
import { createAddress, listAddresses, updateAddress, type AddressInput, type SavedAddress } from '@/lib/address';
import { COD_ENABLED } from '@/lib/payment-options';
import { translateProductTitle } from '@/lib/translations';
import AddressDetailsDrawer from '@/profile/components/AddressDetailsDrawer';
import { isCartItemBlocked, isCartItemInCheckout, isCartItemPaused, isCartItemUnavailable, isCheckoutBlocked } from './cartStock';
import { openRazorpay, type RazorpaySuccess } from './razorpayCheckout';
import { useStoreSettings } from '@/lib/useStoreSettings';

const FALLBACK_IMAGE = '/images/miracle.jpeg';
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#222222]';
const sectionTitle = 'block text-[13px] font-semibold text-[#222222]';
const textLink = `group cursor-pointer rounded-sm ${focusRing}`;
const textLinkLabel = 'text-[14px] font-medium text-[#222222] underline underline-offset-2 transition-colors group-hover:underline';
const skeleton = 'animate-pulse rounded-sm bg-[#222222]/10 motion-reduce:animate-none';

type PaymentChoice = 'online' | 'cod';

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.details?.[0]?.message || json.error || 'Something went wrong. Please try again.');
  }
  return json.data;
}

// Waits between attempts to confirm a payment: about 15 seconds in all before the customer is told.
const VERIFY_RETRY_DELAYS_MS = [1500, 2500, 4000, 6000];

/**
 * Confirms a payment Razorpay has taken. A failed attempt (a network drop, a timeout) is tried again:
 * asking twice is safe, and once the order is written (by this or by Razorpay's webhook) the server
 * just hands it back.
 */
async function verifyPayment(response: unknown) {
  let lastError: unknown;
  for (const delay of [0, ...VERIFY_RETRY_DELAYS_MS]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      return await postJson('/api/payments/verify', response);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

/** A selectable row. It's a native radio, so arrow keys and screen readers work as expected. */
function ChoiceRow({ name, checked, disabled, onChange, children, action }: {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className={`relative rounded-lg border bg-white/55 transition-colors ${checked ? 'border-[#222222]' : 'border-white/70'}`}>
      <label className={`flex items-start gap-3 p-3 ${action ? 'pr-16' : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="radio"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-[inherit] accent-[#222222]"
        />
        <span className="min-w-0 flex-1">{children}</span>
      </label>
      {action && <div className="absolute right-3 top-3">{action}</div>}
    </div>
  );
}

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
}

/** Address, payment and summary in one place. The server works out the price and checks stock again. */
export default function CheckoutDrawer({ open, onClose }: CheckoutDrawerProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, count, clearCheckedOut, refreshCart } = useCart();
  const { currency, formatPrice, language, t } = useLocale();
  // Shown with the terms, before the customer pays.
  const noCancellation = useStoreSettings()?.cancellationAllowed === false;

  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [addressesFailed, setAddressesFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentChoice>('online');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  // Blocks a second order from a double tap, before the button has re-rendered as disabled.
  const submitting = useRef(false);
  // Razorpay has taken the money: from here the customer is only ever told it went through, or to check their orders.
  const paymentTaken = useRef(false);
  // The payment couldn't be confirmed in time. It may well have gone through, so the button leads to
  // the customer's orders instead of offering to pay again.
  const [paymentUnconfirmed, setPaymentUnconfirmed] = useState(false);
  // After the order page opens, nothing here should show a message.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addressFormKey, setAddressFormKey] = useState(0);

  const panelRef = useRef<HTMLElement>(null);

  // Nothing can be closed while an order is going through, so the result can't be missed.
  const close = () => {
    if (!processing) onClose();
  };
  const slidIn = useGlassModal({ open, onClose: close, panelRef, initialFocusRef: panelRef });

  // Fresh on every open: prices and stock may have changed, and addresses may have been edited elsewhere.
  useEffect(() => {
    if (!open) return;
    let active = true;
    void refreshCart();
    listAddresses()
      .then((list) => {
        if (!active) return;
        setAddresses(list);
        setAddressesFailed(false);
        setSelectedId((current) =>
          list.some((address) => address.id === current) ? current : (list.find((address) => address.isPrimary) ?? list[0])?.id ?? null
        );
      })
      .catch(() => {
        if (active) setAddressesFailed(true);
      });
    return () => {
      active = false;
    };
  }, [open, attempt, refreshCart]);

  const selected = addresses?.find((address) => address.id === selectedId) ?? null;
  const blocked = isCheckoutBlocked(items);
  const canSubmit = Boolean(selected) && !blocked && items.length > 0 && !processing;
  const chargedInOtherCurrency = currency !== 'INR';

  const blankAddress: AddressInput = {
    type: 'Home',
    isPrimary: false,
    name: session?.user?.name ?? '',
    phone: (session?.user as { phone?: string | null } | undefined)?.phone ?? '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  };

  const openAddressDrawer = (address: SavedAddress | null) => {
    setEditingAddress(address);
    setAddressFormKey((value) => value + 1);
    setAddressDrawerOpen(true);
  };

  const saveAddress = async (address: AddressInput) => {
    let savedId: string;
    if (editingAddress) {
      const { isPrimary: _primary, ...changes } = address;
      savedId = (await updateAddress(editingAddress.id, { ...changes, line2: changes.line2 ?? '' })).id;
    } else {
      savedId = (await createAddress(address)).id;
    }
    setAddresses(await listAddresses());
    setSelectedId(savedId);
    setAddressDrawerOpen(false);
  };

  const finishOrder = (order: { accessToken?: string | null; orderNumber?: string; id?: string; orderId?: string }) => {
    // Paused items weren't ordered, so they stay in the cart.
    clearCheckedOut();
    // The link carries the unguessable token, so the order number doesn't end up in history or shared links.
    if (order.accessToken) {
      router.push(`/order-confirmation?order=${encodeURIComponent(order.accessToken)}`);
      return;
    }
    const reference = order.orderNumber || order.id || order.orderId || '';
    router.push(reference ? `/order-confirmation?orderNumber=${encodeURIComponent(reference)}` : '/order-confirmation');
  };

  const stopProcessing = (message = '') => {
    submitting.current = false;
    setProcessing(false);
    setError(message);
  };

  const payOnline = async (shippingAddress: Record<string, unknown>) => {
    const order = await postJson('/api/payments/create-order', { shippingAddress });

    // The server's total is what gets charged, so stop if the customer hasn't seen that amount.
    if (order.amount !== Math.round(subtotal * 100)) {
      await refreshCart();
      stopProcessing(t('checkout.price_changed', 'A price in your cart has changed. Please check the new total and try again.'));
      return;
    }

    const opened = await openRazorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Miracle Feng Shui',
      description: `Order ${order.orderNumber}`,
      order_id: order.razorpayOrderId,
      prefill: {
        name: selected?.name ?? '',
        email: session?.user?.email ?? '',
        contact: selected?.phone ?? '',
      },
      theme: { color: '#431769' },
      handler: (response: RazorpaySuccess) => {
        paymentTaken.current = true;
        // Two handlers, not .catch: a hiccup while opening the order page mustn't read as a failed payment.
        verifyPayment(response).then(finishOrder, (err) => {
          console.error('Payment verification failed:', err);
          if (!mounted.current) return;
          setPaymentUnconfirmed(true);
          stopProcessing(t('checkout.verify_failed', "We couldn't confirm your payment yet. Please don't pay again. Check your orders in a few minutes, or contact us if it doesn't appear as paid."));
        });
      },
      modal: {
        // Razorpay can close its window after taking the payment; that isn't a cancelled payment.
        ondismiss: () => {
          if (paymentTaken.current) return;
          stopProcessing(t('checkout.payment_not_completed', "Your payment wasn't completed, and you haven't been charged. You can try again."));
        },
      },
    });

    if (!opened) {
      stopProcessing(t('checkout.payment_load_failed', "We couldn't open the payment window, and you haven't been charged. Check your connection and try again."));
    }
  };

  const placeOrder = async () => {
    if (submitting.current || !selected) return;
    submitting.current = true;
    paymentTaken.current = false;
    setProcessing(true);
    setError('');

    const shippingAddress = {
      name: selected.name,
      phone: selected.phone,
      line1: selected.line1,
      line2: selected.line2,
      city: selected.city,
      state: selected.state,
      pincode: selected.pincode,
      country: selected.country,
    };

    try {
      if (payment === 'cod') {
        finishOrder(await postJson('/api/orders', { shippingAddress, paymentMethod: 'COD' }));
      } else {
        await payOnline(shippingAddress);
      }
    } catch (err) {
      // Often stock running out since the cart loaded, so the marked items need to be up to date.
      await refreshCart();
      stopProcessing(err instanceof Error ? err.message : t('checkout.order_failed', "We couldn't place your order. Please try again."));
    }
  };

  const itemsLabel = count === 1 ? t('cart.one_item', '1 item') : t('cart.item_count', '{count} items').replace('{count}', String(count));

  let submitLabel = payment === 'cod' ? t('checkout.place_order_cod', 'Place order') : t('checkout.pay_now', 'Pay now');
  if (processing) submitLabel = t('checkout.processing', 'Processing…');
  else if (paymentUnconfirmed) submitLabel = t('confirmation.view_orders', 'View my orders');

  return (
    <>
      <div inert={!open} className={`fixed inset-0 z-[9998] transition-[visibility] duration-300 ${open ? 'visible' : 'invisible'}`}>
        <div
          aria-hidden="true"
          onClick={close}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${slidIn ? 'opacity-100' : 'opacity-0'}`}
        />

        <aside
          ref={panelRef}
          tabIndex={-1}
          // It takes focus on open for screen readers, and shows no ring because it isn't a control.
          style={{ outline: 'none' }}
          role="dialog"
          aria-modal="true"
          aria-label={t('checkout.drawer_title', 'Checkout')}
          aria-busy={processing}
          className={`bg-white border border-[#E1E3DF] absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col overflow-hidden transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${slidIn ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 pl-6 pr-3">
            <h2>
              <span className="block font-serif text-[24px] font-bold tracking-tight text-[#222222]">{t('checkout.drawer_title', 'Checkout')}</span>
            </h2>
            <button
              type="button"
              aria-label={t('auth.close', 'Close')}
              disabled={processing}
              onClick={close}
              className={`group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              <i aria-hidden="true" className="fa-solid fa-xmark text-[18px] text-[#222222] transition-colors group-hover:underline" />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto no-scrollbar px-4 pb-5 sm:px-6">
            <section aria-labelledby="checkout-address">
              <div className="flex min-h-7 items-center justify-between gap-3">
                <h3 id="checkout-address"><span className={sectionTitle}>{t('checkout.deliver_to', 'Deliver to')}</span></h3>
                {addresses && addresses.length > 0 && (
                  <button type="button" disabled={processing} onClick={() => openAddressDrawer(null)} className={textLink}>
                    <span className={textLinkLabel}>{t('checkout.new_address', 'Add new address')}</span>
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-2">
                {addressesFailed && !addresses && (
                  <p role="alert" className="text-[14px] text-[#222222]">
                    {t('profile.addresses_failed', "Couldn't load your addresses.")}{' '}
                    <button type="button" onClick={() => setAttempt((value) => value + 1)} className={textLink}>
                      <span className={textLinkLabel}>{t('profile.try_again', 'Try again')}</span>
                    </button>
                  </p>
                )}

                {!addresses && !addressesFailed && (
                  <div aria-busy="true" className="space-y-2 rounded-lg bg-white/55 p-3">
                    <div className={`${skeleton} h-4 w-1/3`} />
                    <div className={`${skeleton} h-4 w-5/6`} />
                  </div>
                )}

                {addresses?.length === 0 && (
                  <div className="rounded-lg bg-white/55 p-4 text-center">
                    <p className="text-[14px] text-[#222222]">{t('checkout.no_address', 'Add a delivery address to place your order.')}</p>
                    <button
                      type="button"
                      onClick={() => openAddressDrawer(null)}
                      className={`mt-3 inline-flex h-11 cursor-pointer items-center rounded-lg bg-[#222222] px-5 transition-colors hover:bg-black ${focusRing}`}
                    >
                      <span className="text-[14px] font-semibold text-white">{t('profile.add_address', 'Add address')}</span>
                    </button>
                  </div>
                )}

                {addresses?.map((address) => (
                  <ChoiceRow
                    key={address.id}
                    name="checkout-address"
                    checked={selectedId === address.id}
                    disabled={processing}
                    onChange={() => setSelectedId(address.id)}
                    action={
                      <button
                        type="button"
                        disabled={processing}
                        aria-label={`${t('profile.edit', 'Edit')}: ${address.line1}`}
                        onClick={() => openAddressDrawer(address)}
                        className={textLink}
                      >
                        <span className={textLinkLabel}>{t('profile.edit', 'Edit')}</span>
                      </button>
                    }
                  >
                    <span className="block text-[14px] font-semibold text-[#222222]">
                      {address.name}
                      <span className="ml-2 font-medium text-[#595959]">{t(`profile.type_${address.type.toLowerCase()}`, address.type)}</span>
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-[#222222]">
                      {[address.line1, address.line2, address.city, `${address.state} ${address.pincode}`].filter(Boolean).join(', ')}
                    </span>
                    <span className="mt-0.5 block text-[13px] tabular-nums text-[#595959]">{address.phone}</span>
                  </ChoiceRow>
                ))}
              </div>
            </section>

            <section aria-labelledby="checkout-payment" className="border-t border-[#E1E3DF] pt-4">
              <h3 id="checkout-payment"><span className={sectionTitle}>{t('checkout.payment', 'Payment')}</span></h3>
              <div className="mt-2 space-y-2">
                <ChoiceRow name="checkout-payment" checked={payment === 'online'} disabled={processing} onChange={() => setPayment('online')}>
                  <span className="block text-[14px] font-semibold text-[#222222]">{t('checkout.pay_online', 'Pay online')}</span>
                  <span className="block text-[13px] text-[#595959]">{t('checkout.pay_online_hint', 'Card or UPI, handled securely by Razorpay')}</span>
                </ChoiceRow>
                <ChoiceRow name="checkout-payment" checked={payment === 'cod'} disabled={processing || !COD_ENABLED} onChange={() => setPayment('cod')}>
                  <span className={`block text-[14px] font-semibold ${COD_ENABLED ? 'text-[#222222]' : 'text-[#595959]'}`}>{t('checkout.pay_cod', 'Cash on delivery')}</span>
                  <span className="block text-[13px] text-[#595959]">
                    {COD_ENABLED ? t('checkout.cod_hint', 'Pay when your order arrives') : t('checkout.cod_unavailable', 'Not available right now')}
                  </span>
                </ChoiceRow>
              </div>
            </section>

            <section aria-labelledby="checkout-summary" className="border-t border-[#E1E3DF] pt-4">
              <h3 id="checkout-summary"><span className={sectionTitle}>{t('cart.order_summary', 'Order Summary')}</span></h3>
              <ul className="mt-2 list-none space-y-2.5">
                {items.filter(isCartItemInCheckout).map((item) => (
                  <li key={item.id} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3">
                    <img
                      src={item.product.images[0] || FALLBACK_IMAGE}
                      alt=""
                      className="h-12 w-12 rounded-lg bg-white/50 object-cover"
                      onError={(e) => {
                        const image = e.currentTarget;
                        if (!image.src.endsWith(FALLBACK_IMAGE)) image.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-medium text-[#222222]">
                        {translateProductTitle(item.product.name, language, item.product.id)}
                      </p>
                      <p className="text-[13px] tabular-nums text-[#595959]">{t('profile.qty', 'Qty')} {item.quantity}</p>
                      {isCartItemBlocked(item) && (
                        <p className="text-[13px] font-medium text-[#8F1610]">
                          {isCartItemUnavailable(item) || isCartItemPaused(item)
                            ? t('shop.currently_unavailable', 'Currently unavailable')
                            : item.product.stock === 0
                            ? t('shop.out_of_stock', 'Out of stock')
                            : t('shop.only_left', 'Only {count} left').replace('{count}', String(item.product.stock))}
                        </p>
                      )}
                    </div>
                    <p className="text-[14px] font-semibold tabular-nums text-[#222222]">{formatPrice(item.product.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              <dl className="mt-3 space-y-1.5 border-t border-[#E1E3DF] pt-3 text-[14px] tabular-nums text-[#222222]">
                <div className="flex justify-between gap-3">
                  <dt>{t('cart.items_subtotal', 'Items')} ({itemsLabel})</dt>
                  <dd className="font-medium">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{t('cart.delivery', 'Delivery')}</dt>
                  <dd className="font-medium">{t('cart.delivery_free', 'Free')}</dd>
                </div>
              </dl>

              <p className="mt-3 flex items-center gap-2.5 rounded-lg bg-white/55 p-3 text-[14px] font-medium text-[#222222]">
                <i aria-hidden="true" className="fa-solid fa-truck-fast text-[14px] text-[#222222]" />
                {t('checkout.expected_delivery', 'Expected delivery within 7 days')}
              </p>
              {chargedInOtherCurrency && (
                <p className="mt-2 text-[13px] leading-snug text-[#222222]">
                  {t('checkout.charged_in_inr', 'You will be charged ₹{amount} in Indian rupees. The final amount may vary slightly with your bank’s exchange rate.').replace('{amount}', subtotal.toLocaleString('en-IN'))}
                </p>
              )}
              {noCancellation && (
                <p role="note" className="mt-3 flex items-start gap-2 rounded-lg border border-[#D9A400]/50 bg-[#FFF8E1] px-3 py-2.5 text-[13px] font-medium leading-snug text-[#5C4300]">
                  <i aria-hidden="true" className="fa-solid fa-triangle-exclamation mt-0.5 text-[12px] text-[#B07F00]" />
                  <span>{t('checkout.no_cancellation', 'Currently, orders can’t be cancelled after they’re placed. If an item arrives damaged or wrong, we’ll replace it.')}</span>
                </p>
              )}
              <p className="mt-2 text-[13px] text-[#595959]">
                {t('checkout.agree_prefix', 'By placing your order, you agree to our')}{' '}
                <Link href="/terms" className={textLink}><span className="font-medium text-[#222222] underline underline-offset-2 transition-colors group-hover:underline">{t('footer.terms', 'Terms & Conditions')}</span></Link>{' '}
                {t('checkout.agree_and', 'and')}{' '}
                <Link href="/return-policy" className={textLink}><span className="font-medium text-[#222222] underline underline-offset-2 transition-colors group-hover:underline">{t('checkout.return_policy', 'Return Policy')}</span></Link>.
              </p>
            </section>
          </div>

          <footer className="shrink-0 border-t border-[#E1E3DF] px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 sm:px-6">
            {error && (
              <p role="alert" className="mb-3 text-[14px] font-medium text-[#8F1610]">
                {error}
              </p>
            )}
            {!error && blocked && (
              <p role="alert" className="mb-3 text-[14px] font-medium text-[#8F1610]">
                {t('checkout.fix_stock', 'Some items are no longer available in that quantity. Close this and update your cart to continue.')}
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              <p className="min-w-0 tabular-nums text-[#222222]">
                <span className="block text-[12px] text-[#595959]">{t('product.total', 'Total')}</span>
                <span className="block truncate text-[22px] font-bold leading-tight">{formatPrice(subtotal)}</span>
              </p>
              <button
                type="button"
                disabled={paymentUnconfirmed ? processing : !canSubmit}
                onClick={() => (paymentUnconfirmed ? router.push('/profile?tab=orders') : void placeOrder())}
                className={`h-12 shrink-0 cursor-pointer rounded-lg bg-[#222222] px-8 transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
              >
                <span aria-live="polite" className="text-[15px] font-semibold text-white">{submitLabel}</span>
              </button>
            </div>
          </footer>
        </aside>
      </div>

      <AddressDetailsDrawer
        open={addressDrawerOpen}
        editing={Boolean(editingAddress)}
        formKey={addressFormKey}
        initial={editingAddress ?? blankAddress}
        onClose={() => setAddressDrawerOpen(false)}
        onSubmit={saveAddress}
      />
    </>
  );
}
