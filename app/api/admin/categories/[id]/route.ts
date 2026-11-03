import { NextRequest } from 'next/server';
import { productController } from '@/server/controllers/product.controller';

export const PUT = (
  req: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) => productController.updateCategory(req, segmentData);

export const DELETE = (
  req: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) => productController.deleteCategory(req, segmentData);
