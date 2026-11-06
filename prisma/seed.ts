import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { products, categories } from './seed-data';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('🌱 Starting Miracle Feng Shui database seeding...');

  // 1. Seed Users (Admin)
  // Admin password must come from ADMIN_SEED_PASSWORD. In production we fail
  // hard rather than ship a guessable default.
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminSeedPassword && process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed: ADMIN_SEED_PASSWORD must be set in production.');
  }
  if (!adminSeedPassword) {
    console.warn('⚠️  ADMIN_SEED_PASSWORD not set — using dev-only default "admin". Never use this in production.');
  }
  const adminPasswordHash = await bcrypt.hash(adminSeedPassword || 'admin', 12);

  const ADMIN_EMAIL: string = 'admin@fengshui.com';
  // Previous admin identities that must not linger as extra ADMIN accounts.
  const LEGACY_ADMIN_EMAILS = ['admin@miraclefengshui.com', 'admin@fengshui'];

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      name: 'Miracle Admin',
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      name: 'Miracle Admin',
      role: 'ADMIN',
      phone: '+91 98765 43210',
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

  // Remove legacy admin accounts so only one ADMIN credential exists;
  // otherwise they stay usable with their old (weak) passwords.
  const staleEmails = LEGACY_ADMIN_EMAILS.filter((e) => e !== ADMIN_EMAIL);
  if (staleEmails.length > 0) {
    const removed = await prisma.user.deleteMany({
      where: { email: { in: staleEmails }, role: 'ADMIN' },
    });
    if (removed.count > 0) {
      console.log(`🧹 Removed ${removed.count} legacy admin account(s): ${staleEmails.join(', ')}`);
    }
  }

  // 2. Seed Categories

  const categoryMap = new Map<string, string>();
  for (const catName of categories) {
    if (catName === 'All') continue;
    const catSlug = slugify(catName);
    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { name: catName },
      create: {
        name: catName,
        slug: catSlug,
        description: `Authentic consecrated ${catName} cures, blessings, and sacred items.`,
      },
    });
    categoryMap.set(catName, category.id);
  }
  console.log(`✅ ${categoryMap.size} Categories seeded`);

  // 3. Seed Products
  console.log(`📦 Seeding ${products.length} Products...`);
  const createdProducts = [];
  for (const prod of products) {
    const categoryId = categoryMap.get(prod.category) || Array.from(categoryMap.values())[0];
    const baseSlug = slugify(prod.name);
    const uniqueSlug = `${baseSlug}-${prod.id}`;

    const created = await prisma.product.upsert({
      where: { slug: uniqueSlug },
      update: {
        title: prod.name,
        description: prod.description,
        price: prod.price,
        comparePrice: prod.originalPrice || null,
        discount: prod.discount || null,
        images: prod.images,
        stock: 50,
        categoryId,
        tags: [prod.category, prod.maker],
        maker: prod.maker || 'Miracle Feng Shui Studio',
        makerAvatar: prod.makerAvatar || null,
        makerSales: prod.makerSales || 1200,
        starSeller: prod.starSeller || false,
        bestseller: prod.bestseller || false,
        etsyPick: prod.etsyPick || false,
        freeShipping: prod.freeShipping ?? true,
        itemDetails: prod.itemDetails || [],
        materials: prod.materials || [],
        variations: prod.variations ? JSON.parse(JSON.stringify(prod.variations)) : null,
        allowsPersonalization: prod.allowsPersonalization || false,
        personalizationPrompt: prod.personalizationPrompt || null,
        inDemandCount: prod.inDemandCount || 0,
        isFeatured: prod.bestseller || false,
        isActive: true,
      },
      create: {
        id: prod.id,
        title: prod.name,
        slug: uniqueSlug,
        description: prod.description,
        price: prod.price,
        comparePrice: prod.originalPrice || null,
        discount: prod.discount || null,
        images: prod.images,
        stock: 50,
        categoryId,
        tags: [prod.category, prod.maker],
        maker: prod.maker || 'Miracle Feng Shui Studio',
        makerAvatar: prod.makerAvatar || null,
        makerSales: prod.makerSales || 1200,
        starSeller: prod.starSeller || false,
        bestseller: prod.bestseller || false,
        etsyPick: prod.etsyPick || false,
        freeShipping: prod.freeShipping ?? true,
        itemDetails: prod.itemDetails || [],
        materials: prod.materials || [],
        variations: prod.variations ? JSON.parse(JSON.stringify(prod.variations)) : null,
        allowsPersonalization: prod.allowsPersonalization || false,
        personalizationPrompt: prod.personalizationPrompt || null,
        inDemandCount: prod.inDemandCount || 0,
        isFeatured: prod.bestseller || false,
        isActive: true,
      },
    });
    createdProducts.push(created);
  }
  console.log(`✅ ${createdProducts.length} Products seeded`);

  // NOTE: Fake sample reviews are intentionally not seeded. Reviews are written
  // by real authenticated customers only once the /api/reviews route ships
  // (see docs/user-gap.md T-R1/T-R3). Seeding admin-authored 5-star reviews
  // created fabricated social proof.

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
