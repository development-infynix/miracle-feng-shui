import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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

  const sampleRows = [
    [
      '',
      '"Golden Citrine Wealth Tree (Large)"',
      '"Crystals & Trees"',
      '2899',
      '3999',
      '25',
      '"Handcrafted natural citrine gemstone tree with copper wiring on an authentic quartz crystal cluster base. Blessed by Feng Shui master for prosperity corner."',
      '"https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80 | https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?auto=format&fit=crop&w=800&q=80"',
      'true',
      'true',
      'true',
      '"Miracle Feng Shui Studio"',
      '"Citrine | Prosperity | Wealth Tree | Crystals"',
    ].join(','),
    [
      '',
      '"Brass Bagua Mirror for Energy Protection"',
      '"Feng Shui Decor"',
      '1499',
      '1999',
      '40',
      '"Convex brass bagua mirror with trigram markings designed to deflect negative sha chi away from the front entrance or windows."',
      '"https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80"',
      'false',
      'false',
      'true',
      '"Miracle Feng Shui Studio"',
      '"Bagua | Protection | Brass Decor"',
    ].join(','),
    [
      '',
      '"Authentic Cinnabar Pixiu Abundance Bracelet"',
      '"Feng Shui Jewelry"',
      '1899',
      '2499',
      '30',
      '"Natural high-content cinnabar carved Pixiu beads strung on durable elastic cord. Attracts financial windfall and good fortune."',
      '"https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"',
      'true',
      'false',
      'true',
      '"Miracle Feng Shui Studio"',
      '"Pixiu | Cinnabar | Luck Bracelet"',
    ].join(','),
  ];

  const csvContent = [headers.join(','), ...sampleRows].join('\r\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="miracle-feng-shui-sample-template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
