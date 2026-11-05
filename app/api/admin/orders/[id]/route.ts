import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { apiResponse } from '@/server/utils/apiResponse';
import { handleError } from '@/server/middlewares/handleError';

export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await context.params;
    // Refunds are money records, so an order that has one stays.
    if (await prisma.refund.count({ where: { orderId: id } })) {
      return apiResponse.error("This order has a refund, so it can't be deleted.", 409);
    }
    await prisma.order.delete({
      where: { id },
    });
    return apiResponse.ok({ message: 'Order successfully deleted' });
  } catch (error) {
    return handleError(error);
  }
};
