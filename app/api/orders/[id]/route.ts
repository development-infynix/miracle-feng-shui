import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { orderService } from '@/server/services/order.service';
import { withAuth } from '@/server/middlewares/withAuth';

export const GET = withAuth(async (_req: NextRequest, { user, params }) => {
  try {
    const { id } = params as { id: string };
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order identifier required' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        // The access token is what customer links carry; id and number still work for the owner and admins.
        OR: [{ accessToken: id }, { id }, { orderNumber: id }],
      },
      include: {
        statusEvents: { select: { toStatus: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
        refunds: { orderBy: { createdAt: 'desc' } },
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Someone else's order looks the same as one that doesn't exist, so numbers can't be probed.
    if (!order || (user.role !== 'ADMIN' && order.userId !== user.id)) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const formatted = orderService.formatOrder(order);
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Order detail lookup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch order' }, { status: 500 });
  }
});
