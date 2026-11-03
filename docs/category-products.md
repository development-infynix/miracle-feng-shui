# Categories & Products — Architecture and Relationship

How categories and products connect across the database, backend, admin pages and storefront in **Miracle Feng Shui**.

**Last reviewed:** 2026-11-03. **Related:** [product-catelog.md](product-catelog.md) covers the product side in more depth, including the T-numbered TODOs used here.

## 1. The Relationship

Each product belongs to exactly one category. A category can have any number of products, including none.

```
Category 1 ───── * Product
         Product.categoryId → Category.id (required, onDelete: Restrict)
```

**Snapshot at last review:** 9 categories and 62 products (61 active, 1 inactive), with no orphaned products. Three categories have no products: Protection & Charms, Wealth & Abundance and test cat.

## 2. Data Model

Defined in `prisma/schema.prisma`.

| Category field | Notes |
|---|---|
| `id` | cuid |
| `name` | **Not unique** in the schema |
| `slug` | Unique. Generated from the name on creation and never changed afterwards |
| `image` | Optional. Shown in the admin only |
| `description` | Optional |
| `createdAt`, `updatedAt` | Timestamps |

Relevant `Product` fields:

| Field | Notes |
|---|---|
| `categoryId` | Required link to the category |
| `isActive` | `false` hides the product from the store but keeps it in the admin |

### Identifiers

| Identifier | Used by | Risk |
|---|---|---|
| `id` | The database link, and delete and move requests | None |
| `name` | Product forms, storefront links, the shop filter | Changes on rename |
| `slug` | Accepted by the API `category` filter | The shop page doesn't accept it (T-C2) |

## 3. Backend Layers

Category logic has no controller or service of its own. It lives in the product layer.

```
Route → Controller → Service → Repository → Prisma
```

| Concern | Controller | Service | Repository |
|---|---|---|---|
| Category CRUD, public products | `product.controller.ts` | `product.service.ts` | `product.repository.ts` |
| Admin product CRUD | `admin.controller.ts` | `admin.service.ts` | `admin.repository.ts` |

### Routes

| Route | Method | Purpose | Server-side admin check |
|---|---|---|---|
| `/api/categories` | GET | Public category list | Public |
| `/api/admin/categories` | GET, POST | List, create | **None** (T-01) |
| `/api/admin/categories/[id]` | PUT, DELETE | Edit, delete | **None** (T-01) |
| `/api/products` | GET | Public product list, active only | Public |
| `/api/products/[slug]` | GET | Public single product | Public |
| `/api/admin/products` | GET, POST | List, create | `withRole('ADMIN')` |
| `/api/admin/products/[id]` | PATCH, DELETE | Edit, delete | **None** (T-01) |
| `/api/admin/products/[id]/detail` | GET | Full product | `withRole('ADMIN')` |
| `/api/admin/products/import` | POST | CSV import | **None** (T-01) |
| `/api/admin/products/export` | GET | CSV export | **None** (T-01) |
| `/api/admin/products/sample-csv` | GET | Sample CSV template | None (static content) |

## 4. How Data Flows

### Listing

| Screen | Path |
|---|---|
| `/admin/categories` | `page.tsx` → `productService.getAdminCategories` → `findCategoriesPage`, `findAllCategories`, `countProductsByCategoryAndStatus` |
| `/admin/products` | `page.tsx` → `adminService.getProducts` → `adminRepository.findProducts`. Its category list comes directly from `prisma.category.findMany` |
| Storefront | `StoreContext` fetches `/api/categories` and `/api/products?pageSize=100` in the browser, and the shop filters those results locally |

### Filtering products by category

- The admin and public APIs both match `category` against name or slug, case-insensitively.
- The admin products page keeps `q`, `category` and `page` in the URL, and shows the active category as a removable chip.
- In the View Category drawer, the arrow button opens `/admin/products?category=<name>`.
- The shop compares the URL value with the product's category **name** only (`app/shop/page.tsx:89`).

### Assigning a category to a product

1. The Add and Edit forms offer category names from the database.
2. `addProduct` or `updateProduct` in `StoreContext.tsx` sends the name as `categoryId`.
3. `resolveCategoryId` in `admin.repository.ts` looks it up by id or exact name.
4. If nothing matches, the API returns 400 and nothing is saved.

Only CSV import creates categories automatically (§7).

### Renaming a category

Products keep their link, because it uses `id`, and the admin shows the new name straight away. A storefront tab that's already open keeps the old name until it reloads. The slug doesn't change. Hardcoded storefront links that use the old name stop matching (T-C3).

## 5. What Happens on Delete

| Category has | Result |
|---|---|
| No products | The category is deleted |
| Products, and a target is chosen | All its products move to the target, then the category is deleted |
| Products, and no target | The request is refused with a 500 error (T-C10), and the database would also block it through `Restrict` |

- The admin alert requires a target when the category has products, and offers every other category.
- Inactive products move too. Only `categoryId` changes, so orders, reviews, cart items and favourites are unaffected.
- The move and delete aren't in one transaction. A failure in between leaves the products moved and the old category still there (T-C5).

Deleting a product doesn't affect its category, apart from reducing the count.

## 6. Counts

| Where | What it counts |
|---|---|
| Category card | All linked products, plus "N inactive" when there are any |
| View Category drawer | Active and inactive shown separately |
| Categories info button | Active and inactive totals across the catalog, unaffected by search |
| Delete alert | All linked products, because all of them move |
| Admin products list | Active and inactive, with an "Inactive" badge on the card |
| Public `/api/categories` | `productCount` includes inactive products |
| Storefront | Active products only |

## 7. CSV Import and Export

**Import** matches the `category` column against existing names and slugs, case-insensitively.

- An unknown value **creates a new category**, so a typo creates one and a deleted category can return.
- A blank value uses "Feng Shui Decor", and recreates that category if it has been deleted.
- If creating a category fails, the row falls back to the default category.

**Export** writes the category name, including for inactive products.

The admin page currently has no button for either action. The import dialog was opened from the Add Product dropdown that was removed, and `handleExportCsv` exists but nothing calls it (T-C11).

## 8. Storefront Connections

- Shop tabs come from `/api/categories`, so a category with no products still gets a tab.
- Home page circles, cards and many other links are hardcoded with category names.
- `categoriesList` in `StoreContext` is never used by a page, so category images and descriptions aren't shown to shoppers.
- If the categories query fails or returns nothing, `listCategories` returns placeholder categories with made-up ids.
- If the public product query fails, the product service returns placeholder products instead (`product.service.ts:28`).

## 9. Known Gaps

| ID | Issue | Area |
|---|---|---|
| T-01 | Several admin routes have no server-side admin check, and the middleware can be bypassed | Security |
| T-C1 | Footer links to `Gifts` and `Wedding & Party` match no category and lead to an empty shop page (`components/Footer.tsx:39`, `:44`) | Storefront |
| T-C2 | The shop can't filter by slug | Storefront |
| T-C3 | Renaming a category breaks hardcoded storefront links | Storefront |
| T-C4 | Categories with no products appear as empty shop tabs | Storefront |
| T-C5 | Category move and delete aren't in one transaction | Backend |
| T-C6 | The category API has no schema validation, and duplicate names are allowed | Backend |
| T-C7 | The shop loads at most 100 products, so a larger catalog would be cut off | Storefront |
| T-C8 | Placeholder categories and products can hide a database failure | Backend |
| T-C9 | CSV import can create categories from typos, and a blank value can recreate a deleted "Feng Shui Decor" | Import |
| T-C10 | Refusing to delete a category that has products returns a 500 instead of a 400 | Backend |
| T-C11 | The admin page has no button for CSV import or export | Admin |

## 10. Key Files

| Area | Files |
|---|---|
| Schema | `prisma/schema.prisma` |
| Categories page | `app/admin/categories/page.tsx`, `CategoriesClient.tsx`, `types.ts` |
| Categories components | `app/admin/categories/components/`: `CategoriesToolbar`, `CategoriesFooter`, `CategoryCard`, `AddCategoryDrawer`, `ViewCategoryDrawer`, `CategorySelect` |
| Products page | `app/admin/products/page.tsx`, `ProductsClient.tsx` |
| Products components | `app/admin/products/components/`: `ProductCard`, `AddProductDrawer`, `ViewProductDrawer`, `ItemDetailsField`, `EditProductDrawer` (currently unused) |
| Category backend | `server/controllers/product.controller.ts`, `server/services/product.service.ts`, `server/repositories/product.repository.ts` |
| Product backend | `server/controllers/admin.controller.ts`, `server/services/admin.service.ts`, `server/repositories/admin.repository.ts`, `server/validators/admin.validator.ts` |
| CSV | `app/api/admin/products/import/route.ts`, `export/route.ts` |
| Client state | `context/StoreContext.tsx` |
| Storefront | `app/shop/page.tsx`, `app/page.tsx`, `components/CategoryCircle.tsx`, `components/Footer.tsx` |
| Tests | `tests/services/product.service.test.ts`, `tests/repositories/admin.repository.test.ts`, `tests/validators/admin.validator.test.ts` |
