import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { orderService } from '@/server/services/order.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order identifier required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const formatted = orderService.formatOrder(order);
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Order detail lookup error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch order' }, { status: 500 });
  }
}
