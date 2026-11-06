# Security TODO — Customer Side Only

> Audit of the customer-facing app only (`app/admin`, `components/admin` excluded).
> Items are unchecked by design; ✅ marks a completed fix — this file is the source of truth for what's still open.

## 🔴 Critical / High — Fix First

### 1. Stored XSS via image upload
- [ ] Restrict `/api/api/upload` to ADMIN only — remove the `NODE_ENV === 'development'` customer bypass (`app/api/upload/route.ts:11-14`).
- [ ] Stop accepting/serving `image/svg+xml` for customer uploads (`server/controllers/upload.controller.ts:14`). Serve uploads with `Content-Disposition: attachment` or `Content-Security-Policy: default-src 'none'; sandbox` for SVG if SVG is ever needed.

### 2. Payment amount never verified ✅ DONE
- [x] In `verifyPayment` and the `payment.captured` webhook (`server/services/payment.service.ts`), fetch the Razorpay payment entity and compare `payment.amount === Math.round(session.total * 100)`, `currency === 'INR'`, and status captured/authorized before creating a PAID order. New test: "writes nothing when the captured amount does not match the session total".
- [x] Verified live: two end-to-end orders (MFS-441673 and MFS-178463) created, verified (`POST /payments/verify 200`), and landed on `/order-confirmation` with no amount mismatch.

### 3. Order number enumeration → PII leak
- [ ] Replace the 6-digit `MFS-` random order number (900k space, `Math.random`) with an unguessable ID (`order.service.ts:191`), and increase entropy / use CSPRNG. Use the new `Order.accessToken` for lookups everywhere customer-facing orders are fetched.
- [ ] Resolve the orderNumber uniqueness-check gap in the generic `POST /api/orders` path (currently only the Razorpay path loops against existing orders+sessions).
- [x] Foundation: added unguessable `Order.accessToken` (unique) to the `Order` model for customer-facing lookups; `orderNumber` is display-only. Migration + code wiring still open.

### 4. No rate limiting anywhere
- [ ] Add rate limiting (and ideally CAPTCHA/lockout) to: login (`credentials`), register, forgot/reset password, `verify-password`, `change-password`. Grep confirmed zero `rateLimit|throttle` hits.
- [ ] Add throttling to cart/checkout, order placement, review creation, and image fetching.

### 5. Oversell / negative stock (COD)
- [ ] Guard the COD decrement in `order.repository.ts:81-91` with `stock: { gte: item.quantity }` inside the transaction, and re-check stock inside the tx.
- [ ] Decide policy for the paid path (`checkout-session.repository.ts:94-104`): either reserve/hold stock at checkout-session creation, or fail/refund the second payment instead of clamping stock to 0 and still creating a PAID order.

### 6. Invoice tax mismatch
- [ ] Fix `calculateOrderTax` default (`lib/tax/index.ts:23-26`, `invoice.service.ts:211-227`): either store tax-inclusive totals at order time or add a tax line to cart/order. Invoice Grand Total (₹1,180) must equal amount charged (₹1,000).

## 🟠 Medium

### 7. Verbose error leakage
- [ ] Return a generic message for non-`ApiError` errors in `handleError.ts:30-31` (stop returning `error.message` verbatim — Prisma/Razorpay/S3 internals).

### 8. Unauthenticated S3 fetch
- [ ] Require auth on `/api/images/[...key]` and restrict keys to an `uploads/` prefix (`app/api/images/[...key]/route.ts:14-38`).

### 9. Dev-admin bypass
- [ ] Gate `ALLOW_DEV_ADMIN` so it can never be enabled in production (`middleware.ts:10`, `withAuth.ts:27`).

### 10. Weak passwords, user enumeration, stale sessions
- [ ] Raise the 6-character minimum + add complexity/length requirements (`auth.validator.ts`).
- [ ] Remove the 409 "account exists" enumeration from register (uniform response).
- [ ] Invalidate all sessions on password change/reset (session-version bump in `user.repository.ts:updatePassword`).

### 11. Middleware protection gap
- [ ] Add `/api/orders/[id]/*`, `/api/payments/*`, `/api/images/*` to the protected matcher in `middleware.ts:75-88` (defense-in-depth beyond each route's `withAuth`).

### 12. COD abuse controls
- [ ] Per-user COD order frequency cap + address verification before immediate stock decrement (`order.service.ts:createFromCart`).

### 13. Phantom PENDING orders
- [ ] Reject `POST /api/orders` with `paymentMethod: RAZORPAY` (or make it create no order) — currently creates unpaid PENDING orders indefinitely (`order.service.ts:191-207`).

### 14. Duplicate checkout / idempotency
- [ ] Add idempotency keys to COD order creation (`order.service.ts:148`) and reuse a single Razorpay checkout session per cart instead of minting a new one per `create-order` call (`payment.service.ts:106-130`).

### 15. COD total re-confirmation
- [ ] Mirror the online path's amount check for COD (`CheckoutDrawer.tsx:229`) — confirm with the user if the server total differs from the displayed subtotal.

### 16. Password reset trim bug
- [ ] Trim the new password in `resetPassword` (`auth.service.ts:112-126`) to match login/change behavior.

### 17. Currency / UAE tax inconsistencies
- [ ] Fix UAE invoice: amounts are INR labeled AED, and UAE detection depends on address keywords (`lib/tax/index.ts:83-84`, invoice route passes only `line1+line2`).
- [ ] Fix per-line vs total AED rounding drift (`CurrencyContext.tsx`, `CartItemRow.tsx`).

## 🟡 Low

- [ ] Require a purchase to post a product review (`review.service.ts`).
- [ ] Add `.max()` length to password validators.
- [ ] Enforce saved-address ownership on order placement, or document the free-form snapshot as intentional (`order.validator.ts:3`).

---

## N+1 / Performance (Performance, not Security)

- [ ] `order.service.ts:165-166` — cart is already loaded; stop per-item `findBySlugOrId` re-fetch (use `item.product`).
- [ ] `payment.service.ts:71-72` — same per-item `findById` redundancy in Razorpay order creation.
- [ ] `order.repository.ts:82-87` / `checkout-session.repository.ts:94-104` — batch/parallelize stock decrements.
- [ ] `cart.service.ts:54-77` — per-mutation double cart load; `order.service.ts:237-246` / `refund.service.ts:61-72` — double `findById`.
- [ ] `refund.repository.ts:153-158` — parallelize stock restore.
