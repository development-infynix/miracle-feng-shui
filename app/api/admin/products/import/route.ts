import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// RFC 4180 compliant CSV parser that handles quotes, line breaks, and escaped quotes
function parseCsv(text: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      if (current.trim()) {
        lines.push(current);
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    lines.push(current);
  }

  if (lines.length < 2) return [];

  const splitRow = (rowStr: string): string[] => {
    const cells: string[] = [];
    let cell = '';
    let inQ = false;
    for (let i = 0; i < rowStr.length; i++) {
      const c = rowStr[i];
      const nc = rowStr[i + 1];
      if (c === '"') {
        if (inQ && nc === '"') {
          cell += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (c === ',' && !inQ) {
        cells.push(cell.trim());
        cell = '';
      } else {
        cell += c;
      }
    }
    cells.push(cell.trim());
    return cells;
  };

  const headers = splitRow(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const results: Array<Record<string, string>> = [];

  for (let r = 1; r < lines.length; r++) {
    const values = splitRow(lines[r]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      let val = values[idx] ?? '';
      // Strip outer quotes if any
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      obj[h] = val.trim();
    });
    results.push(obj);
  }

  return results;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    let csvText = '';
    let updateExisting = true;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No CSV file uploaded' }, { status: 400 });
      }
      csvText = await file.text();
      const updateParam = formData.get('updateExisting');
      if (updateParam !== null) {
        updateExisting = updateParam === 'true' || updateParam === '1';
      }
    } else {
      const body = await req.json();
      csvText = body.csvText || '';
      if (body.updateExisting !== undefined) {
        updateExisting = Boolean(body.updateExisting);
      }
    }

    if (!csvText || !csvText.trim()) {
      return NextResponse.json({ success: false, error: 'CSV content is empty' }, { status: 400 });
    }

    const records = parseCsv(csvText);
    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No data rows found in CSV' }, { status: 400 });
    }

    // Cache categories to avoid repeated queries
    const allCategories = await prisma.category.findMany();
    const categoryMap = new Map<string, string>(); // name or slug -> id
    for (const cat of allCategories) {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
    }

    // Ensure default category exists
    let defaultCategoryId = categoryMap.get('feng shui decor') || allCategories[0]?.id;
    if (!defaultCategoryId) {
      const defaultCat = await prisma.category.create({
        data: {
          name: 'Feng Shui Decor',
          slug: 'feng-shui-decor',
          description: 'Auspicious home & temple energy decor',
        },
      });
      defaultCategoryId = defaultCat.id;
      categoryMap.set('feng shui decor', defaultCategoryId);
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: Array<{ row: number; title?: string; message: string }> = [];

    for (let i = 0; i < records.length; i++) {
      const rowNumber = i + 2; // +1 for header, +1 for 1-based indexing
      const row = records[i];

      const rawTitle = row.title || row.name || row['product name'] || '';
      if (!rawTitle) {
        errors.push({ row: rowNumber, message: 'Missing product title' });
        continue;
      }

      const rawPrice = parseFloat(row.price);
      if (isNaN(rawPrice) || rawPrice <= 0) {
        errors.push({ row: rowNumber, title: rawTitle, message: `Invalid price: "${row.price}"` });
        continue;
      }

      const rawComparePrice = row.compareprice || row.originalprice;
      const comparePrice = rawComparePrice ? parseFloat(rawComparePrice) : null;
      const stock = parseInt(row.stock || '50', 10);
      const safeStock = isNaN(stock) ? 50 : Math.max(0, stock);

      // Images
      const rawImages = row.images || row.image || '';
      const imagesList = rawImages
        ? rawImages
            .split(/[|]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [
            'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
          ];

      // Tags
      const rawTags = row.tags || '';
      const tagsList = rawTags
        ? rawTags
            .split(/[|,]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [];

      // Booleans
      const isTrue = (val?: string) =>
        ['true', '1', 'yes', 'y'].includes((val || '').toLowerCase().trim());
      const bestseller = isTrue(row.bestseller);
      const etsyPick = isTrue(row.etsypick);
      const freeShipping = row.freeshipping !== undefined ? isTrue(row.freeshipping) : true;

      // Category lookup or creation
      const categoryName = row.category || 'Feng Shui Decor';
      let categoryId = categoryMap.get(categoryName.toLowerCase());
      if (!categoryId) {
        try {
          const newCat = await prisma.category.create({
            data: {
              name: categoryName,
              slug: slugify(categoryName) || `cat-${Date.now()}`,
            },
          });
          categoryId = newCat.id;
          categoryMap.set(categoryName.toLowerCase(), categoryId);
        } catch {
          categoryId = defaultCategoryId;
        }
      }

      const productId = row.id?.trim();

      try {
        let existing = null;
        if (productId) {
          existing = await prisma.product.findUnique({ where: { id: productId } });
        }

        if (existing && updateExisting) {
          await prisma.product.update({
            where: { id: productId },
            data: {
              title: rawTitle,
              price: rawPrice,
              comparePrice: comparePrice && comparePrice > rawPrice ? comparePrice : null,
              stock: safeStock,
              description: row.description || existing.description,
              images: imagesList.length ? imagesList : existing.images,
              categoryId: categoryId || existing.categoryId,
              bestseller,
              etsyPick,
              freeShipping,
              maker: row.maker || existing.maker,
              tags: tagsList.length ? tagsList : existing.tags,
            },
          });
          updatedCount++;
        } else {
          // Create new product
          const baseSlug = slugify(rawTitle) || 'product';
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const finalSlug = `${baseSlug}-${randomSuffix}`;

          await prisma.product.create({
            data: {
              ...(productId && !existing ? { id: productId } : {}),
              title: rawTitle,
              slug: finalSlug,
              description:
                row.description ||
                'Handcrafted and temple-energized authentic sacred talisman from Miracle Feng Shui.',
              price: rawPrice,
              comparePrice: comparePrice && comparePrice > rawPrice ? comparePrice : null,
              stock: safeStock,
              images: imagesList,
              categoryId: categoryId || defaultCategoryId,
              bestseller,
              etsyPick,
              freeShipping,
              maker: row.maker || 'Miracle Feng Shui Studio',
              tags: tagsList,
              itemDetails: [
                'Handcrafted with authentic sacred blessing',
                'Purified with sandalwood incense before delivery',
              ],
            },
          });
          createdCount++;
        }
      } catch (err: any) {
        errors.push({
          row: rowNumber,
          title: rawTitle,
          message: err?.message || 'Failed to save product in database',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: records.length,
        createdCount,
        updatedCount,
        errors,
      },
    });
  } catch (error: any) {
    console.error('CSV import handler failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process CSV import' },
      { status: 500 }
    );
  }
}
