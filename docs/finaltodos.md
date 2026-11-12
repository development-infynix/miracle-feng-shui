# Final TODOs

**Last checked:** 2026-11-11, against the code and the shared database. `main` at `a04ec48`, `feng-shui-earth` at `d0d208e`, both in sync with GitHub.
Checkboxes: `[ ]` open, `[x]` done. Admin and server changes go to both branches; storefront changes are restyled for earth.

## Suggested order

1. Rate limiting (F5). With reviews now open to any signed-in customer, it matters more.
2. Credit note for refunds (F2). Ask the CA about the format now.
3. Status emails (F1). Less urgent now that customers get in-app notifications (F19).
4. Drop the unused review-request columns (F20) once the test app is redeployed.
5. The rest, as time allows.

## Gaps from this week's features

- [ ] **F1. Emails after the order confirmation.** Only the order confirmation, password reset and review notices are emailed (`server/services/email.service.ts`). Shipped, delivered, store cancellation and refund now reach customers as in-app notifications (F19), but not by email.
- [ ] **F2. Credit note for refunds.** The original invoice stays correct, but a refund has no GST credit note (Section 34, CGST Act): its own number series (e.g. `MFS-CN-…`), referencing the invoice, with the amount and tax reversed. Offer "Credit note" next to "Invoice" once a refund is processed, for the customer and in the admin drawer. Confirm the format with the CA.
- [x] **F3. Made-up tracking number.** Done 2026-11-11 (`44078cb` main, `70cd167` earth): the fake `IND…IN` number and the fake "BlueDart Express" courier are gone; tracking shows only once a real number is added.
- [ ] **F4. Approved cancellation with no refund request.** If a customer's cancellation is approved but they never tap Refund, the admin can't start the refund (`refund.service.ts` only starts one for store-cancelled orders).

## Security

- [ ] **F5. Rate limiting.** None anywhere. Add it to sign-in (credentials), register, forgot/reset password, verify-password and change-password; then cart/checkout, order placement and reviews.
- [x] **F6. Image route serves any storage key.** Done 2026-11-11 (`eb3f92e` main, `fadcb20` earth): `/api/images/[...key]` serves only `uploads/` and `products/`, and refuses `.`/`..` segments.
- [x] **F7. Replace order Delete with Archive.** Done 2026-11-10 (`c2f88cc` main, `e943d60` earth): finished orders are archived, not deleted; order delete route removed; admin **Archive** page with Orders and Products tabs, restore only; product status Inactive renamed Archived. Products are never hard-deleted either: Delete always archives, blocked only by open orders (`94f42f5` main, `972ffcd` earth).

## Admin leftovers

- [x] **F8. Orphaned `/admin/homepage` page.** Done 2026-11-11 (`4706f29`, main only; earth never had it).
- [ ] **F9. Duplicate products.** 4 visible titles appear twice: New Income Source Card, Wealth Fortune Magnet Poster, Exam Ranking Success Poster, Workplace Peace Feng Shui Poster.
- [x] **F10. Archived filter.** Done with F7: archived products leave the Products list for the Archive page.
- [ ] **F11. Phone layout.** The admin orders and products pages are slightly too tall on phones (not re-checked recently).

## Code tidy-up

- [x] **F12. Lint errors.** The 2 `Date.now()` errors in `cart/components/CartView.tsx` are fixed on both branches (`bcc7b3b` main, `02e5420` earth). 76 warnings remain.
- [ ] **F13. `middleware.ts` → `proxy.ts`.** Next.js warns on every start; it still works for now.
- [ ] **F14. Stale docs.** `docs/todos.md` still lists the Users page (T-U9) and admin role checks as missing, but `app/admin/users` exists. `security-todo.md` is current.
- [ ] **F20. Drop the unused review-request columns.** `Review.appealMessage`, `appealedAt`, `appealResponse` and `appealResolvedAt` are no longer used (F17) but stay in the database because the deployed test app still reads them. Once it's redeployed from these branches, drop them in a migration. The `APPEALED` and `APPEAL_DECLINED` event values can stay for old history.

## Product and trust

- [x] **F17. Review moderation.** Done 2026-11-10 (`4fff987` main, `6d9c9be` earth): admin **Reviews** menu (filters, public reply, hide with a content reason; no rating-based reason); hidden reviews go to the Archive's Reviews tab, restorable. Changed 2026-11-11:
  - Any signed-in customer can review, once per product; only those who had the product delivered *before* reviewing get **Verified Purchase** (`5401fb0` main, `0787d9c` earth).
  - The "Ask us to look again" request is gone (`0841f0d` main, `086f153` earth). Taking a review down emails the author and shows them the reason on the product page, where they can delete it and write a new one. Repeat offenders: deactivate the account.
  - A take-down isn't an in-app notification; "Your review is back" is (`a04ec48` main, `d0d208e` earth).
- [ ] **F18. Hand-set product ratings.** 29 products show a star rating with no reviews; the rating is typed by the admin, not averaged from reviews. Decide whether ratings should come from published reviews.
- [ ] **F15. Badges not based on sales.** "Miracle Pick" and "Bestseller" are hand-set flags on many products.
- [ ] **F16. Cash on delivery controls.** No stock guard on the COD decrement and no abuse controls. Switched off (`COD_ENABLED = false`), so dormant until it's turned back on.
- [x] **F19. In-app notifications for customers.** Done 2026-11-11 (`fda8939` main, `aa4e443` earth; order confirmed and refund started added in `e679647` main, `ab13771` earth):
  - **Notifications** in the account menu (and the phone menu), with the unread count on the profile icon (on earth's phone layout, on the menu button). A drawer like the product drawer, with **Mark all read** and **Clear all** pills; Esc, the close button and Back close it.
  - Sent for: order confirmed, shipped (with real tracking), delivered, cancelled by the store (with the reason), cancellation approved or declined, refund started, refund on its way, review restored.
  - Tapping an order or refund notification opens that order's details drawer (`/profile?tab=orders&order=…`); a review one opens the product.
  - New `Notification` table (migration `20261111120000_add_notifications`, already applied to the shared database). Not sent today: order processing, refund failed, replies to Report issue.

## In the data right now

- [ ] **D1.** One cancelled, paid order is waiting for a refund, the test order `MFS-DHGW-QG57`. Its order drawer has the **Refund customer** button.
- [ ] **D2.** One order is waiting on a cancellation request in the admin: `MFS-609500` (paid, placed 2026-11-06).
- [ ] **D3.** Test notifications on the owner's account (four samples and one for `MFS-3XZG-7U8W`). Clear them with **Clear all** in the drawer.

## By choice

- Earth's sign-in window keeps its tabs and Terms line; the compact layout is on main only.
- No admin alerts for now (new reviews, cancellation requests): notifications are for customers only.

## Done this week (for reference)

Google sign-in; customer deactivation; sign out of other devices after a password change; no unpaid orders; password spaces; unguessable order numbers with access tokens; no raw error messages; Verified Purchase reviews; order status history with the customer timeline and order details drawer; store-wide cancellation switch; cancellation reasons and refund rules; Report issue on delivered orders; order and product archive (F7); review moderation (F17); image route locked down (F6); no fake tracking (F3); in-app notifications (F19); reviews open to all signed-in customers.
