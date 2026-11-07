import { NextRequest } from 'next/server';
import { withRole } from '@/server/middlewares/withAuth';
import { productController } from '@/server/controllers/product.controller';

export const GET = withRole('ADMIN', (req: NextRequest) => productController.categories(req));
export const POST = withRole('ADMIN', (req: NextRequest) => productController.createCategory(req));
