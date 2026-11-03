import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { invoiceService, InvoiceOrderData } from '@/server/services/invoice.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';

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

    // 2. Fallback if order not in DB (e.g. guest order or session order)
    if (!orderData) {
      let itemsList: any[] = [];
      const itemsParam = searchParams.get('items');
      if (itemsParam) {
        try {
          itemsList = JSON.parse(itemsParam);
        } catch {}
      }

      const totalVal = Number(searchParams.get('total')) || 2433;
      if (!itemsList.length) {
        const itemTitle = searchParams.get('itemTitle') || 'Taoist Master Blessed Five Emperor Coins: Feng Shui';
        itemsList = [{ title: itemTitle, price: totalVal, quantity: 1 }];
      }

      orderData = {
        orderNumber: id.startsWith('MFS-') ? id : `MFS-${id.slice(-6).toUpperCase()}`,
        customerName: searchParams.get('customerName') || 'Valued Customer',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        address: searchParams.get('address') || 'Address on file',
        paymentMethod: searchParams.get('paymentMethod') || 'UPI / Online Payment',
        paymentStatus: searchParams.get('paymentStatus') || 'PAID',
        totalAmount: totalVal,
        date: searchParams.get('date') || new Date().toISOString().substring(0, 10),
        items: itemsList.map((it) => ({
          title: it.title || it.name || 'Consecrated Feng Shui Item',
          price: Number(it.price) || totalVal,
          quantity: Number(it.quantity) || 1,
        })),
      };
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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const orderNum = body.orderId || body.orderNumber || id;
    const totalAmount = Number(body.totalAmount || body.total || 0);

    const orderData: InvoiceOrderData = {
      orderNumber: orderNum.startsWith('MFS-') ? orderNum : `MFS-${orderNum.slice(-6).toUpperCase()}`,
      customerName: body.customerName || 'Valued Customer',
      email: body.customerEmail || body.email || '',
      phone: body.customerPhone || body.phone || '',
      address: body.deliveryAddress || body.address || 'Address provided at checkout',
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      paymentMethod: body.paymentMethod || 'Online Payment',
      paymentStatus: body.paymentStatus || 'Paid in Full',
      totalAmount: totalAmount,
      date: body.orderDate || body.date || new Date().toISOString().substring(0, 10),
      items: (body.items || []).map((it: any) => ({
        id: it.id,
        title: it.name || it.title || it.productName || 'Sacred Feng Shui Item',
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
      })),
    };

    const pdfBuffer = await invoiceService.generateInvoicePdf(orderData);
    const uint8 = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Tax-Invoice-${orderData.orderNumber}.pdf"`,
        'Content-Length': uint8.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('POST Invoice download error:', error);
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 });
  }
}

