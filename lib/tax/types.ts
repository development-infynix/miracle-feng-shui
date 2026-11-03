export type SupportedCountry = 'IN' | 'AE' | 'GLOBAL';

export interface TaxItemInput {
  productId?: string;
  name: string;
  price: number;       // Unit price (tax inclusive by default in e-commerce)
  quantity: number;
  hsnCode?: string;    // India HSN Code (e.g. 7117 for jewelry/brass artifacts)
  customTaxRate?: number; // e.g. 0.18 for 18% or 0.05 for 5%
  maker?: string;
}

export interface TaxAddressInput {
  country?: string;    // 'India', 'IN', 'UAE', 'United Arab Emirates', 'AE'
  state?: string;      // 'Maharashtra', 'Karnataka', 'Dubai', 'Abu Dhabi', etc.
  city?: string;
  pincode?: string;
  address?: string;
}

export interface TaxLineItemBreakdown {
  name: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  taxableAmount: number; // Base price before tax
  taxAmount: number;     // Total tax on this item
  taxRate: number;       // Rate percentage (e.g. 18 or 5)
  cgstAmount?: number;   // India Intra-State (e.g. 9%)
  sgstAmount?: number;   // India Intra-State (e.g. 9%)
  igstAmount?: number;   // India Inter-State (e.g. 18%)
  vatAmount?: number;    // UAE VAT (5%)
}

export interface OrderTaxBreakdown {
  country: SupportedCountry;
  currency: 'INR' | 'AED';
  currencySymbol: string;
  taxType: 'GST_INTRA' | 'GST_INTER' | 'UAE_VAT' | 'ZERO_RATED_EXPORT';
  taxTitle: string;
  sellerGstin?: string;
  sellerTrn?: string;
  sellerState: string;
  isInclusive: boolean;
  totalGrossAmount: number;    // Subtotal (pre-tax base amount)
  totalTaxableAmount: number;  // Subtotal taxable base
  totalTaxAmount: number;      // Total tax (CGST+SGST / IGST / VAT)
  totalAmountWithTax: number;  // Grand total (Pre-tax base + Tax amount)
  cgstTotal?: number;
  sgstTotal?: number;
  igstTotal?: number;
  vatTotal?: number;
  items: TaxLineItemBreakdown[];
}
