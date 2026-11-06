import { calculateOrderTax } from './tax';
import { TAX_CONFIG } from './tax/config';

/** The seller block's lines, leaving out any detail that isn't set in .env. */
function sellerLines(isUAE: boolean): string[] {
  const s = TAX_CONFIG.seller;
  const joined = (parts: string[]) => parts.filter(Boolean).join(' &bull; ');
  const lines = [
    s.legalName ? `<strong>${s.legalName}</strong>` : '',
    isUAE
      ? joined([s.uaeTrn ? `UAE TRN: ${s.uaeTrn}` : ''])
      : joined([s.gstin ? `GSTIN: ${s.gstin}` : '', s.pan ? `PAN: ${s.pan}` : '']),
    isUAE ? s.uaeOfficeAddress : s.address,
    joined([s.email ? `Email: ${s.email}` : '', s.phone ? `Phone: ${s.phone}` : '']),
  ];
  return lines.filter(Boolean);
}


export interface TaxInvoiceData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    hsnCode?: string;
    maker?: string;
  }>;
}

export function generateTaxInvoiceHTML(data: TaxInvoiceData): string {
  const {
    orderId,
    orderDate,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    city,
    state,
    country = 'India',
    pincode,
    paymentMethod,
    paymentStatus,
    totalAmount,
    items,
  } = data;

  // Run through our standalone Tax Calculation Module
  const taxBreakdown = calculateOrderTax(
    items.map((it) => ({
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      hsnCode: it.hsnCode,
    })),
    {
      country,
      state: state || (deliveryAddress.includes('Maharashtra') ? 'Maharashtra' : ''),
      city,
      pincode,
      address: deliveryAddress,
    }
  );

  const isUAE = taxBreakdown.country === 'AE';
  const currencySymbol = taxBreakdown.currencySymbol;

  const itemsRows = taxBreakdown.items
    .map(
      (it, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; color: #4b5563; font-size: 12.5px;">${idx + 1}</td>
        <td style="padding: 10px 12px;">
          <div style="font-weight: 600; color: #111827; font-size: 13px;">${it.name}</div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 1px;">HSN: ${it.hsnCode}</div>
        </td>
        <td style="padding: 10px 12px; text-align: center; color: #374151; font-size: 12.5px;">${it.quantity}</td>
        <td style="padding: 10px 12px; text-align: right; color: #374151; font-size: 12.5px;">${currencySymbol}${it.taxableAmount.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: center; color: #374151; font-size: 12px;">${it.taxRate}%</td>
        <td style="padding: 10px 12px; text-align: right; color: #374151; font-size: 12.5px;">${currencySymbol}${it.taxAmount.toLocaleString()}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #111827; font-size: 13px;">${currencySymbol}${it.grossAmount.toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tax Invoice #${orderId} - Miracle Feng Shui</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f9fafb;
      color: #111827;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #111827;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11.5px;
      color: #4b5563;
      margin-top: 4px;
      line-height: 1.5;
    }
    .tax-badge {
      text-align: right;
    }
    .tax-badge h2 {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      letter-spacing: 0.5px;
    }
    .tax-badge p {
      font-size: 12px;
      color: #6b7280;
      margin-top: 2px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
      font-size: 12.5px;
    }
    .meta-box {
      background: #f9fafb;
      padding: 14px 16px;
      border-radius: 8px;
      border: 1px solid #f3f4f6;
    }
    .meta-box h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #9ca3af;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .meta-box p {
      color: #374151;
      line-height: 1.5;
    }
    .meta-box strong {
      color: #111827;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table th {
      background: #f3f4f6;
      padding: 9px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #4b5563;
      font-weight: 700;
      border-bottom: 1px solid #e5e7eb;
    }
    .totals-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      margin-bottom: 28px;
    }
    .totals-box {
      width: 320px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12.5px;
      color: #4b5563;
    }
    .totals-row.grand-total {
      border-top: 2px solid #111827;
      border-bottom: 2px solid #111827;
      margin-top: 6px;
      padding: 8px 0;
      font-size: 15px;
      font-weight: 800;
      color: #111827;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #6b7280;
    }
    .auth-sign {
      text-align: right;
    }
    .auth-sign-box {
      border-bottom: 1px dashed #9ca3af;
      width: 140px;
      height: 35px;
      margin-left: auto;
      margin-bottom: 4px;
    }
    .print-bar {
      max-width: 820px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn-print {
      background: #111827;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .print-bar { display: none !important; }
      .invoice-wrapper { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  <div class="invoice-wrapper">
    <div class="header">
      <div>
        <div class="brand-title">${TAX_CONFIG.seller.brandName}</div>
        <div class="brand-sub">
          ${sellerLines(isUAE).join('<br />')}
        </div>
      </div>
      <div class="tax-badge">
        <h2>${isUAE ? 'TAX INVOICE (VAT)' : 'TAX INVOICE (GST)'}</h2>
        <p>Original for Recipient</p>
        <p style="margin-top: 4px; font-weight: 700; color: #111827;">Invoice #: INV-${orderId}</p>
        <p>Date: ${orderDate}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Billed &amp; Shipped To:</h4>
        <p><strong>${customerName}</strong></p>
        <p>${deliveryAddress}</p>
        ${city || state ? `<p>${city ? city + ', ' : ''}${state || ''} ${pincode ? '- ' + pincode : ''}</p>` : ''}
        ${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ''}
        ${customerEmail ? `<p>Email: ${customerEmail}</p>` : ''}
        <p>Place of Supply: <strong>${state || (isUAE ? 'United Arab Emirates' : 'India')}</strong></p>
      </div>
      <div class="meta-box">
        <h4>Order &amp; Payment Details:</h4>
        <p>Order Reference: <strong>${orderId}</strong></p>
        <p>Payment Mode: <strong>${paymentMethod}</strong></p>
        <p>Payment Status: <strong style="color: #059669;">${paymentStatus}</strong></p>
        <p>Tax Regime: <strong>${taxBreakdown.taxTitle}</strong></p>
        <p>Prices: <strong>${taxBreakdown.isInclusive ? 'Inclusive of All Applicable Taxes' : 'Pre-Tax Pricing (Tax calculated on base item price)'}</strong></p>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align: left; width: 40px;">#</th>
          <th style="text-align: left;">Item Description</th>
          <th style="text-align: center; width: 50px;">Qty</th>
          <th style="text-align: right; width: 110px;">Taxable Base</th>
          <th style="text-align: center; width: 60px;">Rate</th>
          <th style="text-align: right; width: 90px;">Tax</th>
          <th style="text-align: right; width: 110px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div class="totals-container">
      <div class="totals-box">
        <div class="totals-row">
          <span>Total Taxable Base Amount:</span>
          <span>${currencySymbol}${taxBreakdown.totalTaxableAmount.toLocaleString()}</span>
        </div>

        ${
          taxBreakdown.cgstTotal !== undefined && taxBreakdown.sgstTotal !== undefined
            ? `
          <div class="totals-row">
            <span>CGST (9%):</span>
            <span>${currencySymbol}${taxBreakdown.cgstTotal.toLocaleString()}</span>
          </div>
          <div class="totals-row">
            <span>SGST (9%):</span>
            <span>${currencySymbol}${taxBreakdown.sgstTotal.toLocaleString()}</span>
          </div>
        `
            : ''
        }

        ${
          taxBreakdown.igstTotal !== undefined
            ? `
          <div class="totals-row">
            <span>IGST (18%):</span>
            <span>${currencySymbol}${taxBreakdown.igstTotal.toLocaleString()}</span>
          </div>
        `
            : ''
        }

        ${
          taxBreakdown.vatTotal !== undefined
            ? `
          <div class="totals-row">
            <span>UAE VAT (5%):</span>
            <span>${currencySymbol}${taxBreakdown.vatTotal.toLocaleString()}</span>
          </div>
        `
            : ''
        }

        <div class="totals-row">
          <span>Shipping &amp; Consecration Fee:</span>
          <span style="color: #059669; font-weight: 600;">FREE</span>
        </div>

        <div class="totals-row grand-total">
          <span>Total Amount Payable:</span>
          <span>${currencySymbol}${taxBreakdown.totalAmountWithTax.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>
        <p>• All sacred talismans and cures are consecrated and authenticity certified.</p>
        <p>• This is a computer-generated tax invoice and requires no physical signature.</p>
      </div>
      <div class="auth-sign">
        <div class="auth-sign-box"></div>
        <p>Authorized Signatory<br /><strong>${TAX_CONFIG.seller.brandName}</strong></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function printIsolatedTaxInvoice(data: TaxInvoiceData): void {
  if (typeof window === 'undefined') return;

  const orderNum = data.orderId || 'MFS-100000';
  const query = new URLSearchParams({
    customerName: data.customerName || 'Valued Customer',
    total: String(data.totalAmount || 0),
    address: data.deliveryAddress || '',
    paymentMethod: data.paymentMethod || 'Online Payment',
    itemTitle: data.items?.[0]?.name || 'Consecrated Feng Shui Item',
    view: '1',
  }).toString();

  // Opens genuine PDF directly in browser / iOS Safari reader
  window.open(`/api/orders/${encodeURIComponent(orderNum)}/invoice?${query}`, '_blank');
}

export async function downloadStandaloneTaxInvoice(data: TaxInvoiceData): Promise<void> {
  if (typeof window === 'undefined') return;

  const orderNum = data.orderId || 'MFS-100000';
  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  try {
    // 1. Attempt POST to API endpoint to receive verified PDF binary
    const res = await fetch(`/api/orders/${encodeURIComponent(orderNum)}/invoice?download=1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Tax-Invoice-${orderNum}.pdf`;

      if (isMobile) {
        link.target = '_blank';
      }

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 4000);
      return;
    }
  } catch (err) {
    console.warn('PDF POST generation failed, falling back to direct PDF GET endpoint:', err);
  }

  // 2. Direct fallback GET request for genuine PDF
  const query = new URLSearchParams({
    customerName: data.customerName || 'Valued Customer',
    total: String(data.totalAmount || 0),
    address: data.deliveryAddress || '',
    paymentMethod: data.paymentMethod || 'Online Payment',
    itemTitle: data.items?.[0]?.name || 'Consecrated Feng Shui Item',
    download: '1',
  }).toString();

  const getUrl = `/api/orders/${encodeURIComponent(orderNum)}/invoice?${query}`;
  const link = document.createElement('a');
  link.href = getUrl;
  link.download = `Tax-Invoice-${orderNum}.pdf`;
  if (isMobile) {
    link.target = '_blank';
  }
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
  }, 2000);
}
