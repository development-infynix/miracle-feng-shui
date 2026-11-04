# Product Data Issues

Problems with product ratings, the bestseller label and related fields on the storefront.

**Last checked:** 2026-11-04, against the code and the development database (Prisma cloud, `db.prisma.io`, set in `.env`). The live database hasn't been checked, so check it before changing live data.

## Summary

Customers see ratings, review counts and demand numbers that don't come from real customers. These should be fixed before relying on them on the live store, because made-up reviews mislead customers and can be a legal risk.

| Issue | Severity | Status |
|---|---|---|
| 1. Made-up ratings and review counts | High | Open |
| 2. Hardcoded rating and review fallbacks on the product page | High | Open |
| 3. Made-up demand counts | High | Open |
| 4. Bestseller isn't based on sales | Medium | Open |
| 5. Most products are flagged Miracle Pick | Medium | Open |
| 6. Seeded seller sales numbers | Medium | Open |
| 7. Admin can't see or manage where these values come from | Medium | Open |
| 8. Five hardcoded stars on the shared `ProductCard` | Medium | Partly fixed |
| 9. Every product has a discount and free delivery | Low | Needs a decision |

## Current data

Development database:

| Measure | Count |
|---|---|
| Products | 62 |
| Products with a review count above 0 (`ratingCount`) | 60 |
| Rows in the `Review` table | **0** |
| Products flagged `bestseller` | 34 |
| Products flagged `isFeatured` | 34 |
| Products flagged `etsyPick` (Miracle Pick) | 59 |
| Products flagged `starSeller` | 4 |
| Products with `inDemandCount` above 0 | 60 |
| Products with `makerSales` above 0 | 60 |
| Products with `freeShipping` on | 62 |
| Products with a `comparePrice` | 62 |
| Orders / order items | 8 / 12 |

## Issues

### 1. Made-up ratings and review counts

60 products show a review count, such as "4.9 (1980)", but the `Review` table has no rows.

- **Source:** `prisma/seed.ts` sets `ratingAvg` to the seed rating or `5.0`, and `ratingCount` to the seed count or `10`.
- **Schema:** `ratingAvg` defaults to `5.0`, so a brand-new product is stored as five stars with no reviews.
- **Where it shows:** the rating chip in `shop/components/ShopProductCard.tsx`, the shared `components/ProductCard.tsx`, and the product page.
- **Also affected:** the shop's "Highest Rated" sort orders by these numbers.

The real path already exists: `server/services/review.service.ts` recalculates `ratingAvg` and `ratingCount` when a review is saved.

**Fix:**
- Reset `ratingAvg` and `ratingCount` from the actual `Review` rows.
- Stop the seed setting review numbers.
- Hide ratings when there are no reviews, using `Review` rows or a corrected `ratingCount`.
- Consider making `ratingAvg` default to `0`, or nullable.

### 2. Hardcoded rating and review fallbacks on the product page

`app/product/[id]/page.tsx` invents numbers when a value is empty:

- Line 198: `product.rating || 4.9`
- Line 206: `product.reviewCount || 2840` customer reviews
- Line 650: `product.rating || 5.0` out of 5

So a product with no reviews shows "2840 customer reviews".

**Fix:** remove the fallbacks and show a "No reviews yet" state.

### 3. Made-up demand counts

- `app/product/[id]/page.tsx:241` shows "In high demand" with `product.inDemandCount || 18`, so every product shows a number even at zero.
- `app/cart/page.tsx:148-151` shows "In N people's carts" from `inDemandCount`.

60 products have a stored value, and nothing I found calculates it from real activity. The cart's message is a specific factual claim.

**Fix:** remove these messages, or calculate them from real cart and order data.

### 4. Bestseller isn't based on sales

`bestseller` is a manual checkbox in the Add and Edit product drawers, and it's also set by the seed and by CSV import. Over half the catalog (34 of 62) has it, so the label says little, and it isn't tied to orders.

It also drives other things:
- The shop's Bestsellers sort.
- The seed copies it into `isFeatured`.
- The label on product cards, the product page and the cart.

**Decide:**
- **Manual:** keep the checkbox, clear the seeded flags, and tick only true bestsellers. Simple, but relies on being kept up to date.
- **Calculated:** work it out from real order data. More honest, but it must run against the live database, because the development one has only a few orders.

### 5. Most products are flagged Miracle Pick

`etsyPick` is on for 59 of 62 products. Shown as "Miracle Pick" on the shared `ProductCard`, it can't signal anything when nearly everything has it. The field name is also left over from an Etsy-style template.

**Fix:** clear the seeded flags and pick a few by hand, or remove the label. Consider renaming the field.

### 6. Seeded seller sales numbers

`prisma/seed.ts` sets `makerSales` to the seed value or `1200`, and `starSeller` from seed data. Check where these appear before removing them. If customers can see them, they're unverified claims too.

### 7. Admin can't see or manage where these values come from

- `admin/products` has no rating or review-count fields in the Add and Edit drawers. That part is correct, because these should only come from customers.
- The View drawer does show a rating (`ViewProductDrawer.tsx`), but it doesn't say whether real reviews back it up.
- `ProductsClient.tsx:349-350` has fallbacks, `prod.rating || 5` and `prod.reviewCount || 1`, which can show values that aren't real.
- `inDemandCount` and `makerSales` have no clear way to be reviewed.

**Fix:** show rating and review count as read-only, with the number of real reviews, and remove the fallbacks.

### 8. Five hardcoded stars on the shared `ProductCard`

`components/ProductCard.tsx` shows five filled stars whatever the rating.

- **Fixed:** the shop no longer uses this card. `ShopProductCard.tsx` shows the stored rating, but that number is still subject to issue 1.
- **Still open:** `ProductCard` is still used on the favorites page.

**Fix:** move favorites to the new card, or correct the stars.

### 9. Every product has a discount and free delivery

All 62 products have a `comparePrice` above their price, about 30% off in the ones I saw, and all 62 have `freeShipping` on, which is the schema's default.

- A permanent discount on everything can be misleading if the higher price was never really charged.
- With every product included, the Free delivery and On sale filters don't narrow the list.

**Decide:** confirm the compare-at prices are real, and whether free delivery really applies to every product.

## Recommended order

1. **Product page fallbacks (issue 2) and demand messages (issue 3).** Code-only changes that stop the most obvious invented numbers.
2. **Hide ratings without real reviews (issue 1).** Fixes what customers see, with no data change.
3. **Check the live database,** then reset ratings and clear seeded flags with a reviewed script. Back up first.
4. **Fix the seed (issues 1, 4, 6)** so the numbers don't come back.
5. **Decide how Bestseller and Miracle Pick work (issues 4, 5),** then update the admin (issue 7).
6. **Move the remaining pages to the new card (issue 8)** and review pricing (issue 9).
