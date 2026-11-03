'use client';

import React, { useState, useEffect } from 'react';
import {
  SavedAddress,
  AddressType,
  getSavedAddresses,
  saveAddress,
  setPrimaryAddress,
  deleteSavedAddress,
} from '@/lib/address';

interface AddressManagerModalProps {
  onClose: () => void;
  onAddressSelect?: (address: SavedAddress) => void;
  userName?: string;
  userPhone?: string;
}

export default function AddressManagerModal({
  onClose,
  onAddressSelect,
  userName = '',
  userPhone = '',
}: AddressManagerModalProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Address Form State
  const [name, setName] = useState(userName);
  const [phone, setPhone] = useState(userPhone);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [type, setType] = useState<AddressType>('Home');
  const [isPrimary, setIsPrimary] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = getSavedAddresses();
    setAddresses(list);
    if (list.length === 0) {
      setIsAddingNew(true);
      setIsPrimary(true); // First address is ALWAYS primary by default
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMakePrimary = (id: string) => {
    const updated = setPrimaryAddress(id);
    setAddresses(updated);
    showToast('✓ Primary delivery location updated');
  };

  const handleDelete = (id: string) => {
    const updated = deleteSavedAddress(id);
    setAddresses(updated);
    showToast('Address removed');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !line1.trim() || !city.trim() || !pincode.trim()) {
      alert('Please fill in all required address fields.');
      return;
    }

    const { addresses: updated, active } = saveAddress({
      type,
      name,
      phone,
      line1,
      line2: line2 || undefined,
      city,
      state,
      pincode,
      country,
      isPrimary: addresses.length === 0 ? true : isPrimary,
    });

    setAddresses(updated);
    setIsAddingNew(false);
    showToast('✓ Address saved successfully!');

    // Reset form
    setLine1('');
    setLine2('');
    setCity('');
    setPincode('');
    setIsPrimary(false);
    setType('Home');

    if (onAddressSelect) {
      onAddressSelect(active);
    }
  };

  const typeBadgeColors: Record<AddressType, { bg: string; text: string; icon: string }> = {
    Home: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: 'fa-house' },
    Office: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: 'fa-building' },
    Other: { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-700', icon: 'fa-location-dot' },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative my-8 sm:my-10 border border-gray-100 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#111111] text-white px-4 py-2 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <i className="fa-solid fa-circle-check text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg border border-emerald-200/50 shrink-0">
              <i className="fa-solid fa-location-dot" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your Primary location and Home / Office shipping addresses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Existing Addresses List */}
        {!isAddingNew && (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 text-lg">
                  <i className="fa-solid fa-map-location-dot" />
                </div>
                <h3 className="font-bold text-sm text-gray-800">No Saved Locations Yet</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">
                  Add your first delivery address. It will automatically be saved as your Primary location.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(true);
                    setIsPrimary(true);
                  }}
                  style={{ backgroundColor: '#111111', color: '#ffffff' }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold hover:bg-black transition-all cursor-pointer shadow-xs inline-flex items-center gap-2 text-white"
                >
                  <i className="fa-solid fa-plus text-xs" />
                  <span>Add First Address</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const badge = typeBadgeColors[addr.type] || typeBadgeColors.Home;

                  return (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border-2 transition-all relative ${
                        addr.isPrimary
                          ? 'border-[#111111] bg-[#FAF9F5] shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {/* Primary Badge */}
                          {addr.isPrimary && (
                            <span className="bg-[#111111] text-white text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1 shadow-2xs">
                              <i className="fa-solid fa-star text-[9px] text-amber-400" />
                              <span>Primary Location</span>
                            </span>
                          )}

                          {/* Location Type Badge (Home / Office / Other) */}
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${badge.bg} ${badge.text}`}
                          >
                            <i className={`fa-solid ${badge.icon} text-[10px]`} />
                            <span>{addr.type}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!addr.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleMakePrimary(addr.id)}
                              className="text-xs font-semibold text-gray-600 hover:text-black hover:underline cursor-pointer"
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(addr.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded-md cursor-pointer transition-colors"
                            title="Delete address"
                          >
                            <i className="fa-solid fa-trash text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* Recipient & Full Address */}
                      <p className="font-bold text-gray-900 text-sm">{addr.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} -{' '}
                        <strong className="text-gray-800">{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <i className="fa-solid fa-phone text-[10px] text-gray-400" />
                        <span>{addr.phone}</span>
                        <span>&bull;</span>
                        <span>{addr.country}</span>
                      </p>
                    </div>
                  );
                })}

                {/* Add Another Location Button */}
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  style={{ border: '1.5px dashed #9CA3AF', backgroundColor: '#FFFFFF', color: '#111111' }}
                  className="w-full py-3 rounded-2xl text-xs font-bold hover:border-black hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <i className="fa-solid fa-plus text-xs" />
                  <span>Add Another Location (Home / Office / Other)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add New Location Form */}
        {isAddingNew && (
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                {addresses.length === 0 ? 'Adding Your Primary Address' : 'Add New Location'}
              </span>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-gray-500 hover:text-black underline cursor-pointer"
                >
                  Back to Saved Locations
                </button>
              )}
            </div>

            {/* Location Type Picker: Home / Office / Other */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Location Type Badge *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Home', 'Office', 'Other'] as const).map((t) => {
                  const isSel = type === t;
                  const b = typeBadgeColors[t];
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      style={isSel ? { backgroundColor: '#111111', color: '#ffffff', borderColor: '#111111' } : { backgroundColor: '#ffffff', color: '#374151', borderColor: '#E5E7EB' }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSel ? 'shadow-xs' : 'hover:bg-gray-50'
                      }`}
                    >
                      <i className={`fa-solid ${b.icon} text-xs`} />
                      <span>{t}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amina Ashraf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Street Address Line 1 */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Flat, House No., Building, Street *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Lotus Grandeur, Veera Desai Road"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>

            {/* Street Address Line 2 (Optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Area, Landmark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Near Infinity Mall, Andheri West"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="400053"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Set As Primary Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800 select-none">
                <input
                  type="checkbox"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer accent-[#111111]"
                />
                <span>Set as my Primary Delivery Location</span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black bg-gray-100 rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                style={{ backgroundColor: '#111111', color: '#ffffff' }}
                className="px-6 py-2 text-xs font-bold bg-[#111111] hover:bg-black text-white rounded-full shadow-xs cursor-pointer"
              >
                Save &amp; Use Location
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
