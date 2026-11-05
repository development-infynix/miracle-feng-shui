# Refund plan

**Status:** Built, with these differences from the proposal below:

- Refunds are for the full order amount only, because they follow a cancellation. There's no partial amount in the admin.
- The customer starts the refund with a request, and the owner approves it in the admin.
- Every item in the order returns to stock when an approved refund completes, with no per-item choice. A refund made in the Razorpay dashboard leaves stock alone, because it can be partial.
- There's no `PARTIALLY_REFUNDED` status. A partial refund made in the Razorpay dashboard is recorded, and the order stays `PAID`.
- Emails aren't sent yet.

The sections below are the original proposal, kept for reference. Copy for the new policy is in `docs/return-policy-draft.md`.

## Why this is needed

The store can't record or issue refunds today.

| Area | Today |
|---|---|
| Razorpay library (v2.9.8) | Supports full and partial refunds, but nothing calls them |
| `PaymentStatus` | `REFUNDED` exists, but nothing sets it |
| `Order` | Stores `razorpayPaymentId`, but no refund ID or amount |
| Admin | Can set an order to Cancelled, but has no refund action |
| Cancelling a paid order | Doesn't refund the money or return the stock, and the order still shows as PAID |
| Webhook (`payment.service.ts`) | Handles only `payment.captured` and `payment.failed` |
| Customer order pages | Show no refund status |

The store can need to refund when:

- two customers pay for the last item
- the shop cancels an order, which the terms allow
- a payment arrives after its order was cancelled
- a replacement for transit damage isn't possible

## Decisions needed

| # | Decision | Recommendation |
|---|---|---|
| 1 | Build Phase 1 only, or Phases 1 and 2? | Both, so a refund can be issued from the order it belongs to |
| 2 | Approve admin changes for Phase 2? | Needed for the Refund button |
| 3 | What should the refund policy say? | Have someone qualified review the wording before go-live |
| 4 | Offer instant refunds? | Start with normal speed only, because instant refunds cost extra |

## Phase 1: Record refunds (no admin changes)

Refunds are issued in the Razorpay dashboard, and the store records them through webhooks.

### Database

Add a migration that changes `PaymentStatus` and adds a `Refund` table. One order can have several partial refunds, so the refunds can't be stored as fields on `Order`.

- Add `PARTIALLY_REFUNDED` to `PaymentStatus`.
- Add this model, plus the `refunds Refund[]` relation on `Order`:

```prisma
enum RefundStatus {
  PENDING
  PROCESSED
  FAILED
}

model Refund {
  id               String       @id @default(cuid())
  orderId          String
  order            Order        @relation(fields: [orderId], references: [id])
  razorpayRefundId String?      @unique
  amountPaise      Int
  status           RefundStatus @default(PENDING)
  reason           String?
  createdById      String?      // null when the refund came from the dashboard
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([orderId])
}
```

Amounts use whole paise because Razorpay does. `Order.total` is a `Float`, so it needs careful conversion in one shared helper.

### Webhooks

Add these events to `paymentService.handleWebhook`:

| Event | What the store does |
|---|---|
| `refund.created` | Creates the refund as `PENDING` if it doesn't exist |
| `refund.processed` | Marks the refund `PROCESSED` and updates the order's payment status |
| `refund.failed` | Marks the refund `FAILED` and leaves the order's payment status unchanged |

- **Repeated or out-of-order events:** match on `razorpayRefundId`. A late `refund.created` can't undo `PROCESSED`.
- **Finding the order:** use the event's payment ID to look up `Order.razorpayPaymentId`. Log an unmatched event and don't create a refund for it.
- **Payment status:** work it out from the sum of `PROCESSED` refunds. Below the order total it's `PARTIALLY_REFUNDED`, and at the total it's `REFUNDED`.

### Customer side

- `orderService.formatOrder` returns a short refund summary.
- The Orders tab and order confirmation page show "Refund processing", "Partly refunded" or "Refunded", with the amount.
- The customer gets an email when a refund is processed, once SMTP is set up.
- Check every `paymentStatus === 'PAID'` condition so a refunded order doesn't show the wrong outcome or invoice state.

## Phase 2: Refund button in the admin (needs approval)

### API

Add `POST /api/admin/orders/[id]/refunds`, restricted with `withRole`. It takes the amount, reason and any items to return to stock.

The server checks that:

- the order is paid online and has a `razorpayPaymentId`
- the amount is above zero and within the remaining refundable amount
- the remaining amount counts both `PENDING` and `PROCESSED` refunds

### Avoiding double refunds

1. In a transaction, lock the order, check the remaining amount, and create a `PENDING` refund.
2. Call `razorpay.payments.refund(paymentId, { amount, speed: 'normal', notes: { refundId } })`.
3. Save the returned `razorpayRefundId`.

Each failure or timing case has its own handling:

- **Razorpay rejects the request:** mark the refund `FAILED`, which frees the amount.
- **The request times out:** keep the refund `PENDING`, because the money may have moved. Check it with `payments.fetchMultipleRefund` before anyone retries.
- **The webhook arrives before step 3:** match it through `notes.refundId` so it doesn't create a second refund.

Before building, confirm whether Razorpay's refund idempotency header can be sent through this SDK. If it can, use the refund's ID as the key.

### Admin screen

- Add a Refund action on paid orders, showing paid, already refunded and remaining amounts.
- Offer a full amount by default, with a partial amount option.
- Require a reason and a confirmation step.
- List the order's refunds with their amounts and statuses.
- When a paid order is cancelled, warn that the cancellation doesn't refund the money, and link to the Refund action.

### Returning stock

Stock return is chosen per item, because a damaged item shouldn't go back on sale. It's applied once, when Razorpay accepts the refund.

## Not included

- Customer-requested refunds or returns
- Automatic refunds when an order is cancelled
- Cash-on-delivery refunds. COD is off, and if it returns these would be recorded by hand

## Before go-live

- [ ] Update the return policy, terms, invoice text and `checkout.policy_notice` to match the agreed policy.
- [ ] Ask an accountant how refunds affect GST records, including whether credit notes are needed.
- [ ] Confirm Razorpay's refund timing, balance requirements and fee treatment for this account.
- [ ] Set `RAZORPAY_WEBHOOK_SECRET`, and subscribe to the three `refund.*` events.
- [ ] Run `prisma migrate deploy` on the production database.

## Testing

**Automated**

- Full, partial and repeated partial refunds
- Refunds over the remaining amount, and two refund requests at once
- Refused and timed-out Razorpay calls
- Repeated, out-of-order and unmatched webhooks, and invalid signatures
- Non-admin access, and refunds on unpaid or COD orders
- Stock returned once only

**End to end, with Razorpay test keys**

- Pay, refund, and check the admin and customer views.
- Webhooks need a deployed test site, because Razorpay can't reach `localhost`.
- Use a throwaway account and delete it afterwards.
