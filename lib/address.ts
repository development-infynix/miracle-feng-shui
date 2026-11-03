export type AddressType = 'Home' | 'Office' | 'Other';

export interface SavedAddress {
  id: string;
  type: AddressType;
  isPrimary: boolean;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const STORAGE_KEY = 'mfs_saved_addresses_v2';

export function getSavedAddresses(): SavedAddress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAddress(address: Partial<SavedAddress> & { name: string; phone: string; line1: string; city: string; state: string; pincode: string }): { addresses: SavedAddress[]; active: SavedAddress } {
  if (typeof window === 'undefined') {
    const dummy: SavedAddress = {
      id: address.id || 'addr-1',
      type: address.type || 'Home',
      isPrimary: true,
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country || 'India',
    };
    return { addresses: [dummy], active: dummy };
  }

  const existing = getSavedAddresses();
  const isFirst = existing.length === 0;
  const shouldBePrimary = isFirst || !!address.isPrimary;

  const id = address.id || `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const type: AddressType = address.type || 'Home';

  const newEntry: SavedAddress = {
    id,
    type,
    isPrimary: shouldBePrimary,
    name: address.name.trim(),
    phone: address.phone.trim(),
    line1: address.line1.trim(),
    line2: address.line2?.trim() || undefined,
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
    country: address.country || (address.state?.toLowerCase().includes('dubai') || address.state?.toLowerCase().includes('abu dhabi') ? 'United Arab Emirates' : 'India'),
  };

  let updatedList: SavedAddress[] = [];

  const existingIdx = existing.findIndex((a) => a.id === id);
  if (existingIdx >= 0) {
    // Update existing
    updatedList = existing.map((a) => {
      if (a.id === id) return newEntry;
      if (shouldBePrimary) return { ...a, isPrimary: false };
      return a;
    });
  } else {
    // Add new
    if (shouldBePrimary) {
      updatedList = [newEntry, ...existing.map((a) => ({ ...a, isPrimary: false }))];
    } else {
      updatedList = [...existing, newEntry];
    }
  }

  // Ensure at least one address is marked primary
  if (!updatedList.some((a) => a.isPrimary) && updatedList.length > 0) {
    updatedList[0].isPrimary = true;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch {}

  return {
    addresses: updatedList,
    active: newEntry,
  };
}

export function setPrimaryAddress(id: string): SavedAddress[] {
  if (typeof window === 'undefined') return [];
  const existing = getSavedAddresses();
  const updated = existing.map((a) => ({
    ...a,
    isPrimary: a.id === id,
  }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteSavedAddress(id: string): SavedAddress[] {
  if (typeof window === 'undefined') return [];
  const existing = getSavedAddresses();
  const updated = existing.filter((a) => a.id !== id);
  if (updated.length > 0 && !updated.some((a) => a.isPrimary)) {
    updated[0].isPrimary = true;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getPrimaryAddress(): SavedAddress | null {
  const addresses = getSavedAddresses();
  return addresses.find((a) => a.isPrimary) || (addresses.length > 0 ? addresses[0] : null);
}
