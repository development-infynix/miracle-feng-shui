export const TAX_CONFIG = {
  seller: {
    legalName: process.env.NEXT_PUBLIC_SELLER_LEGAL_NAME || 'Miracle Feng Shui Studio Private Limited',
    brandName: process.env.NEXT_PUBLIC_SELLER_BRAND_NAME || 'Miracles Feng Shui',
    country: 'India',
    countryCode: 'IN',
    state: process.env.NEXT_PUBLIC_SELLER_STATE || 'Maharashtra',
    stateCode: process.env.NEXT_PUBLIC_SELLER_STATE_CODE || '32',
    city: process.env.NEXT_PUBLIC_SELLER_CITY || 'Mumbai',
    pincode: process.env.NEXT_PUBLIC_SELLER_PINCODE || '400001',
    address: process.env.NEXT_PUBLIC_SELLER_ADDRESS || 'Suite 402, Lotus Grandeur, Veera Desai Road, Andheri West, Mumbai, MH 400053',
    phone: process.env.NEXT_PUBLIC_SELLER_PHONE || '+91 98765 43210',
    email: process.env.NEXT_PUBLIC_SELLER_EMAIL || 'care@miraclefengshui.com',
    gstin: process.env.NEXT_PUBLIC_SELLER_GSTIN || '32AAMFI0291H1ZI',       // Official India GSTIN Number
    pan: process.env.NEXT_PUBLIC_SELLER_PAN || 'AAMFI0291H',              // Income Tax PAN (extracted from GSTIN)
    lutNumber: process.env.NEXT_PUBLIC_SELLER_LUT || 'AD320324009812M',   // Letter of Undertaking for Zero-rated Exports
    uaeTrn: process.env.NEXT_PUBLIC_SELLER_UAE_TRN || '100482910300003',      // UAE Federal Tax Authority TRN
    uaeOfficeAddress: process.env.NEXT_PUBLIC_SELLER_UAE_ADDRESS || 'Al Hudaiba Awards Building, Block B, Jumeirah 1, Dubai, UAE',
  },
  rates: {
    indiaStandardGst: 18,           // 18% standard GST rate for sacred decor & brass items
    indiaJewelryGst: 3,             // 3% for precious gemstone jewelry
    uaeVat: 5,                      // 5% UAE standard VAT
  },
  defaultHsnCode: '71179090',       // Imitation jewelry, talisman art & sacred craft artifacts
};
