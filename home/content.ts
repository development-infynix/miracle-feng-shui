// Fixed homepage content. The homepage used to be arranged from the admin panel;
// it is now designed in code, so edit the copy and images here.

export interface SectionCopy {
  id: string;
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

const sectionList: SectionCopy[] = [
  {
    id: 'hero',
    title: 'Invite wealth, peace & positive energy home',
    subtitle: 'Taoist master-blessed authentic talismans, consecrated jewelry, and handcrafted Feng Shui cures.',
    ctaText: 'Shop Feng Shui',
    ctaLink: '/shop?q=feng+shui',
    badge: 'Conscious Craftsmanship',
  },
  {
    id: 'featured_interests',
    title: 'Jump into featured interests',
    subtitle: 'Explore authentic Feng Shui cures, jewelry, candles, and meditation crystals.',
  },
  {
    id: 'auspicious_collections',
    title: 'Discover our most auspicious collections',
    subtitle: 'Hand-picked talismans aligned with Bagua energy sectors.',
  },
  {
    id: 'prosperity_gifts',
    title: 'Miracle feng shui-special gifts for prosperity',
    subtitle: 'Consciously crafted prosperity essentials and customer favorites.',
    ctaText: 'Get inspired',
    ctaLink: '/shop?category=Feng%20Shui%20Decor',
  },
  {
    id: 'special_gifts',
    title: 'Gifts as special as they are',
    subtitle: 'Curated sets for new beginnings, housewarming, and protection.',
  },
  {
    id: 'todays_deals',
    title: "Today's auspicious deals",
    subtitle: 'Special blessing discounts ending tonight.',
    badge: 'Limited-time Chi Boost',
  },
  {
    id: 'fashion_guide',
    title: "Miracle feng shui's Guide to Energy & Harmony",
    subtitle: 'From sacred brass talismans to handcrafted healing crystals, everything you need to balance your home and spirit.',
    badge: 'Curated Style & Chi',
    ctaText: 'Shop these sacred finds',
    ctaLink: '/shop?category=Feng%20Shui%20Decor',
  },
  {
    id: 'sacred_knowledge',
    title: 'From our Feng Shui Masters & Curators',
    subtitle: 'Ancient wisdom and modern placement tips for high Chi living.',
  },
];

export const heroBanner: HeroBannerData = {
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

export const prosperityCards: ProsperityHeroCard[] = [
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

export const specialGifts: SpecialGiftItem[] = [
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

export const guideCards: GuideCardItem[] = [
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

export const blogPosts: BlogPostItem[] = [
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

/** Section copy keyed by section id. */
export const homeSections = Object.fromEntries(sectionList.map((s) => [s.id, s])) as Record<
  | 'hero'
  | 'featured_interests'
  | 'auspicious_collections'
  | 'prosperity_gifts'
  | 'special_gifts'
  | 'todays_deals'
  | 'fashion_guide'
  | 'sacred_knowledge',
  SectionCopy
>;
