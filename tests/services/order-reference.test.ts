import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateOrderAccessToken, generateOrderNumber } from '@/server/utils/orderReference';
import { checkoutSessionRepository } from '@/server/repositories/checkout-session.repository';
import { orderService } from '@/server/services/order.service';

afterEach(() => vi.restoreAllMocks());

describe('order numbers', () => {
  it('look like MFS-XXXX-XXXX, with no characters that are easy to mix up', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOrderNumber()).toMatch(/^MFS-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
    }
  });

  it("don't repeat across many draws", () => {
    const seen = new Set(Array.from({ length: 5000 }, generateOrderNumber));
    expect(seen.size).toBe(5000);
  });

  it('skip a number that is already taken', async () => {
    const taken = vi.spyOn(checkoutSessionRepository, 'orderNumberTaken').mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    const number = await checkoutSessionRepository.newOrderNumber();
    expect(taken).toHaveBeenCalledTimes(2);
    expect(taken.mock.calls[1][0]).toBe(number);
  });

  it('give up rather than reuse a number, after several taken in a row', async () => {
    vi.spyOn(checkoutSessionRepository, 'orderNumberTaken').mockResolvedValue(true);
    await expect(checkoutSessionRepository.newOrderNumber()).rejects.toThrow();
  });
});

describe('order access tokens', () => {
  it('are long, URL-safe and unique', () => {
    const tokens = Array.from({ length: 1000 }, generateOrderAccessToken);
    expect(new Set(tokens).size).toBe(1000);
    for (const token of tokens) expect(token).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it('reach the customer with their order, so links can use them', () => {
    const formatted = orderService.formatOrder({
      id: 'o1',
      orderNumber: 'MFS-7KQ2-9XPA',
      accessToken: 'tok_abc',
      status: 'PAID',
      createdAt: new Date(),
      items: [],
      refunds: [],
      shippingAddress: {},
    });
    expect(formatted.accessToken).toBe('tok_abc');
  });
});
