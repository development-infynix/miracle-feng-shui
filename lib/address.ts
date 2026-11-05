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

export type AddressInput = Omit<SavedAddress, 'id'>;

// Addresses used to be kept only in the browser. Anything still here moves to the account once.
const OLD_STORAGE_KEY = 'mfs_saved_addresses_v2';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.details?.[0]?.message || json.error || 'Something went wrong. Please try again.');
  }
  return json.data as T;
}

const send = <T,>(url: string, method: string, body?: unknown) =>
  request<T>(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

function fromApi(address: any): SavedAddress {
  return {
    id: address.id,
    type: address.type || 'Home',
    isPrimary: Boolean(address.isDefault),
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 || undefined,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country || 'India',
  };
}

function toApi({ isPrimary, ...address }: Partial<AddressInput>) {
  return { ...address, ...(isPrimary !== undefined && { isDefault: isPrimary }) };
}

function readOldAddresses(): SavedAddress[] {
  try {
    const raw = localStorage.getItem(OLD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearOldAddresses() {
  try {
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {
    // Storage can be blocked, and then there was nothing to clear.
  }
}

/** The signed-in customer's addresses, primary first. */
export async function listAddresses(): Promise<SavedAddress[]> {
  const addresses = (await request<any[]>('/api/addresses')).map(fromApi);
  const old = readOldAddresses();
  if (old.length === 0) return addresses;

  // An account that already has addresses keeps them, and the browser's copy is dropped.
  if (addresses.length > 0) {
    clearOldAddresses();
    return addresses;
  }

  // One that can't be saved, such as an incomplete one, is skipped so the rest still move across.
  const ordered = [...old].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
  for (const { id: _id, ...address } of ordered) {
    await send('/api/addresses', 'POST', toApi(address)).catch(() => null);
  }
  clearOldAddresses();
  return (await request<any[]>('/api/addresses')).map(fromApi);
}

export async function createAddress(address: AddressInput) {
  return fromApi(await send('/api/addresses', 'POST', toApi(address)));
}

export async function updateAddress(id: string, address: Partial<AddressInput>) {
  return fromApi(await send(`/api/addresses/${encodeURIComponent(id)}`, 'PATCH', toApi(address)));
}

export async function setPrimaryAddress(id: string) {
  return updateAddress(id, { isPrimary: true });
}

export async function deleteAddress(id: string) {
  await send(`/api/addresses/${encodeURIComponent(id)}`, 'DELETE');
}
