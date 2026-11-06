// Seller registration details come only from .env (NEXT_PUBLIC_SELLER_*). A blank value is left off the invoice;
// never put sample numbers here, because they'd be printed on real invoices.
export const TAX_CONFIG = {
  seller: {
    legalName: process.env.NEXT_PUBLIC_SELLER_LEGAL_NAME || '',
    brandName: process.env.NEXT_PUBLIC_SELLER_BRAND_NAME || 'Miracle feng shui',
    country: 'India',
    countryCode: 'IN',
    state: process.env.NEXT_PUBLIC_SELLER_STATE || '',
    stateCode: process.env.NEXT_PUBLIC_SELLER_STATE_CODE || '',
    city: process.env.NEXT_PUBLIC_SELLER_CITY || '',
    pincode: process.env.NEXT_PUBLIC_SELLER_PINCODE || '',
    address: process.env.NEXT_PUBLIC_SELLER_ADDRESS || '',
    phone: process.env.NEXT_PUBLIC_SELLER_PHONE || '',
    email: process.env.NEXT_PUBLIC_SELLER_EMAIL || '',
    gstin: process.env.NEXT_PUBLIC_SELLER_GSTIN || '',       // Official India GSTIN Number
    pan: process.env.NEXT_PUBLIC_SELLER_PAN || '',              // Income Tax PAN (extracted from GSTIN)
    lutNumber: process.env.NEXT_PUBLIC_SELLER_LUT || '',   // Letter of Undertaking for Zero-rated Exports
    uaeTrn: process.env.NEXT_PUBLIC_SELLER_UAE_TRN || '',      // UAE Federal Tax Authority TRN
    uaeOfficeAddress: process.env.NEXT_PUBLIC_SELLER_UAE_ADDRESS || '',
  },
  rates: {
    indiaStandardGst: 18,           // 18% standard GST rate for sacred decor & brass items
    indiaJewelryGst: 3,             // 3% for precious gemstone jewelry
    uaeVat: 5,                      // 5% UAE standard VAT
  },
  defaultHsnCode: '71179090',       // Imitation jewelry, talisman art & sacred craft artifacts
};
