import { NextRequest } from 'next/server';
import { productController } from '@/server/controllers/product.controller';

export const GET = (req: NextRequest, context: { params: Promise<{ slug: string }> }) =>
  productController.getDetail(req, context);
