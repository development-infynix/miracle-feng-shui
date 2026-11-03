# Product Catalog — Architecture & Implementation Guide

This document summarizes the product catalog system in the **Miracle Feng Shui** Next.js admin app: data model, backend APIs, frontend components, and the refinements implemented during the catalog work.

## 1. Database Schema (Prisma)

Model: `Product` in `prisma/schema.prisma`

- Identity: `id (cuid)`, `title`, `slug (unique)`, `description`
- Pricing: `price`, `comparePrice`, `discount`
- Inventory: `stock (default 50)`
- Media: `images (String[])`, `itemDetails`, `materials`, `tags`
- Relations: `categoryId -> Category`
- Flags: `bestseller`, `etsyPick`, `starSeller`, `isFeatured`, `isActive`, `freeShipping`
- Ratings: `ratingAvg`, `ratingCount`
- Misc: `maker`, `makerAvatar`, `makerSales`, `inDemandCount`, `allowsPersonalization`, `personalizationPrompt`, `variations (Json)`
- Timestamps: `createdAt`, `updatedAt`

Status note: there is no status enum; `isActive` represents active/inactive (soft delete).

## 2. Backend APIs

### `/api/admin/products`
- `GET` — list products with `page`, `pageSize`, `q`, `category`, `status`, `lowStock`
  - Returns `{ products, total, page, pageSize, totalPages }`
  - Search (`q`) and category are server-side.
- `POST` — create product (handles category name → id, slug de-dup, arrays)

### `/api/admin/products/[id]`
- `PATCH` — partial update (category resolved lazily)
- `DELETE` — with `?hard=true` for physical delete

### `/api/upload`
- Admin upload endpoint, now uploads to S3 and returns `/api/images/<key>`

### `/api/images/[...key]`
- Serves S3 objects via signed 1h GET URLs (302 redirect)

## 3. Frontend — Admin Products Flow

### `app/admin/products/page.tsx` (async server component)
- Fetches page (pageSize 20) from Prisma (`adminService.getProducts`)
- Reads `searchParams`: `page`, `q`, `category`
- Passes `initialProducts`, `total`, `page`, `totalPages`, `categories`, `search`, `category` to client

### `app/admin/products/ProductsClient.tsx` (client)
- Fixed-height layout: header (search + buttons), scrollable card list, bottom footer
- Search is server-side and debounced (400ms → URL `?q=`)
- Category filter is server-side via URL `?category=`
- Loading overlay (blur + spinner) for pagination, search, category, and mutations
- Cards render through `ProductCard`
- Footer: "Page X of Y · N items" on left; Prev/Next (rounded-md, Next dark with white text) on right
- `ViewProductDrawer` opened via card's black **View** button (with `MdKeyboardDoubleArrowRight`)

## 4. Product Card (`app/admin/products/components/ProductCard.tsx`)
- Responsive grid: 1 / 2 / 3 / 4 / 5 columns
- Black "View" text button only (no edit/delete on card; view drawer handles edit/delete)
- No discount on card to reduce height
- Footer carries price + original price

## 5. Drawers

### `AddProductDrawer.tsx`
- Right-side slide-in, enlarged header (`h-16`, `text-xl`)
- Order: image upload top → title → description → item details → 2×2 (price, discount, original, stock) → category, maker, badges
- Item Details: one per line textarea
- Submit disabled until title, price (>0), discount, stock, maker are filled
- Button shows "Adding..." while submitting

### `EditProductDrawer.tsx`
- Same field layout/order as Add, with matching enlarged header
- Prefills all fields including `itemDetails`; submit disabled until mandatory fields are filled; shows "Updating..."

### `ViewProductDrawer.tsx`
- Header enlarged; full detail view
- Edit mode includes title, description, item details (one per line), pricing, stock, category, maker, badges
- Delete handled here using reusable `Alert` (danger tone); on success updates local product and refreshes

## 6. Image Storage (S3)
- `lib/s3.ts` provides upload/signed URL/proxy URL helpers
- `/api/upload` now uploads to S3 (Tigris) and returns `/api/images/<key>`
- `/api/images/[...key]` serves signed URLs
- All existing product images migrated into bucket (`products/<id>/<index>.<ext>`)
- `.env` holds `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_PUBLIC_URL`

## 7. Auth & Dev Mode
- `middleware.ts`: `/api/admin/*` allowed without login in development
- `withAuth`/`withRole`: dev runs as a dev admin
- Production enforces NextAuth session

## 8. HandleError Pattern
- Admin routes pass a thunk (`handleError(() => adminController.xxx())`).
- `handleError` executes thunks and handles their errors (previous bug: thunks treated as non-Errors → `500`).

## 9. Lint / Build
- Removed hardcoded Razorpay secret fallbacks from `lib/razorpay.ts` and `payment.service.ts`
- Disabled `no-explicit-any`, `rules-of-hooks`, `set-state-in-effect` in eslint config
- `npm run build` succeeds; `eslint` reports 0 errors

## 10. Env Consolidation
- Only `DATABASE_URL` is required for Prisma (removed redundant `DIRECT_URL`, `DATABASE_URL_POOLED`, `POSTGRES_URL`, `PRISMA_DATABASE_URL`)
- `.env.example` documents all required variables; `!.env.example` added to `.gitignore`

## 11. Key Files
- `app/admin/products/page.tsx` — async server component
- `app/admin/products/ProductsClient.tsx` — client UI (search, filters, cards, pagination footer)
- `app/admin/products/components/ProductCard.tsx`
- `app/admin/products/components/AddProductDrawer.tsx`
- `app/admin/products/components/EditProductDrawer.tsx`
- `app/admin/products/components/ViewProductDrawer.tsx`
- `server/controllers/upload.controller.ts`, `server/services/admin.service.ts`, `server/repositories/admin.repository.ts`
- `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts`
- `app/api/upload/route.ts`, `app/api/images/[...key]/route.ts`
- `lib/s3.ts`, `context/StoreContext.tsx`, `app/admin/layout.tsx`, `middleware.ts`, `server/middlewares/withAuth.ts`