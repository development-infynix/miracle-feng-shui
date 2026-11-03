# Users & Reviews — What's Real, What's Faked, and the Gaps

Audit of the user domain (accounts, sessions, admin access, reviews) in **Miracle Feng Shui**. Written because the app is vibe-coded: several features *look* finished but are demo scaffolding or dead code.

**Last reviewed:** 2026-11-03. **Related:** [product-catelog.md](product-catelog.md) (T-01…T-03 cover overlapping admin security issues), [category-products.md](category-products.md) (T-C gaps). Actionable list lives in [todos.md](todos.md).

## 1. Verdict at a Glance

| Area | State |
|---|---|
| Registration, login, password reset | **Real.** DB-backed, bcrypt, token + email flow |
| User-linked data (addresses, cart, favorites, orders) | **Real.** Keyed to actual DB users |
| Admin login | **Backdoor.** `admin` / `admin` always works, even after a password change |
| Admin route protection | **Not safe.** Forgeable cookie, dev-mode bypasses, most routes unguarded server-side |
| Ratings & reviews | **Fake on storefront, orphaned in backend.** No API route exists |
| User management in admin | **Missing entirely.** No page, no API |

## 2. What Actually Works

- `User` model in `prisma/schema.prisma`: cuid id, unique email, `passwordHash`, `role` enum (`CUSTOMER` / `ADMIN`), phone, reset token fields, relations to Address/Order/Review/Cart/Favorite.
- `server/services/auth.service.ts` — `register()` writes a bcrypt(12) hash with role `CUSTOMER`; `requestPasswordReset()` / `resetPassword()` are a proper token-with-expiry + email flow.
- `server/repositories/user.repository.ts` — real Prisma CRUD.
- NextAuth Credentials provider with JWT sessions (30-day maxAge) in `lib/auth.ts`.
- Profile API (`app/api/auth/profile/route.ts`) — GET/PATCH wrapped in `withAuth`, strips `passwordHash`/reset fields from responses.
- Customer APIs (cart, favorites, orders, payments, addresses) are wrapped in `withAuth`.
- Admin dashboard counts real customers: `prisma.user.count({ where: { role: 'CUSTOMER' } })` (`server/repositories/admin.repository.ts:56`).

## 3. The Admin Backdoor (`server/services/auth.service.ts`)

`validateCredentials()` has demo scaffolding that became a permanent hole:

1. **Alias:** email literally `admin` is rewritten to `admin@miraclefengshui.com` (line 30, mirrored in `lib/auth.ts` authorize).
2. **Demo check:** `isDemoAdmin` = that email + password `admin` (lines 33–34).
3. **Auto-create:** if the admin row is missing, it creates one with password `admin`; if the DB is down, it logs in as an **in-memory** `demo-admin` user (lines 54–68).
4. **The kill switch:** if bcrypt compare fails but `isDemoAdmin` is true, `isValid` is forced to `true` (lines 84–86).

Consequence: **changing the admin password does not lock the door.** `admin`/`admin` bypasses the hash every time, and the DB-unavailable path hands out an ADMIN session with no persistence at all.

## 4. Admin Access Control Is Layered on Sand

| Layer | Problem |
|---|---|
| `middleware.ts:9–11` | In development, **all `/api/admin/*` requests skip auth entirely** |
| `middleware.ts:39` | Accepts `mfs_admin_auth=true` cookie as admin clearance — settable by anyone via `document.cookie` in devtools |
| `app/admin/login/page.tsx:50–52` | The login page writes that cookie + `localStorage` flag client-side |
| `server/middlewares/withAuth.ts:19–31, 46–49` | `withAuth`/`withRole` inject a fake `DEV_ADMIN` user for **every** request in dev — server-side checks only exist in prod builds |
| API routes | Only `app/api/admin/products/[id]/detail` uses `withRole('ADMIN')`. Dashboard, orders, categories, homepage, import, export rely on middleware alone (bypass = gap T-01) |
| `middleware.ts:20`, `lib/auth.ts:10` | Hardcoded `NEXTAUTH_SECRET` fallbacks, committed to git history |
| `prisma/seed.ts:18` | Seeds admin with password `admin` |

A forged cookie + middleware is the only thing between an attacker and product/order/category mutation — and the cookie is the key itself.

## 5. Reviews: A Fake Storefront Feature over an Orphaned Backend

**Backend (complete but unreachable):** `server/controllers/review.controller.ts`, `server/services/review.service.ts`, `server/repositories/review.repository.ts`, `server/validators/review.validator.ts`, and a `Review` model with `@@unique([userId, productId])` all exist — but there is **no `app/api/reviews/**/route.ts`**. The wiring from HTTP to this code was never built.

**Frontend (theater):** `app/product/[id]/page.tsx`
- Line 206: button label shows `product.reviewCount || 2840` — a made-up count fallback.
- Lines 640–668: the "Rating & Reviews" tab renders **five hardcoded stars**, `product.rating || 5.0`, and a certificate promo box. No real review is ever listed or submitted.

**Seed:** `prisma/seed.ts` (~lines 160–175) inserts sample reviews authored by the **admin** account on other people's products — fake social proof in the DB itself.

## 6. No User Management

- Admin sidebar has exactly: Dashboard, Products, Orders, Categories, Homepage. There is no `/admin/users`.
- No `/api/admin/users` route, no list/search/detail/block/delete for accounts.
- Customers surface to the admin only inside order rows (`customerName` string on `Order`).
- There is no way to promote an account to ADMIN other than editing the DB.

## 7. Known Gaps

| ID | Issue | Area |
|---|---|---|
| T-U1 | `admin`/`admin` demo login overrides a wrong password (`auth.service.ts:84–86`) | Security |
| T-U2 | Demo admin auto-created / served in-memory when DB is unavailable (`auth.service.ts:54–68`) | Security |
| T-U3 | `admin` email alias maps to the admin account in two places (`auth.service.ts:30`, `lib/auth.ts`) | Security |
| T-U4 | `mfs_admin_auth=true` cookie alone grants admin (middleware accepts it; client sets it) | Security |
| T-U5 | Dev-mode auth bypass: middleware skips `/api/admin/*`; `withAuth`/`withRole` fake a DEV_ADMIN | Security |
| T-U6 | All admin API routes except `products/[id]/detail` lack server-side `withRole('ADMIN')` | Security |
| T-U7 | Hardcoded NEXTAUTH_SECRET fallbacks in `middleware.ts:20` and `lib/auth.ts:10` (leaked in git history) | Security |
| T-U8 | Seed ships guessable admin password `admin` (`prisma/seed.ts:18`) | Security |
| T-U9 | No admin UI or API to list/manage users; role changes require raw DB edits | Admin |
| T-U10 | No session revocation on password change/reset (role & id live in 30-day JWT) | Backend |
| T-R1 | Review backend (controller/service/repo/validator/model) has no `/api/reviews` route — dead code | Backend |
| T-R2 | Product page fabricates stars and a `|| 2840` review count; no reviews are ever shown or writable | Storefront |
| T-R3 | Seed creates fake reviews authored by the admin account | Data |

## 8. Key Files

| Area | Files |
|---|---|
| Schema | `prisma/schema.prisma` (User, Review, Order) |
| Auth service/repo | `server/services/auth.service.ts`, `server/repositories/user.repository.ts` |
| NextAuth config | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Route guards | `middleware.ts`, `server/middlewares/withAuth.ts` |
| Admin login UI | `app/admin/login/page.tsx`, `app/admin/layout.tsx` |
| Profile API | `app/api/auth/profile/route.ts` |
| Review backend (orphaned) | `server/controllers/review.controller.ts`, `server/services/review.service.ts`, `server/repositories/review.repository.ts`, `server/validators/review.validator.ts` |
| Fake reviews UI | `app/product/[id]/page.tsx` (lines 203–206, 640–668) |
| Seed | `prisma/seed.ts` |
