import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { invoiceService, InvoiceOrderData } from '@/server/services/invoice.service';
import { withAuth, type AuthenticatedUser } from '@/server/middlewares/withAuth';

async function getInvoice(req: NextRequest, user: AuthenticatedUser, id: string, forceDownload = false) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const isDownload = forceDownload || searchParams.get('download') === '1' || searchParams.get('download') === 'true';

    // 1. Try to find the order in the database
    let orderData: InvoiceOrderData | null = null;

    try {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
        },
        include: {
          items: true,
          user: { select: { name: true, email: true, phone: true } },
        },
      });

      // Someone else's order looks the same as one that doesn't exist.
      if (order && user.role !== 'ADMIN' && order.userId !== user.id) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      if (order) {
        const addr = (order.shippingAddress as any) || {};
        orderData = {
          orderNumber: order.orderNumber,
          customerName: order.user?.name || addr.name || addr.fullName || 'Valued Customer',
          email: order.user?.email || addr.email || '',
          phone: order.user?.phone || addr.phone || '',
          address: typeof addr === 'string' ? addr : addr.line1 ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}` : 'Address on file',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          paymentMethod: order.paymentMethod === 'RAZORPAY' ? 'UPI / Online Payment' : (order.paymentMethod || 'Cash on Delivery'),
          paymentStatus: order.paymentStatus || 'PAID',
          totalAmount: Number(order.total) || 0,
          date: order.createdAt ? order.createdAt.toISOString().replace('T', ' ').substring(0, 10) : new Date().toISOString().substring(0, 10),
          items: (order.items || []).map((it) => ({
            id: it.id,
            title: it.title,
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
          })),
        };
      }
    } catch (dbErr) {
      console.warn('DB lookup failed for invoice, using fallback parameters:', dbErr);
    }

    if (!orderData) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const pdfBuffer = await invoiceService.generateInvoicePdf(orderData);
    const uint8 = new Uint8Array(pdfBuffer);

    // If downloading, use 'attachment'; if viewing, use 'inline' for native browser / Safari PDF reader
    const disposition = isDownload ? 'attachment' : 'inline';

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="Tax-Invoice-${orderData.orderNumber}.pdf"`,
        'Content-Length': uint8.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Invoice download error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

export const GET = withAuth((req: NextRequest, { user, params }) =>
  getInvoice(req, user, (params as { id: string }).id)
);

export const POST = withAuth((req: NextRequest, { user, params }) =>
  getInvoice(req, user, (params as { id: string }).id, true)
);
