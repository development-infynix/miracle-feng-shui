# Product Catalog — Architecture, Known Issues & TODOs

How the `Product` table and the `/admin/products` page work in the **Miracle Feng Shui** Next.js app, including what is broken, what earlier versions of this doc got wrong, and what is missing.

**Last audited:** 2026-11-03, against Next.js 16.4.1, Prisma ^7.10, Zod 4.6.5.

**How this was checked:** by reading the code. The admin UI and API were not exercised against a database. Claims are code-derived unless marked:

- **[ran]** — confirmed by running the real code.
- **[not run]** — expected from the code, but not confirmed. Check before relying on it.

## 1. Current Status

| Area | Status |
|---|---|
| List, search, category filter | Works on page 1. Pagination drops the filters (T-07) |
| Create product | Saves, but drops most form fields (T-05) |
| Edit product | Saves, but resets unrelated fields (T-04) |
| Delete product | Hard delete only. Fails for products with orders (T-06) |
| CSV import/export | Works, with data-quality problems (§7) |
| Image upload | Works. One image per product from the admin UI (T-17) |
| Authorization | **Not safe for production** (T-01 to T-03) |

Start with [§12 TODOs](#12-todos). Sections 2–9 describe what the code does today, not what it should do.

## 2. Database Schema (Prisma)

Model: `Product` in `prisma/schema.prisma`

| Group | Fields |
|---|---|
| Identity | `id` (cuid), `title`, `slug` (unique), `description` |
| Pricing | `price` (Float), `comparePrice` (Float?), `discount` (free-text String?) |
| Inventory | `stock` (default 50) |
| Content | `images`, `itemDetails`, `materials`, `tags` (all `String[]`), `variations` (Json?) |
| Category | `categoryId` → `Category` (`onDelete: Restrict`) |
| Flags | `bestseller`, `etsyPick`, `starSeller`, `isFeatured`, `isActive`, `freeShipping` (default true) |
| Ratings | `ratingAvg` (default 5.0), `ratingCount` (default 0) |
| Maker | `maker` (default "Miracle Feng Shui Studio"), `makerAvatar`, `makerSales` |
| Other | `inDemandCount`, `allowsPersonalization`, `personalizationPrompt`, `createdAt`, `updatedAt` |

**What happens to related rows when a product is hard-deleted:**

| Related model | `onDelete` | Effect |
|---|---|---|
| `OrderItem` | Restrict | **Delete is blocked** once a product has been ordered |
| `CartItem`, `Favorite`, `Review` | Cascade | These rows are deleted with the product (the relations at `schema.prisma:153`, `:170`, `:225`) |

**Notes:**

- There is no status enum. `isActive: false` means soft-deleted.
- `images` holds a mix of `/api/images/<key>` paths, `/images/...` local paths and full URLs.
- `@@index([slug])` duplicates the index that `@unique` already creates.
- There is no `prisma/migrations` folder, so schema changes have no migration history.

## 3. Backend APIs

Successful responses are wrapped as `{ success: true, data }`. Errors are `{ success: false, error, details? }`.

| Route | Method | Purpose | Server-side auth check |
|---|---|---|---|
| `/api/admin/products` | GET, POST | List, create | `withRole('ADMIN')` |
| `/api/admin/products/[id]/detail` | GET | Full product for the View drawer | `withRole('ADMIN')` |
| `/api/admin/products/[id]` | PATCH, DELETE | Update, delete (`?hard=true` for physical delete) | **None** (T-01) |
| `/api/admin/products/import` | POST | CSV import | **None** (T-01) |
| `/api/admin/products/export` | GET | CSV export | **None** (T-01) |
| `/api/admin/products/sample-csv` | GET | Sample CSV template | None (static content) |
| `/api/upload` | POST | Upload an image to S3 | Session role check in the handler |
| `/api/images/[...key]` | GET | 302 redirect to a signed URL | Public by design |

Routes marked **None** rely only on `middleware.ts`, which can be bypassed (§9).

**`GET /api/admin/products`**

- Query: `page`, `pageSize` (default 50, max 100), `q`, `category`, `status`, `lowStock`.
- Returns `{ products, total, page, pageSize, totalPages }` with card-level fields only.
- `q` matches `title`, `description` and `maker` case-insensitively. `tags` must match exactly, including case.
- `category` matches name or slug, case-insensitively.
- `status=active` and `status=inactive` work. `status=all` (the default) returns **active products only** (`admin.repository.ts:85-92`).
- `lowStock` means stock ≤ 5. Passing `lowStock=false` is parsed as `true` **[ran]** (T-11).

**`POST /api/admin/products`**

- Accepts a category id or name, and **creates the category if neither matches**.
- De-duplicates the slug by adding a numeric suffix.
- `readyToShip`, `returnsAccepted` and `makerLocation` pass validation but have no columns, so they are silently dropped.

**`PATCH /api/admin/products/[id]`**

- **Not a true partial update**: see T-04.
- An unknown category is silently ignored rather than created or rejected, unlike POST.

**`DELETE /api/admin/products/[id]`**

- Soft delete by default (`isActive: false`).
- `?hard=true` physically deletes the row. It does not remove the images from S3.

## 4. Frontend — Admin Products Page

### `app/admin/products/page.tsx` (async server component)

- Reads `page`, `q`, `category` from `searchParams` and queries through `adminService.getProducts` (page size 20).
- Calls the service directly rather than the API, so `withRole` does not apply. Only `middleware.ts` guards it.
- Passes `status: 'all'`, so inactive products never appear.
- `page` is not validated. Negative or fractional values would reach Prisma as an invalid `skip` and likely throw **[not run]**.

### `app/admin/products/ProductsClient.tsx` (client, 888 lines)

- Fixed-height layout: toolbar, scrollable card grid, footer.
- Search is debounced by 400 ms and written to `?q=`. The category filter writes `?category=`. Both reset to page 1 and run on the server.
- A blur and spinner overlay shows during navigation and mutations.
- The footer shows "Page X of Y · N items" with Prev/Next.
- The info popover shows catalog stats, **counted from the current page only** (T-09).
- The CSV import modal is defined inline in this file (§7).

**Unused code here:** `EditProductDrawer` rendering, `openEditModal`, `handleDelete`, the `selectedStockFilter` state (no control sets it) and the `ImageUploadField` import (T-16).

**Possible dev-only bug [not run]:** Strict Mode runs effects twice on mount, which defeats the `isFirstSearchRender` guard. Opening `?page=3` directly in development may jump back to page 1 after 400 ms.

## 5. Product Card — `components/ProductCard.tsx`

- Responsive grid of 1 / 2 / 3 / 4 / 5 columns (set by `ProductsClient`).
- Shows image, name, category, price and original price. The discount is left out to reduce height.
- The only action is the black **View** button. Edit and delete live in the View drawer.
- Stock badge: "Out" at 0, "Low: N" under 10 (T-10).
- A failed image falls back to a hardcoded Unsplash URL. An empty `images` array has no fallback, because `onError` doesn't fire without a `src`.

## 6. Drawers

### `AddProductDrawer.tsx`

- Right-side slide-in.
- Field order: image → title → description → item details → price, discount, original price, stock → category, maker, badges.
- Item Details has one input per detail, with a **+** button beside the last input to add another. Blank rows are dropped on submit.
- Submit stays disabled until title, price (> 0), discount, stock and maker are filled.
- **Discount is required by the UI but optional in the API**, so a product with no discount still needs a value typed in.
- **Maker and badges are collected but not saved** (T-05).
- Takes a single image (T-17).
- The hidden `<input type="file">` has no trigger and does nothing (T-16). `ImageUploadField` does the real upload.

### `ViewProductDrawer.tsx` — the only reachable edit and delete flow

- Opens instantly with card data, then loads the full product from `/detail`.
- Edit mode covers title, description, item details, pricing, stock, category, maker and badges.
- **Images can't be changed here**: they are not in the edit form or the save payload (T-17).
- **Maker and free-shipping edits are lost** (T-04).
- Delete asks for confirmation through `Alert`, then always uses `?hard=true` (T-06).
- After a successful hard delete, `deleteProduct()` from the store sends a **second `DELETE`** that returns 404, and the failure is ignored.

### `EditProductDrawer.tsx` — currently unreachable

Nothing calls `openEditModal`, so `editingProduct` is never set and this drawer never renders (T-16).

### Save path (both flows)

The drawers save through `addProduct` and `updateProduct` in `context/StoreContext.tsx`, which pick the fields to send. A field the form collects is not necessarily saved. Check these functions first when a value doesn't persist.

## 7. CSV Import & Export

**Export** — `GET /api/admin/products/export`

- Columns: `id, title, category, price, comparePrice, stock, description, images, bestseller, etsyPick, freeShipping, maker, tags`.
- Includes inactive products, with no column showing which ones they are.
- Omits `discount`, `itemDetails`, `materials` and `isActive`, so a CSV isn't a complete backup.
- **If the database query fails or returns no rows, it exports placeholder products instead of reporting an error** (T-13).

**Import** — `POST /api/admin/products/import`

- Accepts multipart or JSON. The server parser handles quoted values and escaped quotes. Headers are case-insensitive.
- `images` is split on `|`. `tags` is split on `|` or `,`.
- A valid row needs a title and a price above 0. Bad rows are reported and skipped.
- Rows are saved one at a time with no transaction, so a failed import can be partly applied. There is no file size or row limit.
- Unknown categories are created automatically.

| Row | Result |
|---|---|
| `id` matches, "update existing" on | Updates the product |
| `id` matches, "update existing" **off** | **Creates a duplicate** instead of skipping (T-12) |
| `id` doesn't match or is blank | Creates a product |

**Import side effects:**

- On update, a missing `bestseller` or `etsyPick` column sets it to false, and a missing `freeShipping` column sets it to true.
- `comparePrice` is cleared if it isn't above `price`.
- New products get boilerplate `itemDetails`, and placeholder text if `description` is blank.

**Import UI:**

- The preview covers the first 8 rows, using a separate and simpler parser than the server's. It can disagree with what actually imports **[not run]**.
- After an import, the page calls `refreshProducts()` but not `router.refresh()`, so the grid stays stale until the next navigation (T-12).

## 8. Image Storage (S3 / Tigris)

- `lib/s3.ts` provides `uploadToS3`, `signedGetUrl` and `publicObjectUrl`.
- New uploads are stored at `uploads/mfs_<timestamp>_<random>.<ext>`.
- Migrated images are stored at `products/<id>/<index>.<ext>` (`scripts/migrate-images.ts`).
- `/api/images/[...key]` signs a 1-hour GET URL and returns a 302.
- `.env` holds `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` and `S3_PUBLIC_URL`. `lib/s3.ts` does not read `S3_PUBLIC_URL`.

**Limitations:**

- Signing doesn't check that the object exists, so the route's 404 branch won't trigger for a missing image. The browser follows the redirect and gets a storage error instead.
- Deleting a product, or replacing an image, leaves the old objects in the bucket (T-14).
- The upload limits disagree: 5 MB and PNG/JPG/WEBP in `ImageUploadField`, but 10 MB and also GIF/SVG/AVIF on the server (T-15).

## 9. Auth & Dev Mode

**In development:**

- `middleware.ts` lets `/api/admin/*` through with no login.
- `withAuth` and `withRole` run every handler as a dev admin, including for logged-out requests.

**In production, `middleware.ts` allows admin routes if either is true:**

1. The NextAuth token has `role === 'ADMIN'`, or
2. The `mfs_admin_auth` cookie equals `'true'`.

The cookie is set by client-side JavaScript at login and is not signed or checked against anything, so it proves nothing about who sent it. Only routes that also use `withRole` or check the session are actually protected. See the table in §3 and T-01.

## 10. Error Handling, Build & Env

**Error handling**

- `handleError` accepts a thunk (`handleError(() => adminController.x())`) or an error object. **Both styles are in use**: `products/route.ts` uses thunks, `products/[id]/route.ts` uses `try/catch`.
- For unexpected errors it returns `error.message` to the client, which can expose internal database details (T-18).
- The field is `error`, not `message`. `ViewProductDrawer.tsx:89` reads `data?.message`, so the real reason is never displayed (T-06).

**Lint and build**

- `no-explicit-any`, `react-hooks/rules-of-hooks` and `react-hooks/set-state-in-effect` are disabled in `eslint.config.mjs`. Zero lint errors therefore does not mean zero hook violations.
- An earlier version of this doc reported `npm run build` succeeding and 0 ESLint errors. Neither was re-run in this audit.
- `lib/razorpay.ts` no longer has hardcoded secret fallbacks. `lib/auth.ts` and `middleware.ts` still do for the NextAuth secret (T-03).
- `middleware.ts` is deprecated in Next.js 16 in favour of `proxy.ts` (T-19).

**Env**

- Prisma only needs `DATABASE_URL`. `.env.example` documents the required variables and is exempted from `.gitignore`.

## 11. Corrected Misconceptions

Claims from earlier versions of this doc, or assumptions the code invites.

| Claim | What actually happens |
|---|---|
| "Production enforces NextAuth session" | A plain, unsigned cookie passes the middleware. Several routes have no other check |
| "`PATCH` — partial update" | Omitted fields are reset to their defaults **[ran]** |
| `isActive` provides soft delete | The admin UI always hard-deletes. Soft delete is only reachable by calling the API directly |
| `status=all` returns all products | It returns active products only |
| "Search and category are server-side" | True, but Prev/Next links lose both |
| "Total Catalog" stat shows the catalog size | It counts the current page, at most 20 |
| `EditProductDrawer` is a working flow | It can't be reached |
| Add form "maker" and "badges" are saved | They are never sent to the API |
| View drawer maker edits are saved | They are sent nowhere, and the stored maker gets reset |
| "Admin routes pass a thunk" | Only some do |
| `/api/images` returns 404 for missing images | Signing doesn't check existence, so it redirects anyway |
| "Low stock" has one meaning | ≤ 5 in the repository and dashboard, < 10 on the cards and stats |
| Default stock is 50 | 50 in the schema and store, 10 in the validator |
| Hardcoded secrets were removed | Only the Razorpay ones |

## 12. TODOs

### P0 — Security (fix before production use)

- [ ] **T-01: Require a real admin session on every admin route.** Stop trusting the `mfs_admin_auth` cookie in `middleware.ts:39`. Add `withRole('ADMIN')` to `products/[id]`, `products/import` and `products/export`. The same gap exists on the `categories` and `orders` admin routes, which are outside this doc but should be fixed in the same change. Add a server-side session check to `app/admin/products/page.tsx`.
- [ ] **T-02: Remove the credentials hint from the admin login error** (`app/admin/login/page.tsx`), and stop seeding a guessable admin password in `prisma/seed.ts`. Change the password on any database that was seeded this way.
- [ ] **T-03: Remove the hardcoded NextAuth secret fallback** from `lib/auth.ts:10` and `middleware.ts:20`, and fail at startup if the variable is missing. The fallback is in git history, so never use that value as a real secret.

### P1 — Data integrity

- [ ] **T-04: Make PATCH a true partial update.** `updateProductSchema = createProductSchema.partial()` (`admin.validator.ts:54`) still applies defaults under Zod 4 **[ran]**. A title-only update returns `stock: 10`, `maker` (default), `makerSales: 0`, `starSeller: false`, `bestseller: false`, `etsyPick: false`, `freeShipping: true`, `itemDetails: []`, `materials: []`, `tags: []`, `allowsPersonalization: false`, `inDemandCount: 0`, `isActive: true` and `isFeatured: false`.
  - Because `updateProduct` in `StoreContext.tsx` doesn't send most of these, **each admin edit resets** `maker`, `makerSales`, `starSeller`, `freeShipping`, `tags`, `allowsPersonalization`, `inDemandCount`, `isActive` and `isFeatured`.
  - `materials` is now sent on edit, so it survives once the View drawer has loaded the full product. Editing before `/detail` finishes can still reset it.
  - Fix: define the update schema without defaults, and add `maker` and `freeShipping` to the store payload.
  - **Existing products may already be affected.** Review whether edited products need these values restored.
  - Also stop `updateProduct` replacing a cleared description with "Authentic blessed talisman".
- [ ] **T-05: Send all form fields on create.** `addProduct` omits `maker`, `bestseller`, `etsyPick` and `freeShipping`. It also hardcodes `isFeatured: true` for every new product, so remove that or make it a form choice. Replace the placeholder description with validation.
- [ ] **T-06: Decide the delete behaviour.** Recommended: soft-delete by default, because products with orders can't be hard-deleted and the admin UI has no other way to take them off sale. Show the API's `error` text, and remove the second `DELETE` call.

### P1 — Page behaviour

- [ ] **T-07: Keep `q` and `category` in the Prev/Next links** (`ProductsClient.tsx:611`, `:620`).
- [ ] **T-08: Make `status=all` return all products,** and add an active/inactive filter plus a way to restore soft-deleted products. Depends on T-06.
- [ ] **T-09: Serve catalog stats from the server,** using count queries rather than the current page.
- [ ] **T-10: Pick one low-stock threshold** and share it across the repository, dashboard, card and stats.
- [ ] **T-11: Parse `lowStock` properly** (`admin.validator.ts:9`), since `z.coerce.boolean()` treats any non-empty string as true. Validate `page` in `page.tsx`.
- [ ] **T-12: Fix import behaviour.** Skip existing rows when "update existing" is off, and call `router.refresh()` after an import. Report skipped rows in the summary. Only overwrite boolean fields when the column is present.
- [ ] **T-13: Make export fail visibly** instead of returning placeholder products. Add `isActive`, `discount`, `itemDetails` and `materials`.

### P2 — Cleanup and hardening

- [ ] **T-14: Clean up S3 objects** when a product is deleted or an image replaced, or schedule an orphan sweep.
- [ ] **T-15: Share one upload policy** between client and server. Reconsider allowing SVG, since it can contain scripts.
- [ ] **T-16: Remove dead code:** `EditProductDrawer` (or wire it up and retire View-drawer editing), `openEditModal`, `handleDelete`, `selectedStockFilter`, the hidden file inputs and unused imports.
- [ ] **T-17: Support multiple images,** both adding and editing, including in the View drawer.
- [ ] **T-18: Return a generic message for unexpected 500s** and log the details on the server. Use one `handleError` style across routes.
- [ ] **T-19: Migrate `middleware.ts` to `proxy.ts`** with `npx @next/codemod@canary middleware-to-proxy .`
- [ ] **T-20: Move money to `Decimal`** instead of `Float`. Validate that `comparePrice` is above `price`, and derive `discount` from them instead of storing free text. Align API (`price >= 0`) and UI (`price > 0`).
- [ ] **T-21: Align defaults and tidy the schema.** Use one stock default. Remove the redundant slug index. Don't default `ratingAvg` to 5.0 for products with no reviews. Remove `readyToShip`, `returnsAccepted` and `makerLocation` from the validator, or add columns for them. Start using Prisma migrations.
- [ ] **T-22: Split `ProductsClient.tsx`.** Move the CSV modal into its own component, and replace the `placeholder-data` `Product` type and category fallback with real types.
- [ ] **T-23: Re-enable `rules-of-hooks`** and fix whatever it reports. Reduce `any`.

## 13. Known Gaps

**Fields with no admin UI**

- `tags`: CSV only.
- `materials`: no form control, by decision. Item Details is the single field going forward. The column is still in use by the cart tags and has not been removed.
- `variations`, `allowsPersonalization`, `personalizationPrompt`, `starSeller`, `isFeatured`, `inDemandCount`, `makerAvatar`, `makerSales`: no form control.
- `slug`: set once on create. It doesn't follow title changes and can't be edited.

**Missing features**

- Stock filter control (the logic exists but nothing sets it), sorting and bulk actions.
- Viewing, restoring or deactivating products without calling the API.
- Audit history of who changed a product.

**Missing tests**

- `tests/services/product.service.test.ts` covers the public product service only.
- Nothing tests `admin.validator.ts`, the admin routes and their auth, `adminRepository`, CSV import/export or the admin UI.
- First tests to add: a regression test for T-04, and an auth test confirming that every admin route rejects a request with no valid session (T-01).

**Unverified in this audit**

- Whether the production database was seeded with the default admin credentials.
- How many existing products have already been changed by T-04.
- Whether the build and lint results in §10 still hold.
- Whether the repository is public. If it is, T-01 to T-03 are more urgent, and this section's detail should move out of the repo.

## 14. Key Files

| Area | Files |
|---|---|
| Page | `app/admin/products/page.tsx`, `app/admin/products/ProductsClient.tsx`, `app/admin/layout.tsx` |
| Components | `app/admin/products/components/ProductCard.tsx`, `AddProductDrawer.tsx`, `EditProductDrawer.tsx` (unused), `ViewProductDrawer.tsx`, `components/admin/ImageUploadField.tsx`, `app/components/alert` |
| Client state | `context/StoreContext.tsx` (`addProduct`, `updateProduct`, `deleteProduct`, `refreshProducts`) |
| API routes | `app/api/admin/products/route.ts`, `[id]/route.ts`, `[id]/detail/route.ts`, `import/route.ts`, `export/route.ts`, `sample-csv/route.ts` |
| Upload and images | `app/api/upload/route.ts`, `app/api/images/[...key]/route.ts`, `server/controllers/upload.controller.ts`, `lib/s3.ts`, `scripts/migrate-images.ts` |
| Server | `server/controllers/admin.controller.ts`, `server/services/admin.service.ts`, `server/repositories/admin.repository.ts`, `server/validators/admin.validator.ts`, `server/middlewares/handleError.ts` |
| Auth | `middleware.ts`, `server/middlewares/withAuth.ts`, `lib/auth.ts`, `app/admin/login/page.tsx` |
| Schema and seed | `prisma/schema.prisma`, `prisma/seed.ts` |
