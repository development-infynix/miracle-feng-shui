export type ProductReview = {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  productVariation?: string;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  maker: string; // Shop name
  makerAvatar?: string;
  makerSales?: number;
  starSeller?: boolean;
  price: number;
  originalPrice?: number;
  discount?: string;
  bestseller?: boolean;
  etsyPick?: boolean;
  freeShipping?: boolean;
  rating: number;
  reviewCount: number;
  category: string;
  images: string[];
  description: string;
  itemDetails: string[];
  materials?: string[];
  variations?: {
    name: string;
    options: string[];
  }[];
  allowsPersonalization?: boolean;
  personalizationPrompt?: string;
  inDemandCount?: number;
  stock?: number;
};

export const categories = [
  'All',
  'Feng Shui Decor',
  'Feng Shui Jewelry',
  'Feng Shui Candles',
  'Crystals & Trees',
  'Zen & Meditation',
  'Feng Shui Books',
  'Wealth & Abundance',
  'Protection & Charms',
] as const;

export type CategoryCircleInfo = {
  name: string;
  slug: string;
  image: string;
};

export const circularCategories: CategoryCircleInfo[] = [
  {
    name: 'Feng Shui Decor',
    slug: 'Feng Shui Decor',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    name: 'Feng Shui Jewelry',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
  },
  {
    name: 'Feng Shui Candles',
    slug: 'Feng Shui Candles',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Feng Shui Books',
    slug: 'Feng Shui Books',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Crystals & Trees',
    slug: 'Crystals & Trees',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Zen & Meditation',
    slug: 'Zen & Meditation',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
  },
];

export const summerCollections: CategoryCircleInfo[] = [
  {
    name: 'Wealth & Prosperity',
    slug: 'Feng Shui Decor',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Health & Longevity',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    name: 'Love & Harmony',
    slug: 'Feng Shui Jewelry',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Protection & Shielding',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
  },
  {
    name: 'Zen Meditation Space',
    slug: 'Feng Shui Candles',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Career & Success',
    slug: 'Feng Shui Decor',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  },
];

export const birthdayHeroCards = [
  {
    title: 'Feng Shui Wealth Corner Starter Kits',
    slug: 'Feng Shui Decor',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    title: 'Cinnabar & Obsidian Talismans',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    title: 'Natural Citrine & Amethyst Money Trees',
    slug: 'Crystals & Trees',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80',
  },
];

export const birthdayProductPicks = [
  {
    id: 'j4',
    title: 'Temple Blessed 2027 Tai Sui Protection Bracelet',
    price: 1464,
    originalPrice: 2090,
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    id: 'd1',
    title: 'Taoist Master Blessed Five Emperor Coins',
    price: 4008,
    originalPrice: 5725,
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    id: 'j2',
    title: 'S925 Pixiu Ring, Wealth Luck Amulet',
    price: 3462,
    originalPrice: 4945,
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
  },
  {
    id: 'c2',
    title: 'Fu Prosperity Prayer Candle | Good Fortune',
    price: 1403,
    originalPrice: 2004,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'c4',
    title: 'Feng Shui Lucky Dragon Incense Burner',
    price: 3159,
    originalPrice: 4512,
    image: 'https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg',
  },
  {
    id: 'c1',
    title: 'Money Multiplying Poster, Wealth Building',
    price: 2433,
    originalPrice: 3475,
    image: 'https://i.etsystatic.com/19246526/r/il/35c642/6558547910/il_fullxfull.6558547910_qiy1.jpg',
  },
];

export const specialGiftCategories = [
  {
    name: 'Protection Mirrors & Charms',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
  },
  {
    name: 'Abundance Candles',
    slug: 'Feng Shui Candles',
    image: 'https://i.etsystatic.com/59148376/r/il/5c6a68/7037517033/il_fullxfull.7037517033_rp73.jpg',
  },
  {
    name: 'Pixiu Luck Bracelets',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
  },
  {
    name: 'Cinnabar Protection',
    slug: 'Feng Shui Jewelry',
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    name: 'Wealth Coins & Charms',
    slug: 'Feng Shui Decor',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    name: 'Tibetan Sound Bowls',
    slug: 'Zen & Meditation',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
  },
];

export const todaysDeals = [
  {
    id: 'j4',
    title: 'Temple Blessed 2027 Tai Sui Protection Bracelet',
    price: 1464,
    originalPrice: 2090,
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    id: 'j2',
    title: 'S925 Pixiu Ring, Feng Shui Wealth Luck Amulet',
    price: 3462,
    originalPrice: 4945,
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
  },
  {
    id: 'd1',
    title: 'Taoist Master Blessed Five Emperor Coins: Feng Shui',
    price: 4008,
    originalPrice: 5725,
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
  },
  {
    id: 'c1',
    title: 'Money Multiplying Poster, Wealth Building Feng Shui',
    price: 2433,
    originalPrice: 3475,
    image: 'https://i.etsystatic.com/19246526/r/il/35c642/6558547910/il_fullxfull.6558547910_qiy1.jpg',
  },
  {
    id: 'c2',
    title: 'Fu Prosperity Prayer Candle | Chinese Good Fortune',
    price: 1403,
    originalPrice: 2004,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'c4',
    title: 'Feng Shui Lucky Dragon Incense Burner, Vintage',
    price: 3159,
    originalPrice: 4512,
    image: 'https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg',
  },
  {
    id: 'j3',
    title: 'Brass Bagua Pendant Necklace | Feng Shui I Ching',
    price: 2175,
    originalPrice: 3107,
    image: 'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
  },
];

export const fashionGuideData = {
  title: "Miracle feng shui's Guide to Energy & Harmony",
  subtitle: "From sacred brass talismans to handcrafted healing crystals, everything you need to balance your home and spirit.",
  sweatshirts: {
    title: 'Blackwood Feng Shui Amulet Necklace: Tree of Life',
    image: 'https://i.etsystatic.com/28306871/r/il/791365/7159126948/il_fullxfull.7159126948_ebgf.jpg',
    slug: 'Feng Shui Jewelry',
  },
  mensOvershirt: {
    title: 'S925 Pixiu Ring, Feng Shui Wealth Luck Amulet',
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
    slug: 'Feng Shui Jewelry',
  },
  toteBag: {
    title: 'Feng Shui Lucky Dragon Incense Burner, Vintage',
    image: 'https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg',
    videoUrl: '/videos/fashion-craft-1.mp4',
    slug: 'Feng Shui Candles',
  },
  linenBlouse: {
    title: 'Taoist Master Blessed Five Emperor Coins',
    image: 'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
    slug: 'Feng Shui Decor',
  },
  metallicHeart: {
    title: 'Feng Shui 2026 28 Hums Safety Talisman Keychain',
    image: 'https://i.etsystatic.com/18528884/r/il/4255ed/7574072434/il_fullxfull.7574072434_8ebu.jpg',
    videoUrl: '/videos/fashion-craft-2.mp4',
    slug: 'Feng Shui Jewelry',
  },
  spiralEarrings: {
    title: 'Brass Bagua Pendant Necklace | Feng Shui I Ching',
    image: 'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
    videoUrl: '/videos/fashion-craft-3.mp4',
    slug: 'Feng Shui Jewelry',
  },
};

export const blogPosts = [
  {
    id: 'blog-1',
    category: 'Shopping Guides',
    title: 'How to activate your home\'s southeast wealth corner with Feng Shui',
    summary: 'Discover the exact placements for water elements, citrine crystals, and dragon censers to amplify your home\'s prosperity.',
    slug: '/shop?category=Feng%20Shui%20Decor',
    image: 'https://i.etsystatic.com/19246526/r/il/35c642/6558547910/il_fullxfull.6558547910_qiy1.jpg',
    collage: [
      'https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg',
      'https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg',
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
      'https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg',
    ],
  },
  {
    id: 'blog-2',
    category: 'Shopping Guides',
    title: 'The power of Pixiu & Cinnabar: Attracting prosperity and protection in 2026',
    summary: 'Learn the ancient art of wearing sacred red string cinnabar beads and how the Pixiu talisman guards your financial harmony.',
    slug: '/shop?category=Feng%20Shui%20Jewelry',
    image: 'https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg',
  },
  {
    id: 'blog-3',
    category: 'Gift Ideas',
    title: '11 sacred crafts that make shopping on Miracle feng shui special',
    summary: 'Get to know the artistry behind authentic Tibetan singing bowls, hand-carved jade statues, and artisan crystal bonsai trees.',
    slug: '/shop?category=Zen%20%26%20Meditation',
    hasOrangeBar: true,
    image: 'https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg',
    collage: [
      'https://i.etsystatic.com/28306871/r/il/791365/7159126948/il_fullxfull.7159126948_ebgf.jpg',
      'https://i.etsystatic.com/57158477/r/il/5dae6a/6913075322/il_fullxfull.6913075322_qfbf.jpg',
      'https://i.etsystatic.com/59148376/r/il/5c6a68/7037517033/il_fullxfull.7037517033_rp73.jpg',
    ],
  },
];

export const products: Product[] = [
  {
    "id": "j1",
    "name": "Blackwood Feng Shui Amulet Necklace: Tree of Life",
    "maker": "ShanghaiAttic",
    "price": 2163,
    "originalPrice": 3090,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 1420,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://i.etsystatic.com/28306871/r/il/791365/7159126948/il_340x270.7159126948_ebgf.jpg",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Hand-carved natural African Blackwood amulet necklace featuring the sacred Tree of Life and Feng Shui protective blessings. Balances personal energy and wards off negative Chi.",
    "itemDetails": [
      "Handcrafted natural African blackwood pendant",
      "Adjustable hand-braided cord (18\" to 28\")",
      "Blessed with traditional harmony mantra",
      "Comes with authentic gift pouch"
    ],
    "materials": [
      "Natural Blackwood",
      "Braided Silk Cord"
    ],
    "inDemandCount": 14
  },
  {
    "id": "j2",
    "name": "S925 Pixiu Ring, Feng Shui Wealth Luck Amulet",
    "maker": "Miracle Feng Shui Studio",
    "price": 3462,
    "originalPrice": 4945,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2310,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://i.etsystatic.com/65398995/r/il/637ebb/7994749201/il_1080xN.7994749201_tjcq.jpg",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Genuine solid S925 sterling silver adjustable Pixiu ring engraved with ancient Buddhist Heart Sutra scriptures. Pi Xiu draws wealth and protects the wearer from financial misfortune.",
    "itemDetails": [
      "Solid S925 Sterling Silver with oxidized vintage finish",
      "Adjustable open-band sizing (fits US 7 to 12)",
      "Intricate Heart Sutra mantra engraving inside the band",
      "Blessed for wealth accumulation and prosperity"
    ],
    "materials": [
      "S925 Sterling Silver"
    ],
    "inDemandCount": 19
  },
  {
    "id": "j3",
    "name": "Brass Bagua Pendant Necklace | Feng Shui I Ching",
    "maker": "YUGNAGEMS",
    "price": 2175,
    "originalPrice": 3107,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 890,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://i.etsystatic.com/27864554/r/il/32250d/5943360949/il_fullxfull.5943360949_g433.jpg",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Traditional solid brass Bagua Eight Trigrams pendant necklace. Aligns with I Ching ancient principles to harmonize elemental forces and shield against sha chi.",
    "itemDetails": [
      "Solid cast brass with antiqued patina",
      "Features Early Heaven Bagua trigram alignment",
      "Includes 24-inch brass curb chain",
      "Pendant diameter: 32mm"
    ],
    "materials": [
      "Solid Brass",
      "Brass Chain"
    ],
    "inDemandCount": 8
  },
  {
    "id": "j4",
    "name": "Temple Blessed 2027 Tai Sui Protection Bracelet",
    "maker": "ArtDesignByHao",
    "price": 1464,
    "originalPrice": 2090,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3120,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://i.etsystatic.com/58154797/r/il/827b49/7627716971/il_fullxfull.7627716971_ctfy.jpg",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Consecrated at Taoist temple for Tai Sui protection. Woven red silk cord with natural cinnabar and protective talisman beads to safeguard your health and luck.",
    "itemDetails": [
      "Temple-consecrated red silk cord",
      "Natural cinnabar and gold vermeil beads",
      "Adjustable sliding knot (6\" to 8.5\")",
      "Blessing certificate included"
    ],
    "materials": [
      "Red Silk",
      "Natural Cinnabar",
      "Gold Vermeil"
    ],
    "inDemandCount": 27
  },
  {
    "id": "j5",
    "name": "Red String Wealth Bracelet, Wealth Attraction Luck",
    "maker": "BlessingOnYou",
    "price": 2727,
    "originalPrice": 3895,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1750,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://i.etsystatic.com/57158477/r/il/5dae6a/6913075322/il_fullxfull.6913075322_qfbf.jpg",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Auspicious braided red cord wealth bracelet adorned with five emperor wealth coins and auspicious knots to open multiple streams of prosperity.",
    "itemDetails": [
      "Hand-braided high-durability red nylon cord",
      "Five lucky mini emperor coins",
      "Adjustable circumference: 15-22 cm",
      "Attracts continuous financial fortune"
    ],
    "materials": [
      "Braided Cord",
      "Brass Coins"
    ],
    "inDemandCount": 16
  },
  {
    "id": "j6",
    "name": "Gold Ingot Cinnabar Bracelet: Chinese Knot Feng Shui",
    "maker": "JewelrWEI",
    "price": 53058,
    "originalPrice": 75797,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 420,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Masterpiece luxury Feng Shui bracelet featuring 24K pure solid gold Yuanbao ingot, untreated imperial cinnabar beads, and handcrafted ceremonial Chinese knots.",
    "itemDetails": [
      "Solid 24K Gold Ingot (stamped 999 gold)",
      "Imperial Grade High-Density Cinnabar Beads (8mm)",
      "Ceremonial hand-tied red silk knots",
      "Includes luxury wooden presentation box & appraisal certificate"
    ],
    "materials": [
      "24K Solid Gold",
      "Imperial Cinnabar",
      "Pure Silk Cord"
    ],
    "inDemandCount": 5
  },
  {
    "id": "j7",
    "name": "Copper Double Dragon Bagua Qilin Feng Shui Home",
    "maker": "Mantyartdecor",
    "price": 1845,
    "originalPrice": 2635,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 640,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Solid pure copper pendant depicting double dragons playing with pearls, encircling the Eight Trigrams and celestial Qilin protector for house and personal defense.",
    "itemDetails": [
      "Cast high-grade red copper",
      "Dual-sided intricate relief carving",
      "Diameter: 38mm / Weight: 28g",
      "Wearable as pendant or vehicle protective hang"
    ],
    "materials": [
      "Red Copper",
      "Waxed Cotton Cord"
    ],
    "inDemandCount": 9
  },
  {
    "id": "j8",
    "name": "Feng Shui 2026 Get Rich Immediately Wealth Amulet",
    "maker": "Crystalempress",
    "price": 2005,
    "originalPrice": 2864,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1980,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Consecrated 2026 wealth activation medallion featuring Chinese talisman characters \"Fa Cai\" (Instant Wealth) with protective celestial symbols.",
    "itemDetails": [
      "Gold-plated brass with protective glaze",
      "Embossed with authentic Taoist wealth sigil",
      "Includes 20\" chain and keychain adapter",
      "Blessed for windfalls and sudden career expansion"
    ],
    "materials": [
      "Gold Plated Brass",
      "Protective Enamel"
    ],
    "inDemandCount": 15
  },
  {
    "id": "j9",
    "name": "Lucky Wealth God Charm – Rotating Blessing Bead",
    "maker": "ShawnPlayStudio",
    "price": 1134,
    "originalPrice": 1620,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 950,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Precision mechanical rotating cylindrical bead charm with God of Wealth blessings. Spin the cylinder daily to activate positive energy and dispel stagnation.",
    "itemDetails": [
      "Smooth micro-bearing rotating mechanism",
      "Solid brass construction with golden polish",
      "Fits Pandora and standard charm bracelets or cord",
      "Size: 12mm x 10mm"
    ],
    "materials": [
      "Polished Brass"
    ],
    "inDemandCount": 11
  },
  {
    "id": "j10",
    "name": "Men's Abundance Bracelet: Tiger Eye Pixiu Feng Shui",
    "maker": "FeelingHK",
    "price": 4927,
    "originalPrice": 7038,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 2840,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Natural Grade-AAA Golden Tiger Eye beads paired with hand-carved black obsidian Pi Xiu beast. Enhances masculine courage, decisiveness, and steady wealth building.",
    "itemDetails": [
      "12mm Natural Grade-AAA Golden Tiger Eye",
      "Hand-carved Black Obsidian Pixiu Centerpiece",
      "Heavy-duty dual elastic cord (fits 7.5\" to 8.5\" wrists)",
      "Infused with grounding earth energy"
    ],
    "materials": [
      "Natural Tiger Eye",
      "Obsidian",
      "Stretch Cord"
    ],
    "inDemandCount": 21
  },
  {
    "id": "j11",
    "name": "Blessed Cinnabar Pixiu Keychain | Putuo Mountain",
    "maker": "ArtDesignByHao",
    "price": 1208,
    "originalPrice": 1725,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1680,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Purified and consecrated at Mount Putuo Buddhist Sanctuary. High-density vermillion cinnabar carved Pixiu attached to a braided auspicious red keyring.",
    "itemDetails": [
      "Natural Cinnabar carving (35mm)",
      "Reinforced stainless steel ring & swivel clasp",
      "Hand-braided Chinese longevity knot",
      "Ideal for keys, purse, or car interior"
    ],
    "materials": [
      "Cinnabar",
      "Braided Cord",
      "Steel Keyring"
    ],
    "inDemandCount": 13
  },
  {
    "id": "j12",
    "name": "Feng Shui 2026 28 Hums Safety Talisman Keychain",
    "maker": "Crystalempress",
    "price": 2005,
    "originalPrice": 2864,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 1150,
    "category": "Feng Shui Jewelry",
    "images": [
      "https://i.etsystatic.com/18528884/r/il/4255ed/7574072434/il_fullxfull.7574072434_8ebu.jpg",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "The sacred 28 Hums syllable talisman keychain generates a protective aura against accidents, negative flying stars, and spiritual obstacles throughout 2026.",
    "itemDetails": [
      "Features 28 sacred HUM syllables in Tibetan script",
      "Heavy gold-plated metal construction with enamel fill",
      "Overall length: 4.5 inches",
      "Essential annual protection cure"
    ],
    "materials": [
      "Gold Plated Alloy",
      "Enamel"
    ],
    "inDemandCount": 18
  },
  {
    "id": "c1",
    "name": "Money Multiplying Poster, Wealth Building Feng Shui",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3890,
    "category": "Feng Shui Candles",
    "images": [
      "https://i.etsystatic.com/19246526/r/il/35c642/6558547910/il_fullxfull.6558547910_qiy1.jpg",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "High-vibrational Money Multiplying Feng Shui poster. Designed with mathematical sacred geometry and ancient wealth glyphs to stimulate abundant financial flow.",
    "itemDetails": [
      "Giclée archival fine art print with gold pigment inks",
      "Matte museum finish to prevent glare",
      "Ready to frame in standard dimensions",
      "Best hung in Southeast wealth sector or office"
    ],
    "materials": [
      "Archival Museum Paper",
      "Golden Pigment Ink"
    ],
    "inDemandCount": 22
  },
  {
    "id": "c2",
    "name": "Fu Prosperity Prayer Candle | Chinese Good Fortune",
    "maker": "GypsyTideCollective",
    "price": 1403,
    "originalPrice": 2004,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2150,
    "category": "Feng Shui Candles",
    "images": [
      "https://i.etsystatic.com/22910392/r/il/bae559/5610740112/il_1080xN.5610740112_bo2m.jpg",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Natural soy wax prayer candle poured in a gilded glass jar adorned with the sacred Fu (Good Fortune) character. Scented with sandalwood and sweet orange.",
    "itemDetails": [
      "100% Organic Soy Wax with lead-free cotton wick",
      "Essential oil blend: Sandalwood, Mandarin & Clove",
      "Burn time: approx. 55 hours",
      "Blessed for household harmony and luck"
    ],
    "materials": [
      "Organic Soy Wax",
      "Essential Oils",
      "Glass Jar"
    ],
    "inDemandCount": 16
  },
  {
    "id": "c3",
    "name": "Reiki Charged Crystal Candles: Healing Candle",
    "maker": "ViatheVeil",
    "price": 1181,
    "originalPrice": 1687,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 4210,
    "category": "Feng Shui Candles",
    "images": [
      "https://i.etsystatic.com/iap/525f9c/6590809009/iap_600x600.6590809009_28b5u0k3.jpg?version=0",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Hand-poured coconut-soy candle embedded with genuine raw amethyst and clear quartz points, charged with Usui Reiki energy to dissolve mental stress.",
    "itemDetails": [
      "Embedded genuine raw healing crystals",
      "Herbal infusion: Lavender, White Sage & Chamomile",
      "Clean non-toxic slow burn (40+ hours)",
      "Crystals can be collected and kept once candle burns"
    ],
    "materials": [
      "Coconut Soy Wax",
      "Raw Crystals",
      "Dried Botanical Herbs"
    ],
    "inDemandCount": 25
  },
  {
    "id": "c4",
    "name": "Feng Shui Lucky Dragon Incense Burner, Vintage",
    "maker": "SerenityObjectHouse",
    "price": 3159,
    "originalPrice": 4512,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1830,
    "category": "Feng Shui Candles",
    "images": [
      "https://i.etsystatic.com/60335618/r/il/5e079c/7435054325/il_1080xN.7435054325_s37u.jpg",
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Heirloom quality antique bronze incense censer featuring intricately sculpted imperial dragons wrapping around the perforated lid to diffuse purifying smoke.",
    "itemDetails": [
      "Heavy solid cast bronze alloy with antique patina",
      "Accommodates incense coils, sticks, and cones",
      "Removable pierced lid with dragon finial",
      "Dimensions: 4.8\" wide x 3.6\" tall"
    ],
    "materials": [
      "Cast Bronze Alloy"
    ],
    "inDemandCount": 12
  },
  {
    "id": "c5",
    "name": "Feng Shui Yuanbao Ingot Candle – Wealth, Prosperity",
    "maker": "LulusMagicalBotanica",
    "price": 1114,
    "originalPrice": 1591,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 940,
    "category": "Feng Shui Candles",
    "images": [
      "https://i.etsystatic.com/59148376/r/il/5c6a68/7037517033/il_fullxfull.7037517033_rp73.jpg",
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Sculpted in the authentic shape of a traditional golden Chinese Yuanbao money boat. Light during new moons and business openings to summon commercial fortune.",
    "itemDetails": [
      "Gold shimmer mica infused soy candle wax",
      "Fragrance notes of cinnamon bark, frankincense & amber",
      "Burn time: approx. 30 hours",
      "Includes gold fortune card"
    ],
    "materials": [
      "Gold Mica Wax",
      "Cotton Wick",
      "Essential Fragrance"
    ],
    "inDemandCount": 14
  },
  {
    "id": "c6",
    "name": "Bronze Pumpkin Incense Burner - Vine Handle",
    "maker": "Tangqiantreasures",
    "price": 2864,
    "originalPrice": 4091,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 760,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Elegantly sculpted bronze pumpkin censer. In Feng Shui, the pumpkin symbolizes boundless harvest, family fertility, and lasting abundance.",
    "itemDetails": [
      "Solid bronze with natural verdigris highlights",
      "Delicate hand-twisted vine handle and leaf filigree",
      "Fire-resistant bottom with brass incense pin cushion",
      "Diameter: 4.2 inches"
    ],
    "materials": [
      "Solid Bronze",
      "Brass Accents"
    ],
    "inDemandCount": 8
  },
  {
    "id": "c7",
    "name": "Workplace Peace Feng Shui Poster (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3200,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Serene printable Feng Shui wall art to eliminate office gossip, interpersonal friction, and workplace stress. Promotes calm focus and authoritative grace.",
    "itemDetails": [
      "Ultra high-resolution printable files (300 DPI)",
      "Multiple aspect ratios included (4:5, 3:4, 2:3, ISO)",
      "Instant digital download with placement guide",
      "Designed by certified Feng Shui interior master"
    ],
    "materials": [
      "Digital Download",
      "High-Res PDF & JPG"
    ],
    "inDemandCount": 19
  },
  {
    "id": "c8",
    "name": "Year of the Horse Intention Candle: Aventurine",
    "maker": "TheMoonHeart",
    "price": 512,
    "originalPrice": 731,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 820,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Compact intention tea-light candle topped with green aventurine gemstone chips for swift career progress and victorious energy during the Year of the Horse.",
    "itemDetails": [
      "Natural soy and beeswax blend",
      "Topped with genuine green aventurine chips",
      "Scented with pine and cedarwood",
      "Burn time: 12-15 hours"
    ],
    "materials": [
      "Natural Soy Wax",
      "Green Aventurine"
    ],
    "inDemandCount": 7
  },
  {
    "id": "c9",
    "name": "Conflict Prevention Peace Poster Printable (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1450,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Minimalist Feng Shui print based on the Quarrelsome Star 3 neutralization method. Restores domestic peace, soothing fiery tempers and misunderstandings.",
    "itemDetails": [
      "300 DPI high-definition digital vector files",
      "Compatible with poster frames up to 24\" x 36\"",
      "Curated soothing palette: Jade, Sage & Warm Cream",
      "Includes sector placement instructions"
    ],
    "materials": [
      "Digital Art File",
      "Printable PDF"
    ],
    "inDemandCount": 11
  },
  {
    "id": "c10",
    "name": "Gold Mountain Chinese Feng Shui Wall Art (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 2780,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "The celestial Golden Mountain provides supreme backing support (\"Gui Ren\" benefactor luck) when placed behind your desk or sofa. Shields against instability.",
    "itemDetails": [
      "Digital high-resolution artwork for canvas or paper printing",
      "Rich golden mountain peak watercolor composition",
      "5 scalable ratio files included",
      "Recommended by corporate Feng Shui consultants"
    ],
    "materials": [
      "Digital File",
      "Scalable High-Res File"
    ],
    "inDemandCount": 17
  },
  {
    "id": "c11",
    "name": "Chinese Glass Citrine Ingot Figurine, Feng Shui Wealth",
    "maker": "FengShuiTreasures",
    "price": 1499,
    "originalPrice": 2141,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 920,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Sparkling optic crystal glass Yuanbao ingot in warm citrine yellow. Radiates solar abundance energy to attract profitable opportunities.",
    "itemDetails": [
      "High-refraction K9 optical crystal glass",
      "Dimensions: 3.2\" x 2.2\" x 1.8\"",
      "Smooth hand-polished facet edges",
      "Ideal for wealth bowl, altar, or cash register"
    ],
    "materials": [
      "K9 Optical Crystal Glass"
    ],
    "inDemandCount": 10
  },
  {
    "id": "c12",
    "name": "Feng Shui Basket – Luck, Harmony & Prosperity",
    "maker": "HarmonyBotanicals",
    "price": 2199,
    "originalPrice": 3141,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 650,
    "category": "Feng Shui Candles",
    "images": [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Traditional woven Feng Shui bamboo basket filled with lucky red ribbon, ancient fortune coins, and fragrant dried botanical potpourri.",
    "itemDetails": [
      "Hand-woven natural bamboo basket with wooden handle",
      "Includes brass coins tied with mystic red knots",
      "Infused with natural aromatic botanical potpourri",
      "Dimensions: 7\" x 7\" x 5\""
    ],
    "materials": [
      "Natural Bamboo",
      "Brass Coins",
      "Silk Ribbon"
    ],
    "inDemandCount": 8
  },
  {
    "id": "d1",
    "name": "Taoist Master Blessed Five Emperor Coins: Feng Shui",
    "maker": "AncientDaoTalismans",
    "price": 4008,
    "originalPrice": 5725,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3820,
    "category": "Feng Shui Decor",
    "images": [
      "https://i.etsystatic.com/61062687/r/il/8c215d/7104788870/il_794xN.7104788870_shv6.jpg",
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Consecrated five ancient Qing dynasty brass emperor coins strung on ceremonial red cord with mystic knots. Renowned for suppressing Sha Chi and amplifying wealth.",
    "itemDetails": [
      "Five genuine replica brass emperor coins (Shunzhi to Jiaqing)",
      "Hand-tied ceremonial crimson silk cord",
      "Consecrated with personalized buyer Taoist blessing",
      "Overall length: 13 inches"
    ],
    "materials": [
      "Cast Brass",
      "Silk Cords"
    ],
    "inDemandCount": 26
  },
  {
    "id": "d2",
    "name": "Pixiu - Guardian Dragon - Feng Shui Decor",
    "maker": "MajasGeschenkladen",
    "price": 2594,
    "originalPrice": 3705,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1620,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Majestic cast brass Pixiu dragon figurine standing atop mounds of wealth coins and gold ingots. Swallows wealth without expelling it, guarding your savings.",
    "itemDetails": [
      "Solid brass with antique golden sheen",
      "Weight: 450g / Length: 4.8 inches",
      "Place facing the door or window to draw wealth from outside",
      "Includes protective felt bottom pad"
    ],
    "materials": [
      "Solid Cast Brass"
    ],
    "inDemandCount": 15
  },
  {
    "id": "d3",
    "name": "Career Success Poster, Professional Achievement (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2190,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "North sector water element career growth poster. Activates professional recognition, salary raises, and corporate leadership.",
    "itemDetails": [
      "High-resolution digital printable art files (300 DPI)",
      "Multiple aspect ratios for easy frame fitting",
      "Includes complete office desk layout blueprint",
      "Instant digital download"
    ],
    "materials": [
      "Digital Download",
      "High-Res PDF"
    ],
    "inDemandCount": 13
  },
  {
    "id": "d4",
    "name": "Conflict Prevention Peace Poster Printable (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 1510,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Harmonious yin-yang balance wall art with peaceful water and mountain brushwork. Clears conflict from central living spaces.",
    "itemDetails": [
      "Ultra high-resolution printable art",
      "Formats: JPG, PDF, PNG with CMYK print profile",
      "Instantly download and print locally",
      "Designed to neutralize negative arguments"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 9
  },
  {
    "id": "d5",
    "name": "Workplace Peace Feng Shui Poster (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 2900,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Serene minimalist bamboo and golden orb Feng Shui art for office tranquility. Calms high-stress corporate environments.",
    "itemDetails": [
      "Instant download high-resolution art files",
      "Scalable to 24\" x 36\" without pixelation",
      "Detailed recommendations for hanging position",
      "Neutralizes aggressive energy in conference rooms"
    ],
    "materials": [
      "Digital Art Download"
    ],
    "inDemandCount": 16
  },
  {
    "id": "d6",
    "name": "328 Wealth Number Feng Shui Poster, Prosperity (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3420,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "\"328\" represents \"Easy and Continuous Prosperity\" in Cantonese Feng Shui numerology. Designed with shimmering gold leaf texture on obsidian canvas.",
    "itemDetails": [
      "High-grade digital print files with gold texture rendering",
      "Ready to print on canvas or textured archival paper",
      "Instant delivery via download",
      "Essential for home wealth corner"
    ],
    "materials": [
      "Digital Art Files"
    ],
    "inDemandCount": 24
  },
  {
    "id": "d7",
    "name": "Rising Success Poster Printable, Career Growth (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1890,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Ascending golden dragon / rising sun minimalist Feng Shui art for career advancement. Inspires ambition and attracts executive sponsorship.",
    "itemDetails": [
      "Printable PDF and high-res JPG included",
      "Matches contemporary and classic office frames",
      "Instant download with quick setup instructions",
      "Harmonizes North & Northwest sectors"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 12
  },
  {
    "id": "d8",
    "name": "Koi Fish Metal Wall Art, Japanese Zen Decor",
    "maker": "Lilacwalldecor",
    "price": 3586,
    "originalPrice": 5122,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2450,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Precision laser-cut steel wall sculpture depicting two graceful swimming Koi fish forming a sacred circle of abundance, perseverance, and romantic harmony.",
    "itemDetails": [
      "2mm high-grade steel with electrostatic matte black powder coat",
      "Stands 1.5cm off the wall creating dramatic 3D shadow depth",
      "Diameter: 18 inches (45 cm)",
      "Waterproof and suitable for indoor or outdoor patios"
    ],
    "materials": [
      "Laser Cut Steel",
      "Matte Powder Coating"
    ],
    "inDemandCount": 18
  },
  {
    "id": "d9",
    "name": "Pair Copper Feng Shui Pi Yao/Pi Xiu for Wealth",
    "maker": "Phenixapiii",
    "price": 2327,
    "originalPrice": 3324,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 1780,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Matched pair of male (Tian Lu) and female (Bi Xie) solid copper Pi Xiu statues. Tian Lu attracts wealth into the home while Bi Xie wards off evil spirits.",
    "itemDetails": [
      "100% Solid cast copper with hand-buffed finish",
      "Pair weight: 620g",
      "Dimensions: 3.5\" length x 3.0\" height each",
      "Includes consecration instructions"
    ],
    "materials": [
      "Solid Copper"
    ],
    "inDemandCount": 15
  },
  {
    "id": "d10",
    "name": "Brass Fortune Tree Figurine: Mini Money Tree Desk",
    "maker": "KraftedGB",
    "price": 1891,
    "originalPrice": 2701,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 930,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Intricately cast solid brass miniature wealth tree figurine with branches laden with ancient Chinese coins and wealth ingots. Ideal desk enhancer.",
    "itemDetails": [
      "Solid cast brass with protective lacquer coat",
      "Height: 4.5 inches / Weight: 280g",
      "Heavy coin-stacked planter base",
      "Boosts steady financial growth and investments"
    ],
    "materials": [
      "Solid Brass"
    ],
    "inDemandCount": 11
  },
  {
    "id": "d11",
    "name": "New Income Source Card, Money Flow Feng Shui (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1120,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Printable Feng Shui manifestation card embedded with sacred water-flow geometry and affirmations to open secondary and passive income streams.",
    "itemDetails": [
      "High-resolution printable card format (wallet and desk sizes)",
      "300 DPI print quality",
      "Includes daily activation ritual instructions",
      "Instant digital download"
    ],
    "materials": [
      "Digital Printable Card"
    ],
    "inDemandCount": 8
  },
  {
    "id": "d12",
    "name": "Exam Ranking Success Poster Printable, Honor Roll (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1340,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Northeast education sector activator poster featuring the Wen Chang Pagoda and scholastic harmony symbols to sharpen memory, test focus, and exam results.",
    "itemDetails": [
      "Digital printable poster in multiple standard dimensions",
      "Clean modern aesthetic suitable for study rooms",
      "Instant digital download file package",
      "Recommended by academic mentors"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 10
  },
  {
    "id": "d13",
    "name": "Vintage Bronze Carved Dragon Incense Burner",
    "maker": "MEIYOURUGUO",
    "price": 2675,
    "originalPrice": 3821,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1470,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Heavy antique bronze three-legged censer with coiled imperial dragons serving as side handles and auspicious cloud perforations on the domed lid.",
    "itemDetails": [
      "Cast antiqued bronze alloy",
      "Holds incense sticks, cones, or charcoal",
      "Dimensions: 5.1\" wide x 4.0\" tall / Weight: 520g",
      "Purifies household energy and invites blessings"
    ],
    "materials": [
      "Cast Bronze"
    ],
    "inDemandCount": 14
  },
  {
    "id": "d14",
    "name": "Wealth Fortune Magnet Poster, Riches Attraction (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 4120,
    "category": "Feng Shui Decor",
    "images": [
      "https://i.etsystatic.com/61064616/r/il/209d99/7042851538/il_1080xN.7042851538_ma68.jpg",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Sacred geometric wealth vortex and coin attractor printable poster in emerald and gold. Amplifies money magnetization in residential and retail spaces.",
    "itemDetails": [
      "300 DPI ultra-high-resolution files for gallery printing",
      "Includes instructions on compass sector alignment",
      "Instant digital download",
      "Bestseller for entrepreneurs and shop owners"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 28
  },
  {
    "id": "d15",
    "name": "Feng Shui Gift, Feng Shui Wall Art, Feng Shui Decor (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 980,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "All-in-one harmonious home energy printable poster featuring the 8 aspirations and universal Bagua matrix. Perfect housewarming gift.",
    "itemDetails": [
      "Print-ready high-resolution file bundle",
      "Fits standard 16x20, 18x24, and A2 frames",
      "Instant digital download",
      "Brings balanced Chi to entryways and living rooms"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 11
  },
  {
    "id": "d16",
    "name": "Copper Double Dragon Bagua Qilin Feng Shui Home",
    "maker": "Mantyartdecor",
    "price": 1845,
    "originalPrice": 2635,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 780,
    "category": "Feng Shui Decor",
    "images": [
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Heavy cast copper plaque with double dragons and Qilin for entrance doorway warding. Dissolves external negative Sha Chi from roads and neighboring structures.",
    "itemDetails": [
      "Cast copper plaque with pre-drilled hanging hole",
      "Diameter: 3.5 inches / Weight: 180g",
      "Mount above front entrance or main window",
      "Traditional Taoist talisman inscription"
    ],
    "materials": [
      "Cast Pure Copper"
    ],
    "inDemandCount": 9
  },
  {
    "id": "b1",
    "name": "Workplace Peace Feng Shui Poster (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 2450,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Feng Shui workplace energy flow guide and art print. Illustrates core desk positioning, commanding view rules, and elemental balancing principles.",
    "itemDetails": [
      "Printable comprehensive infographic guide (300 DPI)",
      "Includes desk positioning checklist",
      "Instant digital download",
      "Suitable for home office and corporate cubicles"
    ],
    "materials": [
      "Digital Printable Guide"
    ],
    "inDemandCount": 14
  },
  {
    "id": "b2",
    "name": "New Income Source Card, Money Flow Feng Shui (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 1100,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Pocket manifestation guide and talisman card. Features daily micro-rituals and water placement secrets to stimulate new business contracts.",
    "itemDetails": [
      "Digital printable cards with folding guidelines",
      "Pocket wallet size + desk card size",
      "Instant download delivery",
      "Includes 30-day abundance tracking calendar"
    ],
    "materials": [
      "Digital Download"
    ],
    "inDemandCount": 9
  },
  {
    "id": "b3",
    "name": "Feng Shui - The Chinese Art of Placement by Sarah",
    "maker": "TwelvetreesBooks",
    "price": 1680,
    "originalPrice": 2400,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3100,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Vintage collectible illustrated hardcover book on authentic spatial arrangement, Chi flows, Bagua energy maps, and interior harmonious placement.",
    "itemDetails": [
      "Hardcover collector vintage edition",
      "Over 200 pages with diagrams and color photographs",
      "Covers room-by-room environmental remedies",
      "Shipped securely in protective archival sleeve"
    ],
    "materials": [
      "Hardcover Book",
      "Archival Paper"
    ],
    "inDemandCount": 22
  },
  {
    "id": "b4",
    "name": "Rising Success Poster Printable, Career Growth (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1650,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Feng Shui success roadmap poster with 9 grid Bagua alignment. Guides home dwellers through activating life goals sector by sector.",
    "itemDetails": [
      "Digital printable reference poster (300 DPI)",
      "Clear step-by-step compass orientation chart",
      "Instant access link immediately after purchase",
      "High compatibility with home and office printers"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 11
  },
  {
    "id": "b5",
    "name": "Career Success Poster, Professional Achievement (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 2980,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "North sector water element career activation visual diagram. Details colors, materials, and fountain placements to trigger professional recognition.",
    "itemDetails": [
      "Includes visual layout guide and color swatches",
      "Ultra high-resolution printable files (PDF/JPG)",
      "Instant digital download",
      "Trusted by interior designers and consultants"
    ],
    "materials": [
      "Digital Download"
    ],
    "inDemandCount": 15
  },
  {
    "id": "b6",
    "name": "Exam Ranking Success Poster Printable, Honor Roll (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1200,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Northeast education and study desk Feng Shui printable placement guide. Boosts mental stamina, exam recall, and honors ranking.",
    "itemDetails": [
      "Printable student study room placement blueprint",
      "Formulated according to Classical Flying Stars",
      "Instant digital download file package",
      "Fits standard frame sizes"
    ],
    "materials": [
      "Digital Download File"
    ],
    "inDemandCount": 9
  },
  {
    "id": "b7",
    "name": "Sales Boost Wealth Card, Business Growth Feng Shui (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3150,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Commercial cash register / retail storefront Feng Shui blessing card. Attracts high-value paying customers and steady cash turnover.",
    "itemDetails": [
      "Printable counter cards and register inserts",
      "Inscribed with sacred business expansion glyphs",
      "Instant digital download",
      "Includes instructions for point-of-sale placement"
    ],
    "materials": [
      "Digital Card Download"
    ],
    "inDemandCount": 20
  },
  {
    "id": "b8",
    "name": "Digital Downloadable Card Design to Boost Money (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 970,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Sacred geometry wallet cash talisman printable insert. Place inside wallet or invoice folders to prevent financial leakage and enhance prosperity Chi.",
    "itemDetails": [
      "Wallet-sized printable template with cutting guidelines",
      "Golden spiral and wealth accumulator motif",
      "Instant download delivery",
      "Print on thick parchment or laminate"
    ],
    "materials": [
      "Digital Download"
    ],
    "inDemandCount": 12
  },
  {
    "id": "b9",
    "name": "Bagua Map Feng Shui Guide & Workbook | 9 Life Zones (Digital)",
    "maker": "HealershubCo",
    "price": 1453,
    "originalPrice": 2075,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 4200,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Complete 40-page interactive printable workbook with 9 Bagua zones and floor plan overlays. Easily map and cure every quadrant of your house.",
    "itemDetails": [
      "40-Page Printable PDF Workbook (A4 and US Letter)",
      "Detailed checklist for each of the 9 Life Areas",
      "Transparent floorplan overlay grid template",
      "Instant download delivery"
    ],
    "materials": [
      "Digital Interactive PDF Workbook"
    ],
    "inDemandCount": 35
  },
  {
    "id": "b10",
    "name": "Pearls of Sufism - A Book for the Anxious, Stressed (Digital)",
    "maker": "Muhebb",
    "price": 1094,
    "originalPrice": 1563,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 1150,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Peaceful spiritual wisdom eBook and guide for inner tranquility, stress alleviation, and emotional centering. Perfect companion for quiet meditation spaces.",
    "itemDetails": [
      "Digital eBook in EPUB and PDF formats",
      "Over 160 pages of calming wisdom and daily contemplation",
      "Instant download compatible with Kindle, iPad, and phone",
      "Brings deep emotional solace and stillness"
    ],
    "materials": [
      "Digital eBook",
      "EPUB & PDF"
    ],
    "inDemandCount": 14
  },
  {
    "id": "b11",
    "name": "Vintage Bronze Carved Guan Yin Statue Fengshui",
    "maker": "ZHONGLIJIN",
    "price": 1774,
    "originalPrice": 2534,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2210,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Solid carved bronze Bodhisattva of Compassion Guan Yin seated in meditation atop a blooming lotus throne. Radiates soothing protection throughout the home.",
    "itemDetails": [
      "Solid cast bronze with antique golden patina",
      "Height: 4.8 inches / Weight: 380g",
      "Detailed facial expression and sacred vase attribute",
      "Place in quiet library or prayer altar"
    ],
    "materials": [
      "Solid Bronze"
    ],
    "inDemandCount": 16
  },
  {
    "id": "b12",
    "name": "Conflict Prevention Peace Poster Printable (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 1420,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Southwest relationships sector harmony guide and art print. Harmonizes couple communication and dissolves household friction.",
    "itemDetails": [
      "High-resolution digital printable art files (300 DPI)",
      "Multiple aspect ratios for easy frame fitting",
      "Includes relationship sector activation instructions",
      "Instant digital download"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 10
  },
  {
    "id": "b13",
    "name": "Wealth Fortune Magnet Poster, Riches Attraction (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3950,
    "category": "Feng Shui Books",
    "images": [
      "https://i.etsystatic.com/61064616/r/il/209d99/7042851538/il_1080xN.7042851538_ma68.jpg",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Southeast wealth corner activator poster with gold ingot symbolism. Features wealth multiplication formulas from classical San Yuan Feng Shui.",
    "itemDetails": [
      "Ultra high-resolution printable files (300 DPI)",
      "Printable on canvas, metallic foil paper, or fine cardstock",
      "Instant download delivery",
      "Proven wealth cornerstone visual anchor"
    ],
    "materials": [
      "Digital Art File"
    ],
    "inDemandCount": 26
  },
  {
    "id": "b14",
    "name": "Workplace Peace Feng Shui Poster, Golden Elephant (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2100,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Feng Shui Golden Elephant with trunk up for office wisdom, loyalty, and peaceful authority. Commands respect without provoking opposition.",
    "itemDetails": [
      "Gilded digital art print with sacred elephant motif",
      "High-resolution PDF and JPG files ready for framing",
      "Instant digital download",
      "Best hung directly behind executive chair"
    ],
    "materials": [
      "Digital Download"
    ],
    "inDemandCount": 17
  },
  {
    "id": "b15",
    "name": "Beginner Feng Shui Guide | Home Energy, Organising (Digital)",
    "maker": "Adigitiallife",
    "price": 477,
    "originalPrice": 681,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 5120,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Comprehensive step-by-step illustrated beginner's handbook for clearing clutter and room-by-room Chi balancing. Practical, modern, and easy to apply.",
    "itemDetails": [
      "28-page practical printable eBooklet (PDF)",
      "Room-by-room decluttering and orientation guide",
      "Quick-reference elemental cheat sheet",
      "Instant digital download to any device"
    ],
    "materials": [
      "Digital PDF Handbook"
    ],
    "inDemandCount": 39
  },
  {
    "id": "b16",
    "name": "Wealth Abundance Frequency Label, Prosperity Map (Digital)",
    "maker": "FengShuiTurkiye",
    "price": 2433,
    "originalPrice": 3475,
    "discount": "30% off",
    "bestseller": false,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 4.8,
    "reviewCount": 940,
    "category": "Feng Shui Books",
    "images": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Prosperity grid label and frequency chart printable. Calibrated to 528Hz and 888Hz wealth resonance frequencies to attach to jars, books, and wealth corners.",
    "itemDetails": [
      "Printable sticker sheet and framed frequency map",
      "High-resolution vector files for crystal-clear labels",
      "Instant download delivery",
      "Includes instructions on water and jar consecration"
    ],
    "materials": [
      "Digital Printable Sheet"
    ],
    "inDemandCount": 11
  },
  {
    "id": "e2",
    "name": "Natural Citrine Crystal Bonsai Wealth Tree on Real Agate Slice • Feng Shui Money Tree for Abundance & Prosperity",
    "maker": "SacredCrystalSanctuary",
    "makerAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    "makerSales": 29450,
    "starSeller": true,
    "price": 2445,
    "originalPrice": 3705,
    "discount": "34% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 3820,
    "category": "Crystals & Trees",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Crafted with hundreds of natural raw golden citrine crystal chips wired into copper branches on a natural Brazilian agate slice base. Ideal for the Southeast wealth corner.",
    "itemDetails": [
      "Handcrafted natural citrine gemstone",
      "Natural Brazilian agate slice base",
      "Flexible hand-twisted copper branches",
      "Height approx. 7 inches"
    ],
    "inDemandCount": 14
  },
  {
    "id": "e4",
    "name": "Authentic Hand-Hammered Tibetan Singing Bowl Sound Healing Set • Meditation & Energy Space Cleansing Kit",
    "maker": "HimalayanZenSound",
    "makerAvatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    "makerSales": 19800,
    "starSeller": true,
    "price": 1850,
    "originalPrice": 2800,
    "discount": "34% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 2150,
    "category": "Zen & Meditation",
    "images": [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Handcrafted in Nepal by multi-generational metalsmiths using traditional 7-metal alloy. Emits deep, resonant harmonic vibrations that instantly clear negative stagnant Chi.",
    "itemDetails": [
      "Hand-hammered 7-metal bronze alloy",
      "Includes dual-end suede rosewood mallet",
      "Hand-sewn silk brocade ring cushion",
      "Diameter: 4.5 inches / F Note resonance"
    ],
    "inDemandCount": 9
  },
  {
    "id": "e10",
    "name": "Rose Quartz Mandarin Ducks Pair on Lotus Leaf • Harmony & Unconditional Love Romance Feng Shui Enhancer",
    "maker": "CrystalSanctuaryCo",
    "makerAvatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    "makerSales": 48900,
    "starSeller": true,
    "price": 1690,
    "originalPrice": 2400,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": true,
    "freeShipping": true,
    "rating": 5,
    "reviewCount": 11200,
    "category": "Crystals & Trees",
    "images": [
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Mandarin ducks mate for life, making them the ultimate Feng Shui symbol of eternal marital devotion and romantic harmony. Carved from natural rose quartz crystal.",
    "itemDetails": [
      "Pair of hand-carved Natural Rose Quartz Ducks",
      "Green Aventurine lotus leaf base included",
      "Dimensions: 3\" length x 2\" height each",
      "Best placed in Southwest corner of the bedroom"
    ],
    "allowsPersonalization": true,
    "personalizationPrompt": "Provide custom gift message or couple names for blessed card:",
    "inDemandCount": 31
  },
  {
    "id": "e11",
    "name": "Tibetan 7 Chakra Orgonite Energy Generator Pyramid • EMF Protection & Chi Balance Healing Crystal",
    "maker": "ZenHavenArtisans",
    "makerAvatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    "makerSales": 16700,
    "starSeller": true,
    "price": 1350,
    "originalPrice": 1950,
    "discount": "30% off",
    "bestseller": true,
    "etsyPick": false,
    "freeShipping": true,
    "rating": 4.9,
    "reviewCount": 2840,
    "category": "Zen & Meditation",
    "images": [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
    ],
    "description": "Layered with genuine amethyst, lapis lazuli, turquoise, green aventurine, tiger eye, red jasper, and copper coil matrix to transmute negative electromagnetic energy into vibrant prana.",
    "itemDetails": [
      "7 Authentic Chakra Gemstone layers",
      "High-clarity organic resin matrix with Copper Coil",
      "Pyramid Base: 60mm x 60mm",
      "Sacred geometry Sri Yantra symbol engraved"
    ],
    "inDemandCount": 12
  },
];

export const sampleReviews: ProductReview[] = [
  {
    id: 'r1',
    author: 'Emily Watson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    date: 'Sep 2, 2026',
    comment:
      'Absolutely breathtaking quality! The engraving was so delicate and crisp, and the packaging felt like receiving a high-end luxury gift. My sister cried when she opened it!',
    productVariation: 'Finish: 14K Gold Fill, Chain Length: 18 inches',
  },
  {
    id: 'r2',
    author: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    date: 'Aug 28, 2026',
    comment:
      'Fast shipping, arrived 3 days earlier than estimated. The craftsmanship is top notch and the seller reached out with a mock-up to confirm spelling. 10/10 will buy again.',
    productVariation: 'Finish: Sterling Silver, Chain Length: 16 inches',
  },
  {
    id: 'r3',
    author: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    rating: 5,
    date: 'Aug 15, 2026',
    comment:
      'Exceeded every single expectation. You can tell this was made with real love and care. Looks even better in person than in the photos!',
  },
];
