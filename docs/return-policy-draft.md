# Return policy draft

**Status:** Draft for review. It isn't live, and `app/return-policy/page.tsx` still shows the old wording.

This describes what the store now does. Please have someone qualified review it before publishing, because it's a commitment to customers. Fill in or confirm the items in **[brackets]**.

---

## Cancellations

You can request to cancel an order until it ships. Go to **Profile > Orders**, select **Cancel** on the order, and tell us why.

We review every request. Your order isn't cancelled until we approve the request, and we may decline it. You can make one cancellation request per order. Orders that have already shipped can't be cancelled this way.

We may also cancel an order ourselves, for example if an item is unavailable or was priced incorrectly.

## Refunds

Refunds apply to orders paid online that have been cancelled.

1. Go to **Profile > Orders** and select **Refund** on the cancelled order.
2. We review your request.
3. Once we approve it, the full amount goes back to your original payment method.

It may take up to **[7 working days]** after approval for the money to reach you. Your bank may take longer. **[Confirm this time with Razorpay.]**

If you paid on delivery and haven't paid yet, there's nothing to refund.

## Damaged items

If your item arrives damaged in transit, email **[care email address]** within **[48 hours or 7 days]** of delivery. Include photos or an unboxing video showing the outer box, the shipping label and the damage.

Once we've verified the damage, we'll send a free replacement. If we can't replace the item, we'll **[refund it]**.

## Returns

**[Decide: do you accept returns for change of mind, or wrong or defective items? State the time limit and who pays for shipping.]**

## Contact

**[Care email address]**

---

## Points to settle before publishing

- **Care email:** the code uses both `care.miraclefengshui@gmail.com` and `care@miraclefengshui.com`. Choose one.
- **Reporting window:** the return policy says 48 hours, but the terms say 7 days. Choose one.
- **Spiritual claims:** the old policy describes consecration ceremonies, and says returned items are never restocked. I left these out because I can't confirm them, and the admin can now return items to stock. Add back only what's true.
- **COD refusals:** the old policy threatens a permanent ban from cash on delivery. I left this out because COD is off and nothing in the store enforces it.
- **Other places to update:**
  - `app/return-policy/page.tsx`
  - `app/terms/page.tsx`
  - `checkout.policy_notice` in `lib/translations.ts`
  - The policy text in `server/services/invoice.service.ts`
  - The invoice text in `lib/invoice.ts`, if it repeats the wording
