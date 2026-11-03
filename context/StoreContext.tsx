'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  products as initialProducts,
  categories,
} from '@/lib/placeholder-data';

export type HomeSectionId =
  | 'hero'
  | 'featured_interests'
  | 'auspicious_collections'
  | 'prosperity_gifts'
  | 'special_gifts'
  | 'todays_deals'
  | 'fashion_guide'
  | 'sacred_knowledge';

export interface HomeSectionConfig {
  id: HomeSectionId;
  name: string;
  enabled: boolean;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
}

// 1. HERO SLIDES & RIGHT CARD
export interface HeroSlideItem {
  id: string;
  image: string;
  alt: string;
}

export interface HeroRightCard {
  badge: string;
  title: string;
  subtitle: string;
  link: string;
  image: string;
}

export interface HeroBannerData {
  title: string;
  ctaText: string;
  ctaLink: string;
  slides: HeroSlideItem[];
  rightCard: HeroRightCard;
}

// 2. PROSPERITY HERO CATEGORY CARDS
export interface ProsperityHeroCard {
  id: string;
  title: string;
  slug: string;
  image: string;
}

// 3. SPECIAL GIFTS
export interface SpecialGiftItem {
  id: string;
  name: string;
  slug: string;
  image: string;
}

// 4. ENERGY & HARMONY GUIDE (CURATED STYLE & CHI)
export interface GuideCardItem {
  id: string;
  title: string;
  slug: string;
  image: string;
  videoUrl?: string;
  tag?: string;
}

// 5. SACRED KNOWLEDGE / BLOG POSTS
export interface BlogPostItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  slug: string;
  image: string;
  collage?: string[];
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface StoreOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
}

export const defaultSections: HomeSectionConfig[] = [
  {
    id: 'hero',
    name: 'Hero Promotional Banner',
    enabled: true,
    title: 'Invite wealth, peace & positive energy home',
    subtitle: 'Taoist master-blessed authentic talismans, consecrated jewelry, and handcrafted Feng Shui cures.',
    ctaText: 'Shop Feng Shui',
    ctaLink: '/shop?q=feng+shui',
    badge: 'Conscious Craftsmanship',
  },
  {
    id: 'featured_interests',
    name: 'Jump into Featured Interests',
    enabled: true,
    title: 'Jump into featured interests',
    subtitle: 'Explore authentic Feng Shui cures, jewelry, candles, and meditation crystals.',
  },
  {
    id: 'auspicious_collections',
    name: 'Auspicious Collections',
    enabled: true,
    title: 'Discover our most auspicious collections',
    subtitle: 'Hand-picked talismans aligned with Bagua energy sectors.',
  },
  {
    id: 'prosperity_gifts',
    name: 'Prosperity Gifts & Thumbnail Picks',
    enabled: true,
    title: 'Miracle feng shui-special gifts for prosperity',
    subtitle: 'Consciously crafted prosperity essentials and customer favorites.',
    ctaText: 'Get inspired',
    ctaLink: '/shop?category=Feng%20Shui%20Decor',
  },
  {
    id: 'special_gifts',
    name: 'Gifts As Special As They Are',
    enabled: true,
    title: 'Gifts as special as they are',
    subtitle: 'Curated sets for new beginnings, housewarming, and protection.',
  },
  {
    id: 'todays_deals',
    name: "Today's Auspicious Deals",
    enabled: true,
    title: "Today's auspicious deals",
    subtitle: 'Special blessing discounts ending tonight.',
    badge: 'Limited-time Chi Boost',
  },
  {
    id: 'fashion_guide',
    name: 'Energy & Harmony Visual Guide',
    enabled: true,
    title: "Miracle feng shui's Guide to Energy & Harmony",
    subtitle: 'From sacred brass talismans to handcrafted healing crystals, everything you need to balance your home and spirit.',
    badge: 'Curated Style & Chi',
    ctaText: 'Shop these sacred finds',
    ctaLink: '/shop?category=Feng%20Shui%20Decor',
  },
  {
    id: 'sacred_knowledge',
    name: 'Sacred Knowledge & Articles',
    enabled: true,
    title: 'From our Feng Shui Masters & Curators',
    subtitle: 'Ancient wisdom and modern placement tips for high Chi living.',
  },
];

export const defaultHeroBanner: HeroBannerData = {
  title: 'Invite wealth, peace & positive energy home',
  ctaText: 'Shop Feng Shui',
  ctaLink: '/shop?q=feng+shui',
  slides: [
    {
      id: 'slide-1',
      image: '/images/feng_shui_hero_banner.jpg',
      alt: 'Feng Shui Prosperity Bonsai Tree & Brass Dragon Turtle',
    },
    {
      id: 'slide-2',
      image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
      alt: 'Taoist Master Blessed Five Emperor Coins',
    },
    {
      id: 'slide-3',
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
      alt: 'Citrine Crystal Bonsai Money Tree',
    },
    {
      id: 'slide-4',
      image: 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=600&q=80',
      alt: 'Brass Dragon Turtle',
    },
  ],
  rightCard: {
    badge: 'Harmonious Living',
    title: 'Sacred Feng Shui Finds',
    subtitle: 'Explore energy decor',
    link: '/shop?category=Feng%20Shui%20Decor',
    image: '/images/feng_shui_sacred_finds.jpg',
  },
};

export const defaultProsperityCards: ProsperityHeroCard[] = [
  {
    id: 'prosp-1',
    title: 'Feng Shui Wealth Corner Starter Kits',
    slug: 'Feng Shui Decor',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    id: 'prosp-2',
    title: 'Cinnabar & Obsidian Talismans',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    id: 'prosp-3',
    title: 'Natural Citrine & Amethyst Money Trees',
    slug: 'Crystals & Trees',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
  },
];

export const defaultSpecialGifts: SpecialGiftItem[] = [
  {
    id: 'sg-1',
    name: 'Protection Mirrors & Charms',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
  },
  {
    id: 'sg-2',
    name: 'Abundance Candles',
    slug: 'Feng Shui Candles',
    image: 'https://i.etsystatic.com/59148376/r/il/5c6a68/7037517033/il_fullxfull.7037517033_rp73.jpg',
  },
  {
    id: 'sg-3',
    name: 'Pixiu Luck Bracelets',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
  },
  {
    id: 'sg-4',
    name: 'Cinnabar Protection',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    id: 'sg-5',
    name: 'Wealth Coins & Charms',
    slug: 'Feng Shui Decor',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    id: 'sg-6',
    name: 'Tibetan Sound Bowls',
    slug: 'Zen & Meditation',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
  },
];

export const defaultGuideCards: GuideCardItem[] = [
  {
    id: 'gc-1',
    title: 'Brass Bagua Pendant Necklace | Feng Shui I Ching',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
    videoUrl: '/videos/fashion-craft-3.mp4',
    tag: 'Video Cure',
  },
  {
    id: 'gc-2',
    title: 'Feng Shui 2026 28 Hums Safety Talisman Keychain',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/18528884/r/il/4255ed/7574072434/il_fullxfull.7574072434_8ebu.jpg',
    videoUrl: '/videos/fashion-craft-2.mp4',
    tag: 'Video Protection',
  },
  {
    id: 'gc-3',
    title: 'S925 Pixiu Ring, Feng Shui Wealth Luck Amulet',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
    tag: 'Wealth Amulet',
  },
  {
    id: 'gc-4',
    title: 'Blackwood Feng Shui Amulet Necklace: Tree of Life',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/28306871/r/il/791365/7159126948/il_fullxfull.7159126948_ebgf.jpg',
    tag: 'Tree of Life',
  },
  {
    id: 'gc-5',
    title: 'Taoist Master Blessed Five Emperor Coins',
    slug: 'Feng Shui Decor',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
    tag: 'Prosperity Coins',
  },
  {
    id: 'gc-6',
    title: 'Feng Shui Lucky Dragon Incense Burner, Vintage',
    slug: 'Feng Shui Candles',
    image: 'https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg',
    videoUrl: '/videos/fashion-craft-1.mp4',
    tag: 'Dragon Censer',
  },
];

export const defaultBlogPosts: BlogPostItem[] = [
  {
    id: 'blog-1',
    category: 'Shopping Guides',
    title: "How to activate your home's southeast wealth corner with Feng Shui",
    summary:
      "Discover the exact placements for water elements, citrine crystals, and dragon censers to amplify your home's prosperity.",
    slug: '/shop?category=Feng%20Shui%20Decor',
    image:
      'https://i.etsystatic.com/19246526/r/il/35c642/6558547910/il_fullxfull.6558547910_qiy1.jpg',
    collage: [
      'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
      'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 'blog-2',
    category: 'Energy Balance',
    title: 'The secret sacred power of Tibetan Singing Bowls for grounding space',
    summary:
      'Harness sound resonance to dissipate stagnant energy, clear negative vibes, and restore tranquility across your living sanctuary.',
    slug: '/shop?category=Zen%20%26%20Meditation',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'blog-3',
    category: 'Sacred Decor',
    title: '5 Master rules for placing water fountains and wealth mirrors',
    summary:
      'Avoid common chi flow errors and create magnetic wealth channels through proper elemental orientation and balance.',
    slug: '/shop?category=Feng%20Shui%20Decor',
    image:
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
    collage: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80',
      'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
      'https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg',
      'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
    ],
  },
];

const sampleOrders: StoreOrder[] = [
  {
    id: 'ord-1001',
    orderNumber: 'MFS-82914',
    date: '2026-09-14 14:32',
    customerName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Lotus Towers, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400053',
    items: [
      {
        productId: 'j4',
        productName: 'Temple Blessed 2027 Tai Sui Protection Bracelet',
        price: 1464,
        quantity: 1,
        image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
      },
      {
        productId: 'd1',
        productName: 'Taoist Master Blessed Five Emperor Coins',
        price: 4008,
        quantity: 1,
        image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
      },
    ],
    totalAmount: 5472,
    paymentMethod: 'UPI / Online Payment',
    status: 'Shipped',
  },
  {
    id: 'ord-1002',
    orderNumber: 'MFS-82915',
    date: '2026-09-15 10:15',
    customerName: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '+91 98234 56789',
    address: 'B-12, Shanti Niketan Society, Satellite',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    items: [
      {
        productId: 'j2',
        productName: 'S925 Pixiu Ring, Wealth Luck Amulet',
        price: 3462,
        quantity: 1,
        image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
      },
    ],
    totalAmount: 3462,
    paymentMethod: 'Cash on Delivery',
    status: 'Pending',
  },
];

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => Promise<boolean>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  resetProducts: () => void;

  // Sections (Layout & Titles)
  sections: HomeSectionConfig[];
  moveSection: (index: number, direction: 'up' | 'down') => void;
  toggleSection: (id: HomeSectionId) => void;
  updateSection: (id: HomeSectionId, data: Partial<HomeSectionConfig>) => void;
  resetSections: () => void;

  // 1. Hero Banner Content
  heroBanner: HeroBannerData;
  updateHeroBanner: (data: Partial<HeroBannerData>) => void;
  addHeroSlide: (slide: Omit<HeroSlideItem, 'id'> & { id?: string }) => void;
  updateHeroSlide: (id: string, slide: Partial<HeroSlideItem>) => void;
  deleteHeroSlide: (id: string) => void;

  // 2. Prosperity Gifts Hero Cards
  prosperityCards: ProsperityHeroCard[];
  addProsperityCard: (card: Omit<ProsperityHeroCard, 'id'> & { id?: string }) => void;
  updateProsperityCard: (id: string, card: Partial<ProsperityHeroCard>) => void;
  deleteProsperityCard: (id: string) => void;

  // 3. Special Gifts
  specialGifts: SpecialGiftItem[];
  addSpecialGift: (gift: Omit<SpecialGiftItem, 'id'> & { id?: string }) => void;
  updateSpecialGift: (id: string, gift: Partial<SpecialGiftItem>) => void;
  deleteSpecialGift: (id: string) => void;

  // 4. Energy & Harmony Guide Cards
  guideCards: GuideCardItem[];
  addGuideCard: (card: Omit<GuideCardItem, 'id'> & { id?: string }) => void;
  updateGuideCard: (id: string, card: Partial<GuideCardItem>) => void;
  deleteGuideCard: (id: string) => void;

  // 5. Blog Posts
  blogPosts: BlogPostItem[];
  addBlogPost: (post: Omit<BlogPostItem, 'id'> & { id?: string }) => void;
  updateBlogPost: (id: string, post: Partial<BlogPostItem>) => void;
  deleteBlogPost: (id: string) => void;

  // Global Reset for Homepage Content
  resetHomepageContent: () => void;

  // Orders & Fulfillment
  orders: StoreOrder[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
  addOrder: (order: Omit<StoreOrder, 'id'>) => void;
  // Live Metrics & Counters
  ordersLeftToConfirm: number;
  ordersLeftToPack: number;
  ordersInTransit: number;
  settledBalance: number;
  pendingBalance: number;
  totalOrderRevenue: number;

  // Categories
  categories: string[];
  categoriesList: Array<{
    id: string;
    name: string;
    slug: string;
    image?: string;
    imageUrl?: string;
    description?: string;
    productCount?: number;
  }>;
  refreshCategories: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;

  isLoaded: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Storage keys
const HERO_KEY = 'mfs_hero_banner_v2';
const PROSPERITY_KEY = 'mfs_prosperity_cards_v2';
const SPECIAL_GIFTS_KEY = 'mfs_special_gifts_v2';
const GUIDE_CARDS_KEY = 'mfs_guide_cards_v2';
const BLOG_POSTS_KEY = 'mfs_blog_posts_v2';
const SECTIONS_KEY = 'mfs_sections_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sections, setSections] = useState<HomeSectionConfig[]>(defaultSections);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [categoriesList, setCategoriesList] = useState<
    Array<{
      id: string;
      name: string;
      slug: string;
      image?: string;
      imageUrl?: string;
      description?: string;
      productCount?: number;
    }>
  >([]);
  const [categoriesState, setCategoriesState] = useState<string[]>([...categories]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Dynamic Homepage Content State
  const [heroBanner, setHeroBanner] = useState<HeroBannerData>(defaultHeroBanner);
  const [prosperityCards, setProsperityCards] = useState<ProsperityHeroCard[]>(defaultProsperityCards);
  const [specialGifts, setSpecialGifts] = useState<SpecialGiftItem[]>(defaultSpecialGifts);
  const [guideCards, setGuideCards] = useState<GuideCardItem[]>(defaultGuideCards);
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>(defaultBlogPosts);

  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategoriesList(data.data);
          const names = ['All', ...data.data.map((c: any) => c.name)];
          setCategoriesState(names);
        }
      }
    } catch (e) {
      console.warn('Could not fetch categories from API:', e);
    }
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products?pageSize=100');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items) && data.data.items.length > 0) {
          setProducts(data.data.items);
        }
      }
    } catch (e) {
      console.warn('Could not refresh products from API:', e);
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      }
    } catch (e) {
      console.warn('Could not refresh orders from API:', e);
    }
  };

  // Load from local storage and backend on mount
  useEffect(() => {
    let isMounted = true;

    // 1. Check local storage for customized homepage content
    if (typeof window !== 'undefined') {
      try {
        const savedHero = localStorage.getItem(HERO_KEY);
        if (savedHero) setHeroBanner(JSON.parse(savedHero));

        const savedProsperity = localStorage.getItem(PROSPERITY_KEY);
        if (savedProsperity) setProsperityCards(JSON.parse(savedProsperity));

        const savedSpecial = localStorage.getItem(SPECIAL_GIFTS_KEY);
        if (savedSpecial) setSpecialGifts(JSON.parse(savedSpecial));

        const savedGuide = localStorage.getItem(GUIDE_CARDS_KEY);
        if (savedGuide) setGuideCards(JSON.parse(savedGuide));

        const savedBlog = localStorage.getItem(BLOG_POSTS_KEY);
        if (savedBlog) setBlogPosts(JSON.parse(savedBlog));

        const savedSections = localStorage.getItem(SECTIONS_KEY);
        if (savedSections) setSections(JSON.parse(savedSections));
      } catch (e) {
        console.warn('Error reading from local storage:', e);
      }
    }

    // 2. Fetch real data from database API
    async function loadData() {
      try {
        try {
          const res = await fetch('/api/products?pageSize=100');
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data?.items) && data.data.items.length > 0) {
              if (isMounted) setProducts(data.data.items);
            }
          }
        } catch (e) {
          console.warn('Could not fetch products from API:', e);
        }

        // Only fetch protected admin endpoints if browsing the /admin portal
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          try {
            const res = await fetch('/api/admin/homepage');
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                if (isMounted) setSections(data.data);
              }
            }
          } catch (e) {
            // ignore admin unauthorized on guest pages
          }

          try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
              const data = await res.json();
              if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                if (isMounted) setOrders(data.data);
              }
            }
          } catch (e) {
            // ignore admin unauthorized on guest pages
          }
        }

        try {
          await refreshCategories();
        } catch (e) {
          console.warn('Could not load categories:', e);
        }
      } catch (err) {
        console.error('Error loading store data:', err);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state helpers
  const saveToStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error(`Failed to save ${key} to localStorage:`, e);
      }
    }
  };

  // 1. HERO BANNER ACTIONS
  const updateHeroBanner = (data: Partial<HeroBannerData>) => {
    setHeroBanner((prev) => {
      const updated = {
        ...prev,
        ...data,
        rightCard: {
          ...prev.rightCard,
          ...(data.rightCard || {}),
        },
      };
      saveToStorage(HERO_KEY, updated);
      return updated;
    });
  };

  const addHeroSlide = (slide: Omit<HeroSlideItem, 'id'> & { id?: string }) => {
    setHeroBanner((prev) => {
      const newSlide: HeroSlideItem = {
        id: slide.id || `slide-${Date.now()}`,
        image: slide.image,
        alt: slide.alt || 'Feng Shui Hero Artwork',
      };
      const updated = { ...prev, slides: [...prev.slides, newSlide] };
      saveToStorage(HERO_KEY, updated);
      return updated;
    });
  };

  const updateHeroSlide = (id: string, slideUpdate: Partial<HeroSlideItem>) => {
    setHeroBanner((prev) => {
      const updatedSlides = prev.slides.map((s) => (s.id === id ? { ...s, ...slideUpdate } : s));
      const updated = { ...prev, slides: updatedSlides };
      saveToStorage(HERO_KEY, updated);
      return updated;
    });
  };

  const deleteHeroSlide = (id: string) => {
    setHeroBanner((prev) => {
      if (prev.slides.length <= 1) {
        alert('At least one hero slide must remain.');
        return prev;
      }
      const updatedSlides = prev.slides.filter((s) => s.id !== id);
      const updated = { ...prev, slides: updatedSlides };
      saveToStorage(HERO_KEY, updated);
      return updated;
    });
  };

  // 2. PROSPERITY HERO CARDS ACTIONS
  const addProsperityCard = (card: Omit<ProsperityHeroCard, 'id'> & { id?: string }) => {
    setProsperityCards((prev) => {
      const newCard: ProsperityHeroCard = {
        id: card.id || `prosp-${Date.now()}`,
        title: card.title,
        slug: card.slug || 'Feng Shui Decor',
        image: card.image,
      };
      const updated = [...prev, newCard];
      saveToStorage(PROSPERITY_KEY, updated);
      return updated;
    });
  };

  const updateProsperityCard = (id: string, cardUpdate: Partial<ProsperityHeroCard>) => {
    setProsperityCards((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...cardUpdate } : c));
      saveToStorage(PROSPERITY_KEY, updated);
      return updated;
    });
  };

  const deleteProsperityCard = (id: string) => {
    setProsperityCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(PROSPERITY_KEY, updated);
      return updated;
    });
  };

  // 3. SPECIAL GIFTS ACTIONS
  const addSpecialGift = (gift: Omit<SpecialGiftItem, 'id'> & { id?: string }) => {
    setSpecialGifts((prev) => {
      const newGift: SpecialGiftItem = {
        id: gift.id || `sg-${Date.now()}`,
        name: gift.name,
        slug: gift.slug || 'Feng Shui Jewelry',
        image: gift.image,
      };
      const updated = [...prev, newGift];
      saveToStorage(SPECIAL_GIFTS_KEY, updated);
      return updated;
    });
  };

  const updateSpecialGift = (id: string, giftUpdate: Partial<SpecialGiftItem>) => {
    setSpecialGifts((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...giftUpdate } : g));
      saveToStorage(SPECIAL_GIFTS_KEY, updated);
      return updated;
    });
  };

  const deleteSpecialGift = (id: string) => {
    setSpecialGifts((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      saveToStorage(SPECIAL_GIFTS_KEY, updated);
      return updated;
    });
  };

  // 4. ENERGY & HARMONY GUIDE ACTIONS
  const addGuideCard = (card: Omit<GuideCardItem, 'id'> & { id?: string }) => {
    setGuideCards((prev) => {
      const newCard: GuideCardItem = {
        id: card.id || `gc-${Date.now()}`,
        title: card.title,
        slug: card.slug || 'Feng Shui Jewelry',
        image: card.image,
        videoUrl: card.videoUrl,
        tag: card.tag,
      };
      const updated = [...prev, newCard];
      saveToStorage(GUIDE_CARDS_KEY, updated);
      return updated;
    });
  };

  const updateGuideCard = (id: string, cardUpdate: Partial<GuideCardItem>) => {
    setGuideCards((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...cardUpdate } : c));
      saveToStorage(GUIDE_CARDS_KEY, updated);
      return updated;
    });
  };

  const deleteGuideCard = (id: string) => {
    setGuideCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(GUIDE_CARDS_KEY, updated);
      return updated;
    });
  };

  // 5. BLOG POSTS ACTIONS
  const addBlogPost = (post: Omit<BlogPostItem, 'id'> & { id?: string }) => {
    setBlogPosts((prev) => {
      const newPost: BlogPostItem = {
        id: post.id || `blog-${Date.now()}`,
        title: post.title,
        category: post.category || 'Shopping Guides',
        summary: post.summary || '',
        slug: post.slug || '/shop',
        image: post.image,
        collage: post.collage,
      };
      const updated = [newPost, ...prev];
      saveToStorage(BLOG_POSTS_KEY, updated);
      return updated;
    });
  };

  const updateBlogPost = (id: string, postUpdate: Partial<BlogPostItem>) => {
    setBlogPosts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...postUpdate } : p));
      saveToStorage(BLOG_POSTS_KEY, updated);
      return updated;
    });
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToStorage(BLOG_POSTS_KEY, updated);
      return updated;
    });
  };

  // RESET ALL HOMEPAGE CONTENT TO SEED DEFAULTS
  const resetHomepageContent = () => {
    setHeroBanner(defaultHeroBanner);
    setProsperityCards(defaultProsperityCards);
    setSpecialGifts(defaultSpecialGifts);
    setGuideCards(defaultGuideCards);
    setBlogPosts(defaultBlogPosts);
    setSections(defaultSections);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(HERO_KEY);
      localStorage.removeItem(PROSPERITY_KEY);
      localStorage.removeItem(SPECIAL_GIFTS_KEY);
      localStorage.removeItem(GUIDE_CARDS_KEY);
      localStorage.removeItem(BLOG_POSTS_KEY);
      localStorage.removeItem(SECTIONS_KEY);
    }
  };

  // Product Actions
  const addProduct = async (newProd: Omit<Product, 'id'> & { id?: string }) => {
    const tempId = newProd.id || `prod_${Date.now()}`;
    const fullProd: Product = {
      ...newProd,
      id: tempId,
      rating: newProd.rating ?? 5.0,
      reviewCount: newProd.reviewCount ?? 1,
      itemDetails: newProd.itemDetails?.length ? newProd.itemDetails : ['Temple blessed authentic talisman'],
      maker: newProd.maker || 'Miracle Feng Shui Studio',
    };
    setProducts((prev) => [fullProd, ...prev]);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProd.name,
          description: newProd.description || 'Authentic blessed talisman',
          price: newProd.price,
          comparePrice: newProd.originalPrice,
          originalPrice: newProd.originalPrice,
          discount: newProd.discount ? newProd.discount.trim() : null,
          categoryId: newProd.category || 'Feng Shui Decor',
          images: newProd.images?.length
            ? newProd.images
            : ['https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80'],
          stock: newProd.stock !== undefined ? newProd.stock : 50,
          itemDetails: newProd.itemDetails ?? [],
          isFeatured: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('API add product failed:', res.status, errData);
        // Revert the optimistic local insert so the UI doesn't lie about persistence
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        return false;
      }

      const data = await res.json();
      if (data.success && data.data?.id) {
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: data.data.id } : p))
        );
      }
      await refreshProducts();
      return true;
    } catch (err) {
      console.error('API add product failed, reverted local state:', err);
      setProducts((prev) => prev.filter((p) => p.id !== tempId));
      return false;
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updated.name,
          price: updated.price,
          comparePrice: updated.originalPrice ?? null,
          originalPrice: updated.originalPrice ?? null,
          categoryId: updated.category,
          category: updated.category,
          description: updated.description || 'Authentic blessed talisman',
          images: updated.images,
          stock: updated.stock,
          bestseller: updated.bestseller,
          etsyPick: updated.etsyPick,
          discount: updated.discount ?? null,
          itemDetails: updated.itemDetails,
          materials: updated.materials,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('API update product failed:', res.status, errData);
        return false;
      }
      // Refresh in the background: local state is already updated optimistically,
      // so don't make the save wait on a full catalog re-fetch.
      refreshProducts().catch((e) => console.warn('Background product refresh failed:', e));
      return true;
    } catch (err) {
      console.error('API update product failed:', err);
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API delete product failed, removed from memory:', err);
    }
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  const resetProducts = () => {
    setProducts(initialProducts);
  };

  // Section Layout Actions
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sections.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setSections((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      saveToStorage(SECTIONS_KEY, next);
      return next;
    });
  };

  const toggleSection = (id: HomeSectionId) => {
    setSections((prev) => {
      const next = prev.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec));
      saveToStorage(SECTIONS_KEY, next);
      return next;
    });
  };

  const updateSection = (id: HomeSectionId, data: Partial<HomeSectionConfig>) => {
    setSections((prev) => {
      const next = prev.map((sec) => (sec.id === id ? { ...sec, ...data } : sec));
      saveToStorage(SECTIONS_KEY, next);
      return next;
    });
  };

  const resetSections = () => {
    setSections(defaultSections);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SECTIONS_KEY);
    }
  };

  // Order Actions
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o))
    );

    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status.toUpperCase() }),
      });
    } catch (err) {
      console.warn('API order status update failed, memory updated:', err);
    }
  };

  const confirmOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'Processing');
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API delete order failed, removed from local state:', err);
    }
  };

  const addOrder = (order: Omit<StoreOrder, 'id'>) => {
    const id = `ord-${Date.now()}`;
    setOrders((prev) => [{ ...order, id }, ...prev]);
  };

  // Live Order Fulfillment & Cash Flow Calculations
  const ordersLeftToConfirm = orders.filter((o) => o.status === 'Pending').length;
  const ordersLeftToPack = orders.filter((o) => o.status === 'Processing').length;
  const ordersInTransit = orders.filter((o) => o.status === 'Shipped').length;

  const settledBalance = orders
    .filter((o) => {
      if (o.status === 'Cancelled') return false;
      const m = (o.paymentMethod || '').toLowerCase();
      const isOnline = m.includes('online') || m.includes('upi') || m.includes('razorpay');
      const isDeliveredCOD = o.status === 'Delivered' && (m.includes('cash') || m.includes('cod'));
      return isOnline || isDeliveredCOD;
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingBalance = orders
    .filter((o) => {
      if (o.status === 'Cancelled' || o.status === 'Delivered') return false;
      const m = (o.paymentMethod || '').toLowerCase();
      const isCOD = m.includes('cash') || m.includes('cod');
      return isCOD;
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrderRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        resetProducts,
        sections,
        moveSection,
        toggleSection,
        updateSection,
        resetSections,
        // Homepage Section Content
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
        // Orders & Fulfillment
        orders,
        updateOrderStatus,
        confirmOrder,
        deleteOrder,
        addOrder,
        ordersLeftToConfirm,
        ordersLeftToPack,
        ordersInTransit,
        settledBalance,
        pendingBalance,
        totalOrderRevenue,
        // Categories
        categories: categoriesState,
        categoriesList,
        refreshCategories,
        refreshProducts,
        refreshOrders,
        isLoaded,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
