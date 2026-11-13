# Checkout Bug: "We couldn't confirm your payment yet" on already-successful payment

**Status:** Fixed on 2026-11-13: the verify fix in `main` `2458fcb` / `feng-shui-earth` `58ac05a`, and the double-payment follow-up in the commit after it on each branch.

**Reported symptom:** The message `checkout.verify_failed` ("We couldn't confirm your payment yet. Please don't pay again…") appeared in the checkout drawer even after Razorpay confirmed the payment and the customer reached the order-success page. The message surfaced after the submit button left its "Processing…" state.

**Verdict:** Real defect. A payment that went through could leave the customer on that message.

## How the payment flow works

The flow runs on two independent tracks:

1. **Client handler.** In `cart/components/CheckoutDrawer.tsx`, the Razorpay `handler` calls `POST /api/payments/verify`. On success it calls `finishOrder`, which opens `/order-confirmation`.
2. **Server webhook.** Razorpay also fires `payment.captured` → `paymentService.handleWebhook` → `completePayment` + confirmation email. This runs whatever the client handler does.

Both end in `checkoutSessionRepository.completePayment`, which writes the order exactly once. If both arrive together, the loser gets the existing order back (P2002 handling), so that race was already safe.

## Root cause

The handler, before the fix:

```js
handler: (response) => {
  postJson('/api/payments/verify', response)
    .then(finishOrder)
    .catch((err) => {
      stopProcessing(t('checkout.verify_failed', "We couldn't confirm your payment yet…"));
    });
},
```

1. **One attempt only.** A single failed verify request showed the warning at once. That covers a network drop, a server timeout returning a non-JSON page (`res.json()` throws), or a slow Razorpay response.
2. **The webhook had often already written the order.** The money was taken, the order existed and the email went out, but the customer was told it couldn't be confirmed.
3. **A retry couldn't have recovered.** `verifyPayment` re-ran the signature and amount checks before reaching `completePayment`. A deterministic failure, such as a wrong `RAZORPAY_KEY_SECRET` on the server, failed every time, while the webhook (which uses `RAZORPAY_WEBHOOK_SECRET`) still succeeded.
4. **`.then(finishOrder).catch(…)`** also turned any error while opening the order page into "couldn't confirm your payment".
5. **`ondismiss`** could show "you haven't been charged" if Razorpay closed its window after taking the payment.

## Reconciling "it went to the success page"

One verify attempt can't both open the order page and show the warning. The likely sequence was: verify failed, the warning showed, and the order (written by the webhook) was then seen separately on the order page or in the profile. Point 4 above was the other way both could happen together.

## Fix

**Server** (`server/services/payment.service.ts`, `verifyPayment`):
- After the ownership check, if an order already exists for this Razorpay order, it's returned straight away, skipping the signature and amount checks. The webhook has already done those checks.
- Only the customer who owns it gets it back, and no second email or notification is sent.

**Browser** (`cart/components/CheckoutDrawer.tsx`):
- `verifyPayment()` retries `/api/payments/verify` for about 15 seconds, waiting 1.5, 2.5, 4 and 6 seconds between attempts, before showing `verify_failed`. This is safe to repeat: once the order is written, the server just hands it back.
- `.then(finishOrder, onFailure)` replaces `.then().catch()`, so a problem opening the order page is never reported as a failed payment.
- A `paymentTaken` ref makes `ondismiss` ignore Razorpay closing its window after the payment.
- A `mounted` ref stops any message being set once the drawer has gone, after navigation.

**Tests** (`tests/services/payment.service.test.ts`):
- verify returns the webhook's order even when the browser's signature would fail
- another customer's order is never returned
- 358 tests pass on both branches

## Still worth checking

If customers see this often rather than rarely, search the live server logs for:

- `Invalid Razorpay payment signature`: `RAZORPAY_KEY_SECRET` on the server doesn't match the key the store uses.
- `Payment amount does not match` / `[PaymentService] amount mismatch` (earth logs the details): the captured amount differs from the checkout total.

The fix stops these from misleading customers when the webhook succeeds, but the setting or cause would still need correcting.

## Fixed follow-up: paying again after the verify window

**The risk (found 2026-11-13).** When the retry window ended without an order, `verify_failed` showed and `stopProcessing()` re-enabled the footer button as "Pay now". `createRazorpayOrder` always starts a fresh Razorpay order and checkout session, and everything is keyed on `razorpayOrderId`, so a second payment would be charged and written as a second `PAID` order with stock taken twice. Usually the cart is already empty by then (`completePayment` removes the bought items, and `create-order` refuses an empty cart). The gap was verify failing, the webhook not yet arrived, and the customer pressing "Pay now" again before either write landed.

**Fixed in both places:**

- **Browser** (`cart/components/CheckoutDrawer.tsx`): after `verify_failed`, a `paymentUnconfirmed` state turns the button into "View my orders" (`confirmation.view_orders`), which opens `/profile?tab=orders`. It never offers a second payment, whichever payment method is selected.
- **Server** (`server/services/payment.service.ts`, `settleUnconfirmedPayment`): before `createRazorpayOrder` starts a payment, it looks at this customer's unfinished checkouts from the last 30 minutes (up to 3, newest first, `checkoutSessionRepository.findRecentForUser`). It asks Razorpay (`orders.fetchPayments`) whether any was paid. If one was, it applies the webhook's checks (amount match, `completePayment`, confirmation email), writes that order, and refuses with 409 "Your earlier payment went through and your order is placed. Check your orders before paying again." If Razorpay can't be reached, checkout carries on rather than blocking sales, and the error is logged.
- **Tests:** an earlier paid checkout is written and the new payment refused; an unpaid one doesn't block; a Razorpay error doesn't block. 361 tests pass.

**Still open:** cash on delivery (`POST /api/orders`) doesn't run the server check. The browser button change covers it in the drawer, but the server alone wouldn't stop a COD order placed right after an unconfirmed online payment.

## Affected strings (lib/translations.ts)

- `checkout.verify_failed`: unchanged. It now shows only after about 15 seconds of retries with no order found, when "don't pay again, check your orders" is the right advice, and the button then leads to the orders page.
- `confirmation.view_orders`: reused for that button.
- Related, unchanged: `checkout.payment_not_completed`, `checkout.payment_load_failed`, `checkout.price_changed`, `checkout.order_failed`.
