import PDFDocument from 'pdfkit';
import { calculateOrderTax, TAX_CONFIG } from '../../lib/tax';
import { INVOICE_POLICY_NOTE, NO_CANCELLATION_INVOICE_NOTE } from '@/lib/invoicePolicy';

export interface InvoiceItem {
  id?: string;
  title?: string;
  productName?: string;
  price: number;
  quantity: number;
}

export interface InvoiceOrderData {
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  paymentMethod: string;
  paymentStatus?: string;
  totalAmount: number;
  items: InvoiceItem[];
  date?: string;
  /** False when the order was bought while the store didn't allow cancellation; the invoice then says so. */
  cancellationAllowed?: boolean;
}

export class InvoiceService {
  /**
   * Generates a branded, publication-ready PDF invoice buffer.
   */
  async generateInvoicePdf(order: InvoiceOrderData): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 45,
          size: 'A4',
          info: {
            Title: `Invoice ${order.orderNumber} - Miracle Feng Shui`,
            Author: 'Miracle Feng Shui Pvt. Ltd.',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const invoiceDate = order.date || new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        // 1. HEADER BRANDING & INVOICE TITLE
        doc
          .fillColor('#140D1F')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('MIRACLE FENG SHUI', 45, 45);

        doc
          .fillColor('#C2410C')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('CONSECRATED TREASURES & SACRED LIVING', 45, 68);

        // Right-aligned Invoice Badge & Number
        doc
          .fillColor('#140D1F')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('TAX INVOICE', 350, 45, { align: 'right', width: 200 });

        doc
          .fillColor('#555555')
          .fontSize(9)
          .font('Helvetica')
          .text(`Invoice No: INV-${order.orderNumber}`, 350, 68, { align: 'right', width: 200 })
          .text(`Date: ${invoiceDate}`, 350, 80, { align: 'right', width: 200 });

        // Decorative horizontal rule
        doc
          .strokeColor('#E1E3DF')
          .lineWidth(1)
          .moveTo(45, 100)
          .lineTo(550, 100)
          .stroke();

        // 2. SELLER & BUYER DETAILS SECTION
        const colTop = 112;

        // Seller Block
        doc
          .fillColor('#888888')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('SOLD BY:', 45, colTop);

        doc
          .fillColor('#222222')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(TAX_CONFIG.seller.legalName || TAX_CONFIG.seller.brandName, 45, colTop + 12)
          .font('Helvetica');
        // Only details set in .env are printed, each on the next free line.
        let sellerY = colTop + 24;
        if (TAX_CONFIG.seller.address) {
          doc.text(TAX_CONFIG.seller.address, 45, sellerY, { width: 250 });
          sellerY += 24;
        }
        if (TAX_CONFIG.seller.email) {
          doc.text(`Email: ${TAX_CONFIG.seller.email}`, 45, sellerY);
          sellerY += 12;
        }
        if (TAX_CONFIG.seller.gstin) doc.text(`GSTIN: ${TAX_CONFIG.seller.gstin}`, 45, sellerY);

        // Buyer Block
        doc
          .fillColor('#888888')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('BILLED & SHIPPED TO:', 320, colTop);

        doc
          .fillColor('#222222')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(order.customerName || 'Valued Customer', 320, colTop + 12)
          .font('Helvetica')
          .text(order.address || 'Address on file', 320, colTop + 24, { width: 230 });

        const buyerAddressY = doc.y;
        doc
          .text(`Phone: ${order.phone || 'N/A'}`, 320, buyerAddressY + 2)
          .text(`Email: ${order.email || 'N/A'}`, 320, buyerAddressY + 14)
          .text(`Payment: ${order.paymentMethod || 'Online Payment'} (${order.paymentStatus || 'Confirmed'})`, 320, buyerAddressY + 26);

        // 3. LINE ITEMS TABLE
        const tableTop = Math.max(doc.y + 20, 215);

        // Table Header Background
        doc
          .rect(45, tableTop, 505, 22)
          .fill('#FAF9F5');

        doc
          .fillColor('#333333')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text('#', 55, tableTop + 6)
          .text('ITEM DESCRIPTION', 80, tableTop + 6)
          .text('QTY', 360, tableTop + 6, { width: 40, align: 'center' })
          .text('PRICE', 410, tableTop + 6, { width: 60, align: 'right' })
          .text('TOTAL', 480, tableTop + 6, { width: 60, align: 'right' });

        doc
          .strokeColor('#E1E3DF')
          .lineWidth(0.5)
          .moveTo(45, tableTop + 22)
          .lineTo(550, tableTop + 22)
          .stroke();

        let currentY = tableTop + 28;
        const items = order.items && order.items.length > 0 ? order.items : [
          {
            title: 'Consecrated Feng Shui Sacred Item',
            price: Number(order.totalAmount) || 2433,
            quantity: 1,
          },
        ];

        items.forEach((item, index) => {
          const itemTitle = item.title || item.productName || 'Consecrated Feng Shui Item';
          const itemPrice = Number(item.price) || 0;
          const itemQty = Number(item.quantity) || 1;
          const lineTotal = itemPrice * itemQty;

          doc
            .fillColor('#666666')
            .fontSize(8.5)
            .font('Helvetica')
            .text(`${index + 1}`, 55, currentY);

          doc
            .fillColor('#111111')
            .font('Helvetica-Bold')
            .text(itemTitle, 80, currentY, { width: 270 });

          const rowHeight = Math.max(doc.y - currentY, 16);

          doc
            .font('Helvetica')
            .text(`${itemQty}`, 360, currentY, { width: 40, align: 'center' })
            .text(`INR ${itemPrice.toLocaleString('en-IN')}`, 410, currentY, { width: 60, align: 'right' })
            .font('Helvetica-Bold')
            .text(`INR ${lineTotal.toLocaleString('en-IN')}`, 480, currentY, { width: 60, align: 'right' });

          currentY += rowHeight + 8;

          // Row divider
          doc
            .strokeColor('#F0EFEA')
            .lineWidth(0.5)
            .moveTo(45, currentY - 4)
            .lineTo(550, currentY - 4)
            .stroke();
        });

        // 4. TOTALS SUMMARY BLOCK & DYNAMIC GST/VAT CALCULATION
        const taxBreakdown = calculateOrderTax(
          items.map((it) => ({
            name: it.title || it.productName || 'Consecrated Feng Shui Item',
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
          })),
          {
            country: order.address?.toLowerCase().includes('uae') || order.address?.toLowerCase().includes('dubai') || order.address?.toLowerCase().includes('emirates') ? 'AE' : 'IN',
            state: order.state || (order.address?.toLowerCase().includes('maharashtra') ? 'Maharashtra' : ''),
            city: order.city,
            pincode: order.pincode,
            address: order.address,
          },
          { isInclusive: true }
        );

        const currSym = taxBreakdown.currencySymbol || 'INR';
        const totalAmountVal = Number(order.totalAmount) || taxBreakdown.totalAmountWithTax || 0;
        let totalsY = Math.max(currentY + 10, 320);

        // Subtotal (Taxable Base Amount)
        doc
          .fillColor('#666666')
          .fontSize(8.5)
          .font('Helvetica')
          .text('Subtotal (Taxable Base):', 320, totalsY, { width: 140, align: 'right' })
          .font('Helvetica-Bold')
          .fillColor('#222222')
          .text(`${currSym} ${taxBreakdown.totalTaxableAmount.toLocaleString('en-IN')}`, 470, totalsY, { width: 70, align: 'right' });

        // GST / VAT rows
        if (taxBreakdown.cgstTotal !== undefined && taxBreakdown.sgstTotal !== undefined) {
          totalsY += 14;
          doc
            .font('Helvetica')
            .fillColor('#666666')
            .text('CGST (9%):', 320, totalsY, { width: 140, align: 'right' })
            .font('Helvetica-Bold')
            .fillColor('#222222')
            .text(`${currSym} ${taxBreakdown.cgstTotal.toLocaleString('en-IN')}`, 470, totalsY, { width: 70, align: 'right' });

          totalsY += 14;
          doc
            .font('Helvetica')
            .fillColor('#666666')
            .text('SGST (9%):', 320, totalsY, { width: 140, align: 'right' })
            .font('Helvetica-Bold')
            .fillColor('#222222')
            .text(`${currSym} ${taxBreakdown.sgstTotal.toLocaleString('en-IN')}`, 470, totalsY, { width: 70, align: 'right' });
        } else if (taxBreakdown.igstTotal !== undefined) {
          totalsY += 14;
          doc
            .font('Helvetica')
            .fillColor('#666666')
            .text('IGST (18%):', 320, totalsY, { width: 140, align: 'right' })
            .font('Helvetica-Bold')
            .fillColor('#222222')
            .text(`${currSym} ${taxBreakdown.igstTotal.toLocaleString('en-IN')}`, 470, totalsY, { width: 70, align: 'right' });
        } else if (taxBreakdown.vatTotal !== undefined) {
          totalsY += 14;
          doc
            .font('Helvetica')
            .fillColor('#666666')
            .text('UAE VAT (5%):', 320, totalsY, { width: 140, align: 'right' })
            .font('Helvetica-Bold')
            .fillColor('#222222')
            .text(`${currSym} ${taxBreakdown.vatTotal.toLocaleString('en-IN')}`, 470, totalsY, { width: 70, align: 'right' });
        }

        totalsY += 14;
        // Shipping
        doc
          .font('Helvetica')
          .fillColor('#666666')
          .text('Shipping & Handling:', 320, totalsY, { width: 140, align: 'right' })
          .font('Helvetica-Bold')
          .fillColor('#15803d')
          .text('FREE', 470, totalsY, { width: 70, align: 'right' });

        totalsY += 16;
        doc
          .strokeColor('#E1E3DF')
          .lineWidth(1)
          .moveTo(340, totalsY)
          .lineTo(550, totalsY)
          .stroke();

        totalsY += 6;
        doc
          .fillColor('#140D1F')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Grand Total:', 320, totalsY, { width: 140, align: 'right' })
          .text(`${currSym} ${totalAmountVal.toLocaleString('en-IN')}`, 470, totalsY, { width: 70, align: 'right' });

        // 5. LEGAL NOTICE & FOOTER
        let footerY = Math.max(totalsY + 80, 680);
        if (footerY > 740) {
          doc.addPage();
          footerY = 700;
        }

        doc
          .strokeColor('#E1E3DF')
          .lineWidth(0.5)
          .moveTo(45, footerY)
          .lineTo(550, footerY)
          .stroke();

        doc
          .fillColor('#888888')
          .fontSize(7.5)
          .font('Helvetica-Bold')
          .text('POLICY & SACRED LIVING NOTICE:', 45, footerY + 8)
          .font('Helvetica')
          .text(
            order.cancellationAllowed === false ? `${INVOICE_POLICY_NOTE} ${NO_CANCELLATION_INVOICE_NOTE}` : INVOICE_POLICY_NOTE,
            45,
            footerY + 18,
            { width: 505 }
          );

        doc
          .fillColor('#555555')
          .fontSize(7.5)
          .text(
            'This is a computer-generated tax invoice and requires no physical signature. Thank you for inviting prosperity home!',
            45,
            footerY + 44,
            { align: 'center', width: 505 }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}

export const invoiceService = new InvoiceService();
