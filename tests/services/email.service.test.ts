import { describe, it, expect } from 'vitest';
import { emailService } from '@/server/services/email.service';

describe('EmailService', () => {
  it('should successfully generate and process order confirmation email', async () => {
    const result = await emailService.sendOrderConfirmationEmail({
      orderNumber: 'MFS-TEST99',
      customerName: 'Test Customer',
      email: 'customer@example.com',
      phone: '+91 98765 43210',
      address: 'Plot 42, Connaught Place, New Delhi',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending COD',
      totalAmount: 2430,
      items: [
        {
          id: 'item-1',
          title: 'Taoist Master Blessed Five Emperor Coins',
          price: 2430,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7',
        },
      ],
      date: '21 Sept 2026',
    });

    expect(result.success).toBe(true);
  });

  it('should gracefully handle empty email address without throwing', async () => {
    const result = await emailService.sendOrderConfirmationEmail({
      orderNumber: 'MFS-NOEMAIL',
      customerName: 'No Email User',
      email: '',
      address: 'Some address',
      paymentMethod: 'COD',
      totalAmount: 1000,
      items: [],
    });

    expect(result.success).toBe(false);
  });
});
