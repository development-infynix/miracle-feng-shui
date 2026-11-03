import { NextRequest } from 'next/server';
import { productQuerySchema } from '../validators/product.validator';
import { productService } from '../services/product.service';
import { apiResponse } from '../utils/apiResponse';
import { handleError } from '../middlewares/handleError';

export const productController = {
  async list(req: NextRequest) {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams);
      const query = productQuerySchema.parse(searchParams);
      const result = await productService.list(query);
      return apiResponse.ok(result);
    } catch (error) {
      return handleError(error);
    }
  },

  async getDetail(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
      const resolved = await params;
      const product = await productService.getBySlugOrId(resolved.slug);
      return apiResponse.ok(product);
    } catch (error) {
      return handleError(error);
    }
  },

  async categories(_req: NextRequest) {
    try {
      const categories = await productService.listCategories();
      return apiResponse.ok(categories);
    } catch (error) {
      return handleError(error);
    }
  },

  async createCategory(req: NextRequest) {
    try {
      const body = await req.json();
      const category = await productService.createCategory(body);
      return apiResponse.ok(category, 201);
    } catch (error) {
      return handleError(error);
    }
  },

  async updateCategory(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const body = await req.json();
      const updated = await productService.updateCategory(id, body);
      return apiResponse.ok(updated);
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteCategory(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      let reassignToCategoryId: string | undefined;
      try {
        const body = await req.json();
        reassignToCategoryId = body?.reassignToCategoryId;
      } catch {
        // Body might be empty in DELETE requests
      }
      if (!reassignToCategoryId) {
        const queryReassign = req.nextUrl.searchParams.get('reassignTo');
        if (queryReassign) reassignToCategoryId = queryReassign;
      }
      await productService.deleteCategory(id, reassignToCategoryId);
      return apiResponse.ok({ message: 'Category deleted successfully' });
    } catch (error) {
      return handleError(error);
    }
  },
};

