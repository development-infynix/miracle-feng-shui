import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { products, categories, defaultSections } from './seed-data';

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

  // 1. Seed Users (Admin + Customer)
  const adminPasswordHash = await bcrypt.hash('admin', 12);
  const customerPasswordHash = await bcrypt.hash('customer123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@miraclefengshui.com' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      name: 'Miracle Admin',
    },
    create: {
      email: 'admin@miraclefengshui.com',
      passwordHash: adminPasswordHash,
      name: 'Miracle Admin',
      role: 'ADMIN',
      phone: '+91 98765 43210',
    },
  });
  console.log(`✅ Admin user seeded: ${admin.email}`);

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

  // 4. Seed Homepage Sections
  for (let i = 0; i < defaultSections.length; i++) {
    const sec = defaultSections[i];
    await prisma.homepageSection.upsert({
      where: { sectionKey: sec.id },
      update: {
        name: sec.name,
        title: sec.title,
        subtitle: sec.subtitle,
        ctaText: sec.ctaText,
        ctaLink: sec.ctaLink,
        badge: sec.badge,
        order: i,
        enabled: sec.enabled,
      },
      create: {
        sectionKey: sec.id,
        name: sec.name,
        title: sec.title,
        subtitle: sec.subtitle,
        ctaText: sec.ctaText,
        ctaLink: sec.ctaLink,
        badge: sec.badge,
        order: i,
        enabled: sec.enabled,
      },
    });
  }
  console.log(`✅ ${defaultSections.length} Homepage sections seeded`);

  // 5. Seed Products
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
        ratingAvg: prod.rating || 5.0,
        ratingCount: prod.reviewCount || 10,
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
        ratingAvg: prod.rating || 5.0,
        ratingCount: prod.reviewCount || 10,
      },
    });
    createdProducts.push(created);
  }
  console.log(`✅ ${createdProducts.length} Products seeded`);

  // 6. Seed Sample Reviews
  const firstProd = createdProducts[0];
  const secondProd = createdProducts[1];
  if (firstProd) {
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: admin.id,
          productId: firstProd.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        productId: firstProd.id,
        rating: 5,
        comment: 'Breathtaking quality and powerful positive Chi energy! Arrived in auspicious packaging.',
        productVariation: 'Standard Size',
      },
    });
  }
  if (secondProd) {
    await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: admin.id,
          productId: secondProd.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        productId: secondProd.id,
        rating: 5,
        comment: 'Master blessed authentic item. Highly recommended for prosperity corner.',
      },
    });
  }
  console.log('✅ Sample reviews seeded');

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
