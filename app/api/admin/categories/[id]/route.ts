import { NextRequest } from 'next/server';
import { withRole } from '@/server/middlewares/withAuth';
import { productController } from '@/server/controllers/product.controller';

export const PUT = withRole('ADMIN', (req: NextRequest, { params }: any) =>
  productController.updateCategory(req, { params: Promise.resolve(params) })
);

export const DELETE = withRole('ADMIN', (req: NextRequest, { params }: any) =>
  productController.deleteCategory(req, { params: Promise.resolve(params) })
);
