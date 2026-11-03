'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useLocale } from '@/context/CurrencyContext';
import { translateProductTitle } from '@/lib/translations';
import {
  SavedAddress,
  AddressType,
  getSavedAddresses,
  saveAddress,
  getPrimaryAddress,
  setPrimaryAddress,
} from '@/lib/address';
import { calculateOrderTax } from '@/lib/tax';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const { country: activeCountry, setCountry: setActiveCountry, formatPrice, currency, isRtl, t, language } = useLocale();

  // Active Checkout Step: 1 = Address, 2 = Payment, 3 = Review
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Saved Addresses State
  const [savedAddressesList, setSavedAddressesList] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [addressType, setAddressType] = useState<AddressType>('Home');
  const [isPrimaryLocation, setIsPrimaryLocation] = useState(false);

  // Address Form State - clean empty initial states with placeholders
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(activeCountry === 'UAE' ? 'United Arab Emirates' : 'India');
  const [fullName, setFullName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [aptSuite, setAptSuite] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState(activeCountry === 'UAE' ? 'Dubai' : 'Haryana');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Load Saved Addresses on mount & select Primary by default
  useEffect(() => {
    const list = getSavedAddresses();
    setSavedAddressesList(list);
    if (list.length > 0) {
      const primary = list.find((a) => a.isPrimary) || list[0];
      setSelectedAddressId(primary.id);
      setFullName(primary.name);
      setPhoneNumber(primary.phone);
      setStreetAddress(primary.line1);
      setAptSuite(primary.line2 || '');
      setCity(primary.city);
      setStateName(primary.state);
      setPincode(primary.pincode);
      setCountry(primary.country || (activeCountry === 'UAE' ? 'United Arab Emirates' : 'India'));
      setAddressType(primary.type || 'Home');
      setShowNewAddressForm(false);
    } else {
      setShowNewAddressForm(true);
      setIsPrimaryLocation(true); // First address is ALWAYS primary
    }
  }, [activeCountry]);

  const selectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.name);
    setPhoneNumber(addr.phone);
    setStreetAddress(addr.line1);
    setAptSuite(addr.line2 || '');
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setCountry(addr.country || (activeCountry === 'UAE' ? 'United Arab Emirates' : 'India'));
    setAddressType(addr.type || 'Home');
    setShowNewAddressForm(false);
  };

  // Sync country and state with global locale context
  useEffect(() => {
    if (activeCountry === 'UAE') {
      setCountry('United Arab Emirates');
      setStateName((prev) =>
        ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].includes(prev)
          ? prev
          : 'Dubai'
      );
    } else {
      setCountry('India');
      setStateName((prev) =>
        [
          'Haryana',
          'Delhi',
          'Maharashtra',
          'Karnataka',
          'Tamil Nadu',
          'Uttar Pradesh',
          'Gujarat',
          'West Bengal',
          'Rajasthan',
          'Kerala',
          'Telangana',
          'Punjab',
          'Andhra Pradesh',
          'Madhya Pradesh',
          'Bihar',
          'Odisha',
          'Assam',
          'Goa',
        ].includes(prev)
          ? prev
          : 'Haryana'
      );
    }
  }, [activeCountry]);

  // Prefill user details from active session when logged in
  useEffect(() => {
    if (session?.user) {
      if (session.user.email) setEmail(session.user.email);
      if (session.user.name && !fullName) setFullName(session.user.name);
    }
  }, [session]);

  // Payment Method State: 'card' | 'upi' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>(
    activeCountry === 'UAE' ? 'card' : 'upi'
  );
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Real cart items and subtotal
  const checkoutItems = items;
  const totalAmount = subtotal;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-save address to address book with Primary and Type preferences
    const { addresses: updated } = saveAddress({
      id: selectedAddressId && !showNewAddressForm ? selectedAddressId : undefined,
      name: fullName,
      phone: phoneNumber,
      line1: streetAddress,
      line2: aptSuite || undefined,
      city,
      state: stateName,
      pincode,
      country,
      type: addressType,
      isPrimary: isPrimaryLocation || savedAddressesList.length === 0,
    });
    setSavedAddressesList(updated);

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    setCheckoutError('');
    setIsProcessing(true);

    const shippingAddress = {
      name: fullName,
      phone: phoneNumber,
      line1: streetAddress,
      line2: aptSuite || undefined,
      city,
      state: stateName,
      pincode,
      country,
    };

    try {
      if (paymentMethod === 'cod') {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shippingAddress,
            paymentMethod: 'COD',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to place COD order');
        }

        const placedOrder = data.data;
        const orderNum = placedOrder?.orderNumber || placedOrder?.id || '';
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('last_order', JSON.stringify(placedOrder));
        }

        if (clearCart) clearCart();
        router.push(orderNum ? `/order-confirmation?orderNumber=${encodeURIComponent(orderNum)}` : '/order-confirmation');
        return;
      }

      // Online payment (Razorpay for UPI and Card)
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        throw new Error(orderData.error || 'Failed to initiate payment');
      }

      const { orderId, razorpayOrderId, amount, currency, keyId } = orderData.data;
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !(window as any).Razorpay) {
        // Fallback demo simulator if external Razorpay CDN is unreachable
        console.warn('Razorpay SDK unavailable; fallback to direct confirmation');
        const fallbackOrder = orderData.data;
        const fallbackNum = fallbackOrder?.orderNumber || fallbackOrder?.orderId || orderId;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('last_order', JSON.stringify(fallbackOrder));
        }
        if (clearCart) clearCart();
        router.push(fallbackNum ? `/order-confirmation?orderNumber=${encodeURIComponent(fallbackNum)}` : '/order-confirmation');
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'Miracle Feng Shui',
        description: `Order Payment for ${orderData.data.orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: fullName,
          email,
          contact: phoneNumber,
        },
        theme: {
          color: '#3A1F62',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed');
            }

            const verifiedOrder = verifyData.data;
            const verifiedNum = verifiedOrder?.orderNumber || verifiedOrder?.id || orderId;
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('last_order', JSON.stringify(verifiedOrder));
            }

            if (clearCart) clearCart();
            router.push(verifiedNum ? `/order-confirmation?orderNumber=${encodeURIComponent(verifiedNum)}` : '/order-confirmation');
          } catch (err: any) {
            setCheckoutError(err.message || 'Payment verification error');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      setCheckoutError(err.message || 'An error occurred during checkout');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#FAF9F5]/40 min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-20 px-4 text-center text-[#222222]">
        <div className="w-16 h-16 rounded-full bg-white border border-[#E1E3DF] flex items-center justify-center text-[#222222] mb-4 shadow-xs">
          <i className="fa-solid fa-bag-shopping text-2xl" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#222222] mb-2">
          {t('cart.basket_empty_title', 'Your basket is empty.')}
        </h2>
        <p className="text-[14px] text-[#595959] max-w-md mb-6 leading-relaxed">
          {t('cart.empty_desc', 'Discover our consecrated Feng Shui cures and crystals to invite abundance into your space.')}
        </p>
        <Link
          href="/shop"
          style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
          className="px-8 py-3 rounded-full bg-[#222222] hover:bg-black text-white text-[14px] font-bold transition-all shadow-sm hover:shadow-md no-underline"
        >
          {t('cart.discover_finds', 'Discover Feng Shui finds')}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F5]/40 min-h-[calc(100vh-140px)] pb-20 text-[#222222]">
      {/* SECURE CHECKOUT SUBHEADER BAR */}
      <div className="bg-white border-b border-[#E1E3DF] py-3.5 mb-6">
        <div className="w-full max-w-[760px] sm:max-w-[800px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#595959] hover:text-[#222222] transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-[12px]" />
            <span>{t('checkout.return_to_cart', 'Return to cart')}</span>
          </Link>

          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0F6C34]">
            <i className="fa-solid fa-lock text-[12px]" />
            <span>{t('checkout.ssl_badge', '256-Bit SSL Encrypted & Consecrated')}</span>
          </div>
        </div>
      </div>

      {/* EXPANDED CHECKOUT CARD (max-w-[760px] sm:max-w-[800px]) */}
      <main className="w-full max-w-[760px] sm:max-w-[800px] mx-auto px-4 sm:px-6 py-2">
        {/* STEP 1: ENTER AN ADDRESS */}
        {step === 1 && (
          <div className="bg-white border border-[#E1E3DF] rounded-[24px] p-6 sm:p-10 shadow-sm animate-in fade-in duration-200">
            {/* Round Brand Logo matching Sign in / Sign up modal */}
            <div className="flex flex-col items-center mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-xs border border-black/10 mb-2">
                <img
                  src="/images/miracle.jpeg"
                  alt="Miracle feng shui"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              <span className="font-serif text-[18px] sm:text-[20px] font-medium tracking-tight text-[#222222]">
                Miracle feng shui
              </span>
            </div>

            <h1 className="text-[22px] sm:text-[24px] font-bold text-center text-[#222222] mb-6">
              {t('checkout.enter_address', 'Delivery Address')}
            </h1>

            {/* SAVED LOCATIONS SELECTOR (If addresses exist) */}
            {savedAddressesList.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Select a Saved Delivery Location
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewAddressForm(!showNewAddressForm);
                      if (!showNewAddressForm) {
                        setStreetAddress('');
                        setAptSuite('');
                        setCity('');
                        setPincode('');
                        setIsPrimaryLocation(false);
                      }
                    }}
                    className="text-xs font-bold text-[#F1641E] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <i className={`fa-solid ${showNewAddressForm ? 'fa-xmark' : 'fa-plus'} text-[11px]`} />
                    <span>{showNewAddressForm ? 'Use Saved Address' : 'Add New Location'}</span>
                  </button>
                </div>

                {!showNewAddressForm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddressesList.map((addr) => {
                      const isSel = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => selectSavedAddress(addr)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative ${
                            isSel
                              ? 'border-[#111111] bg-[#FAF9F5] shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              {addr.isPrimary && (
                                <span className="bg-[#111111] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                                  <i className="fa-solid fa-star text-[8px] text-amber-400" />
                                  <span>Primary</span>
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  addr.type === 'Office'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : addr.type === 'Other'
                                    ? 'bg-gray-100 text-gray-700 border-gray-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {addr.type || 'Home'}
                              </span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSel ? 'border-black bg-black' : 'border-gray-300'}`}>
                              {isSel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>

                          <p className="font-bold text-gray-900 text-xs truncate">{addr.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {addr.line1}
                            {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-1">{addr.phone}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESS FORM (When adding new or no saved addresses) */}
            {(showNewAddressForm || savedAddressesList.length === 0) && (
              <form onSubmit={handleAddressSubmit} className="space-y-4 text-left">
                {/* Location Type Picker */}
                <div>
                  <label className="text-[13px] font-bold text-[#222222] block mb-1.5">
                    Location Badge Type *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Home', 'Office', 'Other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAddressType(t)}
                        style={addressType === t ? { backgroundColor: '#111111', color: '#ffffff', borderColor: '#111111' } : { backgroundColor: '#ffffff', color: '#374151', borderColor: '#E5E7EB' }}
                        className="py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name & Email Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {t('checkout.full_name', 'Full name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.full_name', 'Enter your full name')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {t('checkout.email', 'Email address')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-[13px] font-bold text-[#222222] block mb-1">
                    {t('checkout.street_address', 'Street address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Flat no., Building name, Street"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                  />
                </div>

                {/* Apt / Suite / Landmark */}
                <div>
                  <label className="text-[13px] font-bold text-[#222222] block mb-1">
                    {t('checkout.apt_suite', 'Apt / Suite / Landmark')} <span className="text-[11.5px] text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    value={aptSuite}
                    onChange={(e) => setAptSuite(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                  />
                </div>

                {/* City, State & Pincode Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {t('checkout.city', 'City')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t('checkout.city', 'City / Area')}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                    />
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {country === 'United Arab Emirates' ? 'Emirate' : 'State'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#F1641E] cursor-pointer"
                      >
                        {country === 'United Arab Emirates' ? (
                          <>
                            <option value="Dubai">Dubai</option>
                            <option value="Abu Dhabi">Abu Dhabi</option>
                            <option value="Sharjah">Sharjah</option>
                            <option value="Ajman">Ajman</option>
                            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                            <option value="Fujairah">Fujairah</option>
                            <option value="Umm Al Quwain">Umm Al Quwain</option>
                          </>
                        ) : (
                          <>
                            <option value="Haryana">Haryana</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="West Bengal">West Bengal</option>
                            <option value="Rajasthan">Rajasthan</option>
                            <option value="Kerala">Kerala</option>
                            <option value="Telangana">Telangana</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Andhra Pradesh">Andhra Pradesh</option>
                            <option value="Madhya Pradesh">Madhya Pradesh</option>
                            <option value="Bihar">Bihar</option>
                            <option value="Odisha">Odisha</option>
                            <option value="Assam">Assam</option>
                            <option value="Goa">Goa</option>
                            <option value="Other">Other</option>
                          </>
                        )}
                      </select>
                      <i className="fa-solid fa-chevron-down text-[11px] text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {country === 'United Arab Emirates' ? 'PO Box / Makani / Postal Code' : 'Pincode'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={country === 'United Arab Emirates' ? 'e.g. 00000 or Makani No.' : '6-digit Pincode'}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                    />
                  </div>
                </div>

                {/* Country & Phone number Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {t('checkout.country', 'Country')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={country}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCountry(val);
                          setActiveCountry(val === 'United Arab Emirates' ? 'UAE' : 'India');
                          setStateName(val === 'United Arab Emirates' ? 'Dubai' : 'Haryana');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#F1641E] cursor-pointer"
                      >
                        <option value="India">🇮🇳 India</option>
                        <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                      </select>
                      <i className="fa-solid fa-chevron-down text-[11px] text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[13px] font-bold text-[#222222] block mb-1">
                      {t('checkout.phone_number', 'Phone number')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={country === 'United Arab Emirates' ? '+971 50 123 4567' : '+91 98765 43210'}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E1E3DF] text-[14px] text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                    />
                  </div>
                </div>

                {/* Primary Location Toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800 select-none">
                    <input
                      type="checkbox"
                      checked={isPrimaryLocation}
                      onChange={(e) => setIsPrimaryLocation(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-[#111111]"
                    />
                    <span>Set as my Primary Delivery Location</span>
                  </label>
                </div>

                {/* Continue to Payment CTA */}
                <div className="pt-4">
                  <button
                    type="submit"
                    style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                    className="w-full py-3.5 rounded-full bg-[#222222] hover:bg-black text-white text-[15px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    {t('checkout.continue_to_payment', 'Continue to payment')}
                  </button>
                </div>
              </form>
            )}

            {/* When using a selected saved address (form hidden) */}
            {!showNewAddressForm && savedAddressesList.length > 0 && (
              <form onSubmit={handleAddressSubmit} className="pt-2">
                <button
                  type="submit"
                  style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                  className="w-full py-3.5 rounded-full bg-[#222222] hover:bg-black text-white text-[15px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  {t('checkout.continue_to_payment', 'Deliver to this Location')}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: CHOOSE A PAYMENT METHOD */}
        {step === 2 && (
          <div className="bg-white border border-[#E1E3DF] rounded-[24px] p-5 sm:p-6 shadow-sm animate-in fade-in duration-200">
            {/* Round Brand Logo matching Sign in / Sign up modal */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-xs border border-black/10 mb-2">
                <img
                  src="/images/miracle.jpeg"
                  alt="Miracle feng shui"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              <span className="font-serif text-[17px] sm:text-[18px] font-medium tracking-tight text-[#222222]">
                Miracle feng shui
              </span>
            </div>

            <h1 className="text-[20px] sm:text-[22px] font-bold text-center text-[#222222] mb-5">
              {t('checkout.payment_method', 'Choose a payment method')}
            </h1>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-left">
              {/* Payment Methods Selection Box */}
              <div className="border border-[#E1E3DF] rounded-2xl overflow-hidden divide-y divide-[#E1E3DF]">
                {/* UPI Option */}
                <label
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    paymentMethod === 'upi' ? 'bg-[#FAF9F5]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-white border border-[#E1E3DF] rounded text-[11px] font-bold text-[#0F6C34]">
                      UPI
                    </span>
                    <span className="text-[14px] font-semibold text-[#222222]">
                      UPI
                    </span>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'upi'
                        ? 'border-[#222222]'
                        : 'border-[#CCCCCC]'
                    }`}
                  >
                    {paymentMethod === 'upi' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
                    )}
                  </div>
                </label>

                {/* UPI Input Subform */}
                {paymentMethod === 'upi' && (
                  <div className="p-3.5 bg-[#FAF9F5] border-t border-[#E1E3DF] space-y-2.5 animate-in fade-in">
                    <label className="text-[12px] font-bold text-[#222222] block">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. yourname@okaxis, yourname@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E1E3DF] text-[13px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                    />
                    <p className="text-[11px] text-[#595959]">
                      A payment request will be sent to your UPI app upon order confirmation.
                    </p>
                  </div>
                )}

                {/* Add a card Option */}
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    paymentMethod === 'card' ? 'bg-[#FAF9F5]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-credit-card text-[14px] text-[#595959]" />
                    <span className="text-[14.5px] font-semibold text-[#222222]">
                      Add a card
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-white border border-[#E1E3DF] rounded text-[9px] font-bold text-[#1A1F71]">
                        VISA
                      </span>
                      <span className="px-1.5 py-0.5 bg-white border border-[#E1E3DF] rounded text-[9px] font-bold text-[#EB001B]">
                        MC
                      </span>
                      <span className="px-1.5 py-0.5 bg-white border border-[#E1E3DF] rounded text-[9px] font-bold text-[#006FCF]">
                        AMEX
                      </span>
                      <span className="px-1.5 py-0.5 bg-white border border-[#E1E3DF] rounded text-[9px] font-bold text-[#004B8D]">
                        DC
                      </span>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'card'
                        ? 'border-[#222222]'
                        : 'border-[#CCCCCC]'
                    }`}
                  >
                    {paymentMethod === 'card' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
                    )}
                  </div>
                </label>

                {/* Card Input Subform */}
                {paymentMethod === 'card' && (
                  <div className="p-3.5 bg-[#FAF9F5] border-t border-[#E1E3DF] space-y-3 animate-in fade-in">
                    <div>
                      <label className="text-[12px] font-bold text-[#222222] block mb-1">
                        Card number
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E1E3DF] text-[13px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[12px] font-bold text-[#222222] block mb-1">
                          Expiry
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E1E3DF] text-[13px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-bold text-[#222222] block mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="CVV"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E1E3DF] text-[13px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-[#222222] block mb-1">
                        Name on card
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E1E3DF] text-[13px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#F1641E]"
                      />
                    </div>
                  </div>
                )}

                {/* Cash on Delivery (COD) Option */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors border-t border-[#E1E3DF] ${
                    paymentMethod === 'cod' ? 'bg-[#FAF9F5]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-truck-fast text-[14px] text-[#0F6C34]" />
                    <div>
                      <span className="text-[14.5px] font-semibold text-[#222222] block leading-tight">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-[#595959]">
                        Pay in cash when your package arrives at your doorstep
                      </span>
                    </div>
                  </div>

                  {/* Radio Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'cod'
                        ? 'border-[#222222]'
                        : 'border-[#CCCCCC]'
                    }`}
                  >
                    {paymentMethod === 'cod' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#222222]" />
                    )}
                  </div>
                </label>
              </div>

              {/* 3-Step Progress Bar Indicator */}
              <div className="pt-3 flex items-center justify-between gap-1.5 border-t border-[#E1E3DF]">
                <div className="h-1 flex-1 rounded-full bg-[#222222]" />
                <div className="h-1 flex-1 rounded-full bg-[#222222]" />
                <div className="h-1 flex-1 rounded-full bg-[#E1E3DF]" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2 rounded-full border border-[#222222] hover:bg-[#F5F5F1] text-[13.5px] font-bold text-[#222222] transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                  className="px-7 py-2 rounded-full bg-[#222222] hover:bg-black text-white text-[14px] font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: REVIEW AND PLACE YOUR ORDER */}
        {step === 3 && (
          <div className="bg-white border border-[#E1E3DF] rounded-[24px] p-5 sm:p-6 shadow-sm animate-in fade-in duration-200 space-y-5">
            {/* Round Brand Logo matching Sign in / Sign up modal */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-xs border border-black/10 mb-2">
                <img
                  src="/images/miracle.jpeg"
                  alt="Miracle feng shui"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              <span className="font-serif text-[17px] sm:text-[18px] font-medium tracking-tight text-[#222222]">
                Miracle feng shui
              </span>
            </div>

            <h1 className="text-[20px] sm:text-[22px] font-bold text-center text-[#222222]">
              {t('checkout.title', 'Review and place your order')}
            </h1>

            {/* Delivery & Payment Review Cards */}
            <div className="space-y-3 text-left text-[12.5px]">
              {/* Delivery Address */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E1E3DF]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[13px] text-[#222222]">
                    {t('checkout.delivery_address', 'Delivery address')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[#F1641E] font-bold text-[11.5px] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                <p className="font-semibold text-[#222222]">{fullName}</p>
                <p className="text-[#595959]">{streetAddress}</p>
                {aptSuite && <p className="text-[#595959]">{aptSuite}</p>}
                <p className="text-[#595959]">
                  {city}, {stateName} {pincode}
                </p>
                <p className="text-[#595959]">{country}</p>
                <p className="text-[#595959] mt-0.5">{phoneNumber}</p>
              </div>

              {/* Payment Method */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E1E3DF]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[13px] text-[#222222]">
                    Payment method
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[#F1641E] font-bold text-[11.5px] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
                {paymentMethod === 'card' ? (
                  <div className="text-[13.5px] text-[#595959] space-y-1">
                    <p className="font-semibold text-[#222222] flex items-center gap-1.5">
                      <i className="fa-solid fa-credit-card text-[12px] text-[#595959]" />
                      <span>Debit/Credit Card</span>
                    </p>
                    <p className="text-[11.5px] text-[#595959]">Expires: {cardExpiry}</p>
                    <p className="text-[11.5px] text-[#595959]">Name: {cardHolder}</p>
                  </div>
                ) : paymentMethod === 'cod' ? (
                  <div className="space-y-0.5 text-[#222222]">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-[10px] font-bold text-[#0F6C34] bg-white border border-[#E1E3DF] px-1.5 py-0.5 rounded">
                        COD
                      </span>
                      <span className="text-[13px]">Cash on Delivery (Pay upon arrival)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0.5 text-[#222222]">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-[10px] font-bold text-[#0F6C34] bg-white border border-[#E1E3DF] px-1 py-0.5 rounded">
                        UPI
                      </span>
                      <span>{upiId}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items List */}
            <div className="border-t border-[#E1E3DF] pt-3.5 space-y-2.5">
              <h3 className="font-bold text-[13px] text-left text-[#222222]">
                Order Items ({checkoutItems.length})
              </h3>

              <div className="divide-y divide-[#E1E3DF]/70">
                {checkoutItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.product.images[0]}
                        alt={translateProductTitle(item.product.name, language, item.product.id)}
                        className="w-12 h-12 rounded-lg object-cover border border-[#E1E3DF] shrink-0"
                      />
                      <div>
                        <p className="font-medium text-[13px] text-[#222222] line-clamp-1">
                          {translateProductTitle(item.product.name, language, item.product.id)}
                        </p>
                        <p className="text-[11.5px] text-[#595959]">
                          Qty: {item.quantity} • {item.product.maker}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[13.5px] text-[#222222] shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            {(() => {
              const checkoutTaxBreakdown = calculateOrderTax(
                checkoutItems.map((it) => ({
                  name: translateProductTitle(it.product.name, language, it.product.id),
                  price: it.product.price,
                  quantity: it.quantity,
                })),
                { country, state: stateName, city, pincode },
                { isInclusive: false }
              );
              return (
                <div className="border-t border-[#E1E3DF] pt-3 space-y-1.5 text-[13px]">
                  <div className="flex justify-between text-[#222222]">
                    <span>Item(s) subtotal (Pre-tax)</span>
                    <span>{formatPrice(checkoutTaxBreakdown.totalTaxableAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#222222]">
                    <span>Delivery</span>
                    <span className="text-[#0F6C34] font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-[#222222]">
                    <span>{checkoutTaxBreakdown.taxTitle}</span>
                    <span className="text-[#222222] font-semibold">{formatPrice(checkoutTaxBreakdown.totalTaxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-bold text-[#222222] pt-2 border-t border-[#E1E3DF]">
                    <span>Order total</span>
                    <span>{formatPrice(checkoutTaxBreakdown.totalAmountWithTax)}</span>
                  </div>
                </div>
              );
            })()}

            {/* 3-Step Progress Bar Indicator */}
            <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-[#E1E3DF]">
              <div className="h-1 flex-1 rounded-full bg-[#222222]" />
              <div className="h-1 flex-1 rounded-full bg-[#222222]" />
              <div className="h-1 flex-1 rounded-full bg-[#222222]" />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isProcessing}
                className="px-5 py-2 rounded-full border border-[#222222] hover:bg-[#F5F5F1] text-[13.5px] font-bold text-[#222222] transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                style={{ backgroundColor: '#222222', color: '#FFFFFF' }}
                className="px-7 py-2.5 rounded-full bg-[#222222] hover:bg-black text-white text-[14px] font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
              >
                {isProcessing ? (
                  <span>Processing order...</span>
                ) : (
                  <>
                    <i className="fa-solid fa-lock text-[12px]" />
                    <span>{t('checkout.place_order', 'Place your order')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
