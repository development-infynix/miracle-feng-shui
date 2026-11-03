import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { products as defaultProducts } from '@/lib/placeholder-data';

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  try {
    let productItems: any[] = [];
    try {
      productItems = await prisma.product.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (e) {
      console.warn('Export: DB fetch failed, falling back to seed products', e);
    }

    // Fallback if DB is empty
    if (!productItems || productItems.length === 0) {
      productItems = defaultProducts.map((p: any) => ({
        id: p.id,
        title: p.name,
        category: { name: p.category },
        price: p.price,
        comparePrice: p.originalPrice || '',
        stock: 50,
        description: p.description,
        images: p.images || [],
        bestseller: p.bestseller || false,
        etsyPick: p.etsyPick || false,
        freeShipping: p.freeShipping || true,
        maker: p.maker || 'Miracle Feng Shui Studio',
        tags: [p.category],
      }));
    }

    const headers = [
      'id',
      'title',
      'category',
      'price',
      'comparePrice',
      'stock',
      'description',
      'images',
      'bestseller',
      'etsyPick',
      'freeShipping',
      'maker',
      'tags',
    ];

    const rows = productItems.map((p: any) => {
      const categoryName = p.category?.name || p.category || 'Feng Shui Decor';
      const imagesStr = Array.isArray(p.images) ? p.images.join(' | ') : '';
      const tagsStr = Array.isArray(p.tags) ? p.tags.join(' | ') : '';

      return [
        escapeCsvCell(p.id),
        escapeCsvCell(p.title),
        escapeCsvCell(categoryName),
        escapeCsvCell(p.price),
        escapeCsvCell(p.comparePrice || ''),
        escapeCsvCell(p.stock ?? 50),
        escapeCsvCell(p.description || ''),
        escapeCsvCell(imagesStr),
        escapeCsvCell(p.bestseller ? 'true' : 'false'),
        escapeCsvCell(p.etsyPick ? 'true' : 'false'),
        escapeCsvCell(p.freeShipping ? 'true' : 'false'),
        escapeCsvCell(p.maker || 'Miracle Feng Shui Studio'),
        escapeCsvCell(tagsStr),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="miracle-feng-shui-products-${dateStr}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('CSV export failed:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to export products CSV' },
      { status: 500 }
    );
  }
}
