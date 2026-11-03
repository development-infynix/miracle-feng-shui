import { NextRequest } from 'next/server';
import { productController } from '@/server/controllers/product.controller';

export const GET = (req: NextRequest) => productController.categories(req);
export const POST = (req: NextRequest) => productController.createCategory(req);
