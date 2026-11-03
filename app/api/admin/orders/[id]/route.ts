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
    await prisma.order.delete({
      where: { id },
    });
    return apiResponse.ok({ message: 'Order successfully deleted' });
  } catch (error) {
    return handleError(error);
  }
};
