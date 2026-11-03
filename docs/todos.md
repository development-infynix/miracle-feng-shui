# TODOs — Master List

Consolidated work queue for **Miracle Feng Shui**. Detail and evidence for the user/review items is in [user-gap.md](user-gap.md); product and category items live in their own docs and are only summarized here.

**Last reviewed:** 2026-11-03. Checkboxes: `[ ]` open, `[x]` done. IDs are stable — reference them in commits/PRs.

## P0 — Security (do not deploy until these are done)

- [ ] **T-U1: Remove the demo-admin backdoor.** Delete the forced `isValid = true` fallback (`auth.service.ts:84–86`), the `isDemoAdmin` shortcut, and the in-memory `demo-admin` session path (lines 33–43, 54–68). Login must fail when bcrypt fails — full stop. *(user-gap §3)*
- [ ] **T-U2: Stop auto-creating the admin at login.** Admin should exist only via seed/env-driven bootstrap, never as a side effect of a failed lookup. The `catch` that swallows DB errors and returns an ADMIN session must be removed. *(user-gap §3)*
- [ ] **T-U3: Drop the `admin` → `admin@miraclefengshui.com` email alias** in `auth.service.ts:30` and `lib/auth.ts` authorize. *(user-gap §3)*
- [ ] **T-U4: Delete the `mfs_admin_auth` cookie bypass.** Middleware must rely on the NextAuth JWT role only (`middleware.ts:39–42`); remove the client-side cookie/localStorage writes in `app/admin/login/page.tsx:50–52` and `app/admin/layout.tsx`. *(user-gap §4)*
- [ ] **T-U7: Remove hardcoded NEXTAUTH_SECRET fallbacks** (`middleware.ts:20`, `lib/auth.ts:10`) and throw at startup if the env var is missing. Treat the committed value as burned — rotate it everywhere. *(Duplicates T-03 in product-catelog.md — fix once, close both.)*
- [ ] **T-U8: Seed a real admin password** from `ADMIN_SEED_PASSWORD` (or generate + print once) instead of `admin` (`prisma/seed.ts:18`), and remove the credentials hint from the admin login error (T-02 in product-catelog.md). Rotate the password on any DB seeded with `admin`.
- [ ] **T-U5: Gate the dev auth bypasses behind an explicit env flag** (e.g. `ALLOW_DEV_ADMIN=true`), never on `NODE_ENV === 'development'` alone: middleware skip (`middleware.ts:9–11`) and `DEV_ADMIN` injection (`withAuth.ts:19–31, 46–49`). *(user-gap §4)*

## P1 — Access Control & Data Integrity

- [ ] **T-U6: Wrap every admin API route in `withRole('ADMIN')`.** Only `admin/products/[id]/detail` has it today. Apply to dashboard, orders, categories, homepage, products list/[id]/import/export/sample-csv. *(Overlaps T-01 in product-catelog.md.)*
- [ ] **T-U10: Invalidate sessions on password change/reset.** Add a token version or `updatedAt`-based check in the JWT callback so an old 30-day token stops working after a credential change. *(user-gap §6)*
- [ ] **T-R3: Delete the fake seeded reviews** (`prisma/seed.ts` ~160–175) or convert them to clearly-labeled demo data that's stripped before production. *(user-gap §5)*

## P1 — Reviews: decide build vs. strip

The service/controller/repo/validator layer is complete but has **no HTTP route** (T-R1), while the product page shows fabricated social proof (T-R2). Pick one:

- [ ] **T-R-BUILD (recommended):** Add `app/api/reviews/route.ts` (GET by product, POST auth'd + purchase-verified) and `app/api/reviews/[id]/route.ts` (delete owner/admin). Render real reviews in the tab, replace `product.rating || 5.0` and `reviewCount || 2840` with DB aggregates (recompute on write). Add an admin review list for moderation.
- [ ] **T-R-STRIP (acceptable fallback):** Remove the fake stars and hardcoded count, delete the orphaned review backend or leave it clearly marked, and drop review claims from marketing copy until the feature exists.

Either way: [ ] **T-R2: No invented numbers on the storefront** — `reviewCount || 2840` (`app/product/[id]/page.tsx:206`) must go.

## P2 — User Management (new feature)

- [ ] **T-U9: Admin Users page** at `/admin/users`: paginated list (name, email, phone, role, created date, order count), search, detail drawer with that customer's orders/addresses. Follow the categories-page pattern (`page.tsx` → `CategoriesClient`-style component, `CategoriesFooter`-style pagination).
- [ ] **T-U9b: Admin Users API**: `app/api/admin/users/route.ts` + `[id]/route.ts` (list/search GET, role change PATCH, delete) behind `withRole('ADMIN')`, with a zod validator in `server/validators/`.
- [ ] **T-U9c: Role management UI** (promote/demote) with confirmation; never expose passwordHash.
- [ ] Add a "Users" nav item to `app/admin/layout.tsx` sidebar.

## P2 — Carry-over from other docs (tracked in place)

- [ ] Product catalog: T-04 (open parts), T-05…T-13 → [product-catelog.md §12](product-catelog.md)
- [ ] Categories: T-C1…T-C11 → [category-products.md §9](category-products.md)

## Suggested order

1. T-U1 → T-U2 → T-U3 (backdoor, one PR)
2. T-U4 + T-U5 + T-U7 (guardrails, one PR)
3. T-U8 + T-02 (credentials)
4. T-U6 (route wrappers)
5. Reviews decision (T-R-BUILD or T-R-STRIP)
6. T-U9 user management
