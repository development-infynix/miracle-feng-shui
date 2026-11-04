// Shop filters live in the URL. This file turns them into a server query and back into links.
// Plain data only, so both the server page and client components can import it.

export const SHOP_PAGE_SIZE = 24;

export type ShopSort = 'relevancy' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
export type ShopPrice = 'all' | 'under-1000' | '1000-1500' | '1500-2000' | 'over-2000';

export interface ShopFilters {
  category: string;
  q: string;
  sort: ShopSort;
  price: ShopPrice;
  freeShipping: boolean;
  onSale: boolean;
}

export interface ShopCategory {
  id: string;
  name: string;
  productCount: number;
}

const SORTS: ShopSort[] = ['relevancy', 'price-asc', 'price-desc', 'rating', 'newest'];
const PRICES: ShopPrice[] = ['all', 'under-1000', '1000-1500', '1500-2000', 'over-2000'];

const API_SORT: Record<ShopSort, string> = {
  relevancy: 'relevancy',
  'price-asc': 'price_asc',
  'price-desc': 'price_desc',
  rating: 'rating',
  newest: 'newest',
};

const PRICE_RANGE: Record<ShopPrice, { minPrice?: string; maxPrice?: string }> = {
  all: {},
  'under-1000': { maxPrice: '999.99' },
  '1000-1500': { minPrice: '1000', maxPrice: '1500' },
  '1500-2000': { minPrice: '1500.01', maxPrice: '2000' },
  'over-2000': { minPrice: '2000.01' },
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

export function parseShopFilters(params: RawParams): ShopFilters {
  const sort = first(params.sort) as ShopSort;
  const price = first(params.price) as ShopPrice;
  const category = first(params.category);
  return {
    category: category === 'All' ? '' : category,
    q: first(params.q).trim(),
    sort: SORTS.includes(sort) ? sort : 'relevancy',
    price: PRICES.includes(price) ? price : 'all',
    freeShipping: first(params.freeShipping) === 'true',
    onSale: first(params.onSale) === 'true',
  };
}

/** The query for /api/products, or for productQuerySchema on the server. */
export function toProductQuery(filters: ShopFilters, page: number): Record<string, string> {
  return {
    ...(filters.category && { category: filters.category }),
    ...(filters.q && { q: filters.q }),
    ...(filters.freeShipping && { freeShipping: 'true' }),
    ...(filters.onSale && { onSale: 'true' }),
    ...PRICE_RANGE[filters.price],
    sort: API_SORT[filters.sort],
    page: String(page),
    pageSize: String(SHOP_PAGE_SIZE),
  };
}

/** The /shop URL for a set of filters, leaving out anything at its default. */
export function shopUrl(filters: ShopFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.q) params.set('q', filters.q);
  if (filters.sort !== 'relevancy') params.set('sort', filters.sort);
  if (filters.price !== 'all') params.set('price', filters.price);
  if (filters.freeShipping) params.set('freeShipping', 'true');
  if (filters.onSale) params.set('onSale', 'true');
  const query = params.toString();
  return query ? `/shop?${query}` : '/shop';
}

export const NO_FILTERS: ShopFilters = {
  category: '',
  q: '',
  sort: 'relevancy',
  price: 'all',
  freeShipping: false,
  onSale: false,
};

/** Filters that narrow the list. Sort only reorders it. */
export function hasNarrowingFilters(filters: ShopFilters): boolean {
  return Boolean(filters.category || filters.q || filters.price !== 'all' || filters.freeShipping || filters.onSale);
}

export function hasActiveFilters(filters: ShopFilters): boolean {
  return hasNarrowingFilters(filters) || filters.sort !== 'relevancy';
}

/** How many choices the Filters button reports. A search isn't one: it came from the search box. */
export function countActiveFilters(filters: ShopFilters): number {
  return [
    filters.category,
    filters.price !== 'all',
    filters.freeShipping,
    filters.onSale,
    filters.sort !== 'relevancy',
  ].filter(Boolean).length;
}

export function getPriceOptions(
  t: (key: string, fallback?: string) => string,
  formatPrice: (amount: number) => string
): { value: ShopPrice; label: string }[] {
  return [
    { value: 'all', label: t('shop.any_price', 'Any price') },
    { value: 'under-1000', label: `${t('shop.under_price', 'Under')} ${formatPrice(1000)}` },
    { value: '1000-1500', label: `${formatPrice(1000)} – ${formatPrice(1500)}` },
    { value: '1500-2000', label: `${formatPrice(1500)} – ${formatPrice(2000)}` },
    { value: 'over-2000', label: `${t('shop.over_price', 'Over')} ${formatPrice(2000)}` },
  ];
}
