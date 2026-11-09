# Security TODO — Customer Side Only

> Audit of the customer-facing app only (`app/admin`, `components/admin` excluded).
> Items are unchecked by design; ✅ marks a completed fix — this file is the source of truth for what's still open.

## 🔴 Critical / High — Fix First

### 1. Stored XSS via image upload ✅ DONE
- [x] Restrict `/api/upload` to ADMIN only — removed the `NODE_ENV === 'development'` customer bypass (`app/api/upload/route.ts`). Customer/anonymous uploads now 403.
- [x] Stop accepting `image/svg+xml` for uploads: removed from `ALLOWED_MIME_TYPES` (`server/controllers/upload.controller.ts`) and from the error message. Existing SVGs never served inline — `app/api/images/[...key]/route.ts` redirects them to storage (not in `SERVED_TYPES`), so they can't execute script in the app origin.

### 2. Payment amount never verified ✅ DONE
- [x] In `verifyPayment` and the `payment.captured` webhook (`server/services/payment.service.ts`), fetch the Razorpay payment entity and compare `payment.amount === Math.round(session.total * 100)`, `currency === 'INR'`, and status captured/authorized before creating a PAID order. New test: "writes nothing when the captured amount does not match the session total".
- [x] Verified live: two end-to-end orders (MFS-441673 and MFS-178463) created, verified (`POST /payments/verify 200`), and landed on `/order-confirmation` with no amount mismatch.

### 3. Order number enumeration → PII leak ✅ DONE
- [x] Order details and invoice already require sign-in and ownership (someone else's order returns 404), so a guessed number exposes nothing.
- [x] Order numbers are now `MFS-XXXX-XXXX` from a 32-character alphabet (~10^12) drawn with `crypto.randomInt` (`server/utils/orderReference.ts`), checked against orders and open checkouts before use on both the Razorpay and COD paths (`checkoutSessionRepository.newOrderNumber`). Existing orders keep their numbers.
- [x] Every order gets an unguessable `accessToken` when it's created; migration `20261109170000_backfill_order_access_tokens` gave existing orders one. Checkout's confirmation link carries `?order=<token>` instead of the number, and the order and invoice APIs accept it (still with the ownership check).

### 4. No rate limiting anywhere
- [ ] Add rate limiting (and ideally CAPTCHA/lockout) to: login (`credentials`), register, forgot/reset password, `verify-password`, `change-password`. Grep confirmed zero `rateLimit|throttle` hits.
- [ ] Add throttling to cart/checkout, order placement, review creation, and image fetching.

### 5. Oversell / negative stock (COD)
- [ ] Guard the COD decrement in `order.repository.ts:81-91` with `stock: { gte: item.quantity }` inside the transaction, and re-check stock inside the tx.
- [ ] Decide policy for the paid path (`checkout-session.repository.ts:94-104`): either reserve/hold stock at checkout-session creation, or fail/refund the second payment instead of clamping stock to 0 and still creating a PAID order.

### 6. Invoice tax mismatch ✅ DONE
- [x] Retail prices include GST. Default `calculateOrderTax` switched to tax-inclusive (`lib/tax/index.ts`), and invoice now passes `isInclusive: true`. Invoice Grand Total uses the charged `order.totalAmount` so it always matches what the customer paid. Tax base + GST/VAT rows still split out separately for transparency.

## 🟠 Medium

### 7. Verbose error leakage ✅ DONE
- [x] `handleError.ts` now returns "Something went wrong. Please try again." for any error that isn't an `ApiError` or a validation error, and logs the full error on the server. Common database errors get plain messages instead (not found → 404, already exists / still in use → 409).
- [x] Admin CSV import and export no longer return raw error messages either.

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
