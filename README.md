# Miracle Feng Shui - Full-Stack E-Commerce Platform

An Etsy-style marketplace for authentic Feng Shui products (crystals, jewelry, candles, consecrated cures, decor, meditation items, books, wealth charms, and protection talismans) tailored for Indian customers with ₹ pricing, Razorpay (UPI, Debit/Credit cards, Net Banking), and Cash on Delivery (COD).

---

## 🏛 Architecture Overview

The backend is built following a strict **4-layer decoupled architecture**:

```
Routes (app/api/**/route.ts)
  └── Controllers (server/controllers/*.controller.ts)
        └── Services (server/services/*.service.ts)
              └── Repositories (server/repositories/*.repository.ts)
                    └── Database (Prisma ORM & PostgreSQL)
```

- **Routes (`app/api/**/route.ts`)**: HTTP endpoints using Next.js App Router route handlers with role guards (`withAuth`, `withRole('ADMIN')`) and centralized exception handling (`handleError`).
- **Controllers (`server/controllers/*.controller.ts`)**: Parse query params and request bodies, validate schemas via Zod, and dispatch to services. Standardize JSON responses via `apiResponse.ok` and `apiResponse.created`.
- **Services (`server/services/*.service.ts`)**: Pure business logic, authorization verification, calculations, password hashing (bcrypt cost 12), and payment gateway interactions. **Never directly imports Prisma**.
- **Repositories (`server/repositories/*.repository.ts`)**: Database access layer. **Only layer permitted to import and query Prisma Client**.
- **Validators (`server/validators/*.validator.ts`)**: Declarative Zod schemas validating all incoming user and admin requests.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- Docker & Docker Compose (for local database)
- Free Neon Account at [neon.tech](https://neon.tech) (for production)

---

## 🐳 Option 1: Docker for Local Development

### 1. Start the PostgreSQL Container
Run the background PostgreSQL container with persistent storage:

```bash
docker compose up -d postgres
```

This launches a PostgreSQL 16 server at `localhost:5432` with user `postgres`, password `postgres`, and database `miracle_feng_shui`.

### 2. Configure Local `.env`
Point your `.env` to the Docker container:

```env
DATABASE_URL="postgres://postgres:postgres@localhost:5432/miracle_feng_shui?sslmode=disable"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="miracle_feng_shui_super_secure_secret_key_32chars_long!"
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="rzp_test_webhook_secret"
```

### 3. Push Schema & Seed Data
```bash
# Push Prisma schema to Docker PostgreSQL
npx prisma db push

# Seed Admin, Customer, Categories, Products, and Homepage sections
npm run seed
```

### 4. Run Next.js Dev Server
```bash
npm run dev
```

*(Optional)* If you prefer running the **entire application** (web app + database) inside Docker:
```bash
docker compose up --build
```

---

## ☁️ Option 2: Managed Cloud Database (Neon) for Production

[Neon](https://neon.tech) is a serverless PostgreSQL platform that scales automatically and integrates seamlessly with Prisma ORM and Next.js.

### 1. Create a Neon Project
1. Go to [console.neon.tech](https://console.neon.tech) and create a new project (e.g. `miracle-feng-shui-prod`).
2. Copy your connection string from the Dashboard. It will look like:
   ```text
   postgresql://alex:AbC123dEf@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Set Production Environment Variables
On your production hosting provider (Vercel, Railway, Render, AWS, or Docker):

```env
# Neon Connection String
DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# (Optional) If using Neon's connection pooler for serverless scaling:
# DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-cloud-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
# DIRECT_URL="postgresql://alex:AbC123dEf@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Production Domain for NextAuth
NEXTAUTH_URL="https://your-custom-domain.com"
NEXTAUTH_SECRET="a_strong_random_32_character_secret_key"

# Live Razorpay Credentials
RAZORPAY_KEY_ID="rzp_live_your_actual_key"
RAZORPAY_KEY_SECRET="your_actual_live_secret"
RAZORPAY_WEBHOOK_SECRET="your_actual_live_webhook_secret"
```

### 3. Push Schema & Seed Production Database
You can initialize and seed the Neon database directly from your local terminal:

```bash
# Apply schema to Neon database
npx prisma db push

# Seed production catalog and initial admin
npm run seed
```

---

## 🧪 Testing & Build Verification

```bash
# Run full Vitest test suite
npm run test

# Compile production bundle with Next.js Turbopack
npm run build
```

---

## 🔑 Seeded Test Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@miraclefengshui.com` | `admin` | Full Admin Panel (`/admin`), Products, Orders, Homepage Manager, Uploads |
| **Customer** | `amina.ashraf@example.com` | `customer123` | Storefront (`/`), Cart, Checkout, My Orders (`/orders`), Reviews, Favorites |

---

## 💳 Payment Gateway & Checkout

1. **Razorpay (UPI / Cards / Net Banking)**:
   - On checkout, calls `POST /api/payments/create-order` to generate a Razorpay order.
   - Razorpay Checkout modal handles UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, or Net Banking.
   - On successful authorization, calls `POST /api/payments/verify` which cryptographically validates the HMAC-SHA256 signature, marks order `PAID`, decrements product inventory, and clears user cart in an atomic transaction.
   - Asynchronous webhook available at `POST /api/payments/webhook`.

2. **Cash on Delivery (COD)**:
   - Selected in Step 2 of Checkout.
   - Calls `POST /api/orders` with `paymentMethod: "COD"`.
   - Creates an order with status `COD_PENDING`, decrements product stock, clears cart, and redirects to `/order-confirmation`.

---

## 🛠 API Endpoints Reference

### Public & Storefront APIs
- `GET /api/products` — Filter products by category, search query, price, rating, sale, and sort order.
- `GET /api/products/[slug]` — Product details with category and customer reviews.
- `GET /api/categories` — List all categories with product counts.
- `GET /api/products/[id]/reviews` — Fetch customer reviews for a product.
- `POST /api/products/[id]/reviews` — Submit verified customer review (Auth required).

### Customer APIs (Auth Required)
- `GET`, `POST`, `DELETE /api/cart` — Retrieve, add item, clear user cart.
- `PATCH`, `DELETE /api/cart/[itemId]` — Update quantity or remove cart item.
- `GET`, `POST /api/favorites` — Manage customer wishlist.
- `DELETE /api/favorites/[productId]` — Remove product from wishlist.
- `GET /api/orders` — Customer order history.
- `GET /api/orders/[id]` — Order detail and tracking.
- `POST /api/orders` — Place order (COD or direct).
- `GET`, `POST`, `PATCH`, `DELETE /api/addresses` — Manage saved shipping addresses.

### Payment APIs
- `POST /api/payments/create-order` — Initialize Razorpay order.
- `POST /api/payments/verify` — Verify HMAC signature & complete order.
- `POST /api/payments/webhook` — Razorpay webhook event processor.

### Admin APIs (ADMIN Role Guarded)
- `GET /api/admin/dashboard` — Live revenue, order count, user count, low-stock alerts, recent orders.
- `GET /api/admin/products` — Manage products catalog with filters and stock levels.
- `POST /api/admin/products` — Create new consecrated product.
- `PATCH /api/admin/products/[id]` — Update product details, pricing, inventory.
- `DELETE /api/admin/products/[id]` — Soft delete / remove product.
- `GET /api/admin/orders` — Filter customer orders by status or search term.
- `PATCH /api/admin/orders/[id]/status` — Update order status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- `GET /api/admin/homepage` — Get layout sections configuration.
- `PUT /api/admin/homepage` — Reorder homepage sections, toggle visibility, and update promotional copy.
- `POST /api/upload` — Upload product images (PNG, JPEG, WEBP up to 5MB).

---

## 🧪 Testing

The repository contains automated unit and integration tests covering core business services:

```bash
npm run test
```

Test coverage includes:
- `tests/services/product.service.test.ts`: Product list formatting, pagination, slug lookup.
- `tests/services/auth.service.test.ts`: Registration, duplicate email rejection, bcrypt hashing, credential verification.
- `tests/services/order.service.test.ts`: Cart validation, inventory verification, COD order placement.
- `tests/services/payment.service.test.ts`: Razorpay HMAC signature validation and tamper rejection.
