# Mail Setup Plan — Brevo (Transactional Emails)

## Goal
Send order-confirmed and shipped emails reliably via Brevo (Sendinblue).

## 1. Account & Domain
- Create Brevo account.
- Verify sender domain/email; add SPF, DKIM, DMARC records.
- Generate SMTP key (Settings → SMTP & API).

## 2. Environment (.env)
```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<brevo login email>
SMTP_PASS=<smtp key>
SMTP_SECURE=false
EMAIL_FROM="Miracle Feng Shui <care@yourdomain.com>"
```

## 3. Integration (SMTP, no code changes)
- Existing `server/services/email.service.ts` uses nodemailer with these env vars.
- Order confirmation already wired in `order.service.ts` and `payment.service.ts`.
- Restart app; emails route through Brevo.

## 4. Shipped Email
- Add `sendShippingEmail(order, tracking)` to `EmailService`.
- Trigger from admin order status change to `SHIPPED` with tracking number.
- Keep dispatch async (`.catch`) so checkout/admin never blocks.

## 5. Optional Template Migration
- Install `@getbrevo/brevo`.
- Create templates in Brevo dashboard; send via `sendTransacEmail` with `templateId` + `params`.
- Improves maintainability and A/B testing.

## 6. Verification
- Place test order; confirm email delivery + PDF invoice attachment.
- Check Brevo logs for bounce/spam.
