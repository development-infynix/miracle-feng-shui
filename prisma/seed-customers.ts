// Creates 5 dummy CUSTOMER accounts (4 with saved addresses) so the admin
// /admin/users page + detail drawer have data.
// Run with: npm run seed:customers
// Idempotent: re-running upserts the same 5 emails and resets their addresses.
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
// Same shared client the main seed uses (loads dotenv + generated Prisma 7 client).
import prisma from '../lib/prisma';

// Shared dev password for all dummy accounts (bcrypt-hashed below).
const DUMMY_PASSWORD = 'Customer@123';

interface SeedAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface SeedCustomer {
  name: string;
  email: string;
  phone: string;
  // Priya has no addresses on purpose — the drawer's empty-state case.
  addresses: SeedAddress[];
}

const CUSTOMERS: SeedCustomer[] = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98123 45001',
    addresses: [
      {
        name: 'Aarav Sharma',
        phone: '+91 98123 45001',
        line1: '12 Rose Villa, 3rd Street',
        line2: 'Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Priya Iyer',
    email: 'priya.iyer@example.com',
    phone: '+91 98123 45002',
    addresses: [],
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    phone: '+91 98123 45003',
    addresses: [
      {
        name: 'Rohan Mehta',
        phone: '+91 98123 45003',
        line1: '45 Green Park Extension',
        line2: 'Block B',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110016',
        isDefault: true,
      },
      {
        name: 'Rohan Mehta',
        phone: '+91 98123 45003',
        line1: 'B3/7 Okhla Road',
        line2: 'Nehru Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110019',
        isDefault: false,
      },
    ],
  },
  {
    name: 'Ananya Nair',
    email: 'ananya.nair@example.com',
    phone: '+91 98123 45004',
    addresses: [
      {
        name: 'Ananya Nair',
        phone: '+91 98123 45004',
        line1: 'Flat 402, Sunbeam Residency',
        line2: 'MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        isDefault: true,
      },
    ],
  },
  {
    name: 'Kabir Doshi',
    email: 'kabir.doshi@example.com',
    phone: '+91 98123 45005',
    addresses: [
      {
        name: 'Kabir Doshi',
        phone: '+91 98123 45005',
        line1: '28 SG Highway',
        line2: 'Near Iscon Cross Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380015',
        isDefault: true,
      },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DUMMY_PASSWORD, 12);

  // Real catalog products so favorites / cart / orders reference valid IDs.
  const products = await prisma.product.findMany({
    take: 15,
    select: { id: true, title: true, price: true, images: true },
  });
  if (products.length === 0) {
    console.warn(
      '⚠️  No products found — run `npm run seed` first. Favorites/cart/orders will be skipped.',
    );
  }

  for (let idx = 0; idx < CUSTOMERS.length; idx++) {
    const customer = CUSTOMERS[idx];
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {
        name: customer.name,
        phone: customer.phone,
        // Never downgrade an account that somehow holds another role.
        role: 'CUSTOMER',
      },
      create: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    // Reset this user's seeded relations so re-running never duplicates them.
    await prisma.address.deleteMany({ where: { userId: user.id } });
    await prisma.favorite.deleteMany({ where: { userId: user.id } });
    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await prisma.order.deleteMany({ where: { userId: user.id } });

    if (customer.addresses.length > 0) {
      await prisma.address.createMany({
        data: customer.addresses.map((a) => ({ userId: user.id, ...a })),
      });
    }

    // Favorites / cart / orders only for the 4 users that have an address.
    // Priya is intentionally left sparse so the empty-tab states are testable.
    let favCount = 0;
    let cartCount = 0;
    let orderCount = 0;

    if (products.length > 0 && customer.addresses.length > 0) {
      const pick = (offset: number) => products[(idx + offset) % products.length];
      const unique = (list: typeof products) =>
        list.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);

      // Favorites
      const favProducts = unique([pick(0), pick(4), pick(8)]);
      await prisma.favorite.createMany({
        data: favProducts.map((p) => ({ userId: user.id, productId: p.id })),
      });
      favCount = favProducts.length;

      // Cart (single cart per user, with 1-2 items)
      const cartProducts = unique([pick(1), pick(6)]);
      await prisma.cart.create({
        data: {
          userId: user.id,
          items: {
            create: cartProducts.map((p, i) => ({
              productId: p.id,
              quantity: (i % 2) + 1,
            })),
          },
        },
      });
      cartCount = cartProducts.length;

      // Orders: two per user; item title/price/image snapshotted at purchase.
      const ship = customer.addresses[0];
      const shippingAddress = {
        name: ship.name,
        phone: ship.phone,
        line1: ship.line1,
        line2: ship.line2 ?? '',
        city: ship.city,
        state: ship.state,
        pincode: ship.pincode,
        country: 'India',
      };
      const orderPlans = [unique([pick(2), pick(5)]), unique([pick(7)])];
      for (let k = 0; k < orderPlans.length; k++) {
        const orderItems = orderPlans[k].map((p) => ({
          productId: p.id,
          title: p.title,
          price: p.price,
          quantity: 1 + ((idx + k) % 2),
          image: p.images[0] ?? '',
        }));
        const total = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);
        await prisma.order.create({
          data: {
            orderNumber: `MFS-SEED-${user.email.split('@')[0]}-${k + 1}`,
            accessToken: crypto.randomBytes(24).toString('base64url'),
            userId: user.id,
            status: k === 0 ? 'DELIVERED' : 'PROCESSING',
            paymentMethod: 'RAZORPAY',
            paymentStatus: 'PAID',
            total,
            shippingAddress,
            items: { create: orderItems },
          },
        });
        orderCount += 1;
      }
    }

    console.log(
      `✅ ${user.name} <${user.email}> · ${customer.addresses.length} addr · ${favCount} fav · ${cartCount} in cart · ${orderCount} orders`,
    );
  }

  console.log(`\nShared dummy password for all accounts: ${DUMMY_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
