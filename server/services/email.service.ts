import nodemailer from 'nodemailer';
import { invoiceService } from './invoice.service';

export interface OrderEmailItem {
  id?: string;
  title?: string;
  productName?: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  address: string;
  paymentMethod: string;
  paymentStatus?: string;
  totalAmount: number;
  items: OrderEmailItem[];
  date?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  /** The same transporter, for notice emails written outside this class. */
  getTransporterForNotices(): nodemailer.Transporter {
    return this.getTransporter();
  }

  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) return this.transporter;

    const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE !== 'false';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      });
    } else {
      // Fallback dev transporter that logs email
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
        buffer: true,
      });
    }

    return this.transporter;
  }

  async sendOrderConfirmationEmail(order: OrderEmailData): Promise<{ success: boolean; messageId?: string }> {
    if (!order.email) {
      console.warn('[EmailService] Cannot send confirmation email: Order has no email address.');
      return { success: false };
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'Miracle Feng Shui <care@miraclefengshui.com>';
    const subject = `Order Confirmed: #${order.orderNumber} - Miracle Feng Shui`;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const itemsRows = order.items
      .map(
        (it) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
            ${
              it.image
                ? `<img src="${it.image}" alt="${it.title || it.productName || 'Item'}" style="width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; vertical-align: middle; margin-right: 12px;" />`
                : ''
            }
            <span style="font-weight: 600; color: #222222; font-size: 14px; vertical-align: middle;">
              ${it.title || it.productName || 'Feng Shui Sacred Item'}
            </span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center; color: #555555; font-size: 14px;">
            ${it.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 600; color: #111111; font-size: 14px;">
            ₹${(it.price * it.quantity).toLocaleString('en-IN')}
          </td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Confirmation #${order.orderNumber}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F5; margin: 0; padding: 32px 16px; color: #222222;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E1E3DF; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Banner -->
          <div style="background-color: #170E22; padding: 28px 24px; text-align: center; border-bottom: 3px solid #D4AF37;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
              Miracle Feng Shui
            </h1>
            <p style="color: #E9D5FF; margin: 6px 0 0 0; font-size: 12.5px; letter-spacing: 0.5px;">
              Sacred Living &bull; Energy Cures &bull; Consecrated Treasures
            </p>
          </div>

          <!-- Main Message -->
          <div style="padding: 32px 28px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; width: 56px; height: 56px; border-radius: 50%; background-color: #E8F5E9; color: #166534; font-size: 28px; line-height: 56px; text-align: center;">
                ✓
              </div>
              <h2 style="color: #111111; font-size: 22px; margin: 12px 0 6px 0; font-weight: 700;">
                Thank you for your order, ${order.customerName}!
              </h2>
              <p style="color: #595959; font-size: 14px; margin: 0; line-height: 1.5;">
                We have received order <strong>#${order.orderNumber}</strong>. Your items are being prepared with positive chi and sacred consecration.
              </p>
            </div>

            <!-- Order Key Summary Box -->
            <div style="background-color: #F8F6F2; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #E1E3DF;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 4px 0; color: #666666;">Order Number:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #111111;">#${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666666;">Payment Method:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111111;">${order.paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666666;">Payment Status:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #15803d;">${order.paymentStatus || 'Confirmed'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666666;">Estimated Delivery:</td>
                  <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #111111;">2–4 Business Days</td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <h3 style="font-size: 15px; font-weight: 700; color: #111111; margin: 0 0 12px 0;">
              Items in this shipment
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #FAF9F5; border-bottom: 2px solid #E1E3DF;">
                  <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #555555; text-transform: uppercase;">Product</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #555555; text-transform: uppercase; width: 60px;">Qty</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #555555; text-transform: uppercase; width: 90px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Totals -->
            <div style="border-top: 1px solid #E1E3DF; padding-top: 12px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 4px 0; color: #666666;">Delivery:</td>
                  <td style="padding: 4px 0; text-align: right; color: #15803d; font-weight: 600;">FREE</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #666666;">GST:</td>
                  <td style="padding: 4px 0; text-align: right; color: #666666;">Included</td>
                </tr>
                <tr style="font-size: 16px; font-weight: 700; color: #111111; border-top: 1px solid #E1E3DF;">
                  <td style="padding: 10px 0;">Grand Total:</td>
                  <td style="padding: 10px 0; text-align: right; color: #111111;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            <!-- Shipping Address -->
            <div style="background-color: #FAF9F5; border-radius: 12px; padding: 16px; border: 1px solid #E1E3DF; margin-bottom: 28px;">
              <h4 style="margin: 0 0 6px 0; font-size: 12.5px; text-transform: uppercase; color: #666666;">Shipping Address</h4>
              <p style="margin: 0; font-size: 13.5px; color: #222222; line-height: 1.5;">
                <strong>${order.customerName}</strong><br />
                ${order.address}
                ${order.phone ? `<br />Phone: ${order.phone}` : ''}
              </p>
            </div>

            <!-- CTA Action Button -->
            <div style="text-align: center; margin-bottom: 12px;">
              <a href="${baseUrl}/my-orders" style="display: inline-block; background-color: #111111; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
                View Order Status &bull; Miracle Feng Shui
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8F6F2; padding: 20px 24px; text-align: center; font-size: 11.5px; color: #777777; border-top: 1px solid #E1E3DF;">
            <p style="margin: 0 0 4px 0;">Need assistance? Reach our customer care team at <a href="mailto:care@miraclefengshui.com" style="color: #3A1F62; font-weight: 600;">care@miraclefengshui.com</a></p>
            <p style="margin: 0;">&copy; 2026 Miracle Feng Shui Pvt. Ltd. All rights reserved.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    try {
      const transporter = this.getTransporter();

      // Generate dynamic PDF Invoice attachment
      const attachments: any[] = [];
      try {
        const pdfBuffer = await invoiceService.generateInvoicePdf({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          email: order.email,
          phone: order.phone,
          address: order.address,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          items: order.items,
          date: order.date,
        });
        attachments.push({
          filename: `Invoice-${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
      } catch (pdfErr) {
        console.warn('[EmailService] Could not attach PDF invoice:', pdfErr);
      }

      const info = await transporter.sendMail({
        from,
        to: order.email,
        subject,
        html: htmlContent,
        attachments,
      });

      console.log(`[EmailService] Order confirmation email with PDF invoice sent to ${order.email} (Message ID: ${info.messageId || 'local-stream'})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] Failed to send order confirmation email:', err);
      return { success: false };
    }
  }

  async sendPasswordResetEmail(data: {
    email: string;
    name?: string;
    resetUrl: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    if (!data.email) {
      return { success: false };
    }

    const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'Miracle Feng Shui <care@miraclefengshui.com>';
    const subject = 'Reset Your Password - Miracle Feng Shui';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F5; margin: 0; padding: 32px 16px; color: #222222;">
        <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E1E3DF; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header Banner -->
          <div style="background-color: #170E22; padding: 26px 20px; text-align: center; border-bottom: 3px solid #D4AF37;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">
              Miracle Feng Shui
            </h1>
            <p style="color: #E9D5FF; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 0.5px;">
              Account Security &bull; Sanctuary Access
            </p>
          </div>

          <!-- Main Message -->
          <div style="padding: 32px 28px; text-align: center;">
            <div style="display: inline-block; width: 52px; height: 52px; border-radius: 50%; background-color: #F3EEFC; color: #3A1F62; font-size: 22px; line-height: 52px; text-align: center; margin-bottom: 16px;">
              🔒
            </div>
            
            <h2 style="color: #111111; font-size: 20px; margin: 0 0 10px 0; font-weight: 700;">
              Password Reset Request
            </h2>
            
            <p style="color: #555555; font-size: 14px; margin: 0 0 24px 0; line-height: 1.6;">
              Hello ${data.name || 'Seeker'},<br />
              We received a request to reset the password for your Miracle Feng Shui account. Click the button below to choose a new password.
            </p>

            <!-- Reset Button -->
            <div style="margin-bottom: 24px;">
              <a href="${data.resetUrl}" style="display: inline-block; background-color: #140D1F; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: 0.5px;">
                Reset Password
              </a>
            </div>

            <!-- Expiry Note -->
            <p style="color: #888888; font-size: 12px; margin: 0 0 16px 0; line-height: 1.5;">
              This link is secure and will expire in <strong>60 minutes</strong>.<br />
              If you did not request this, you can safely ignore this email. Your account remains protected.
            </p>

            <!-- Direct URL fallback -->
            <p style="color: #999999; font-size: 11px; margin: 0; word-break: break-all; border-top: 1px solid #F0EFEA; padding-top: 16px;">
              Button not working? Copy and paste this URL into your browser:<br />
              <a href="${data.resetUrl}" style="color: #C2410C;">${data.resetUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #F8F6F2; padding: 18px 20px; text-align: center; font-size: 11.5px; color: #777777; border-top: 1px solid #E1E3DF;">
            <p style="margin: 0;">&copy; 2026 Miracle Feng Shui Pvt. Ltd. All rights reserved.</p>
          </div>

        </div>
      </body>
      </html>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from,
        to: data.email,
        subject,
        html: htmlContent,
      });

      console.log(`[EmailService] Password reset email sent to ${data.email} (Message ID: ${info.messageId || 'local-stream'})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] Failed to send password reset email:', err);
      return { success: false };
    }
  }
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export type ReviewNotice = { kind: 'hidden'; because: string } | { kind: 'restored' };

/** Tells a customer what happened to their review. Never includes the admin's private note. */
export async function sendReviewNoticeEmail(
  service: EmailService,
  data: { email: string; name?: string; productTitle: string; productUrl: string; notice: ReviewNotice }
): Promise<{ success: boolean }> {
  if (!data.email) return { success: false };
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'Miracle Feng Shui <care@miraclefengshui.com>';
  const product = escapeHtml(data.productTitle);
  const { notice } = data;
  const subject =
    notice.kind === 'restored' ? `Your review of ${data.productTitle} is showing again` : `About your review of ${data.productTitle}`;
  const body =
    notice.kind === 'hidden'
      ? `Your review of <strong>${product}</strong> has been taken down from our store because ${escapeHtml(notice.because)}.<br /><br />
         On the product page you can see your review, and delete it to write a new one.`
      : `Your review of <strong>${product}</strong> is showing in our store again. Thank you for your patience.`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${escapeHtml(subject)}</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF9F5; margin: 0; padding: 32px 16px; color: #222222;">
      <div style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E1E3DF;">
        <div style="background-color: #170E22; padding: 22px 20px; text-align: center; border-bottom: 3px solid #D4AF37;">
          <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Miracle Feng Shui</h1>
        </div>
        <div style="padding: 28px;">
          <p style="color: #333333; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6;">
            Hello ${escapeHtml(data.name || 'there')},<br /><br />${body}
          </p>
          <a href="${escapeHtml(data.productUrl)}" style="display: inline-block; background-color: #140D1F; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 12px; font-size: 14px; font-weight: 700;">View the product</a>
          <p style="color: #888888; font-size: 12px; margin: 20px 0 0 0; line-height: 1.5;">Questions? Just reply to this email.</p>
        </div>
      </div>
    </body></html>`;

  try {
    const info = await service.getTransporterForNotices().sendMail({ from, to: data.email, subject, html });
    console.log(`[EmailService] Review notice (${notice.kind}) sent to ${data.email} (Message ID: ${info.messageId || 'local-stream'})`);
    return { success: true };
  } catch (err) {
    console.error('[EmailService] Failed to send review notice email:', err);
    return { success: false };
  }
}

export const emailService = new EmailService();
