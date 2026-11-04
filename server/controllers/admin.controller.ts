import { NextRequest } from 'next/server';
import { adminService } from '../services/admin.service';
import {
  adminProductQuerySchema,
  createProductSchema,
  updateProductSchema,
  updateOrderStatusSchema,
  updateHomepageSectionSchema,
} from '../validators/admin.validator';
import { apiResponse } from '../utils/apiResponse';

export const adminController = {
  async getDashboard() {
    const data = await adminService.getDashboard();
    return apiResponse.ok(data);
  },

  async getProducts(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = adminProductQuerySchema.parse({
      page: searchParams.get('page') || undefined,
      pageSize: searchParams.get('pageSize') || undefined,
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      lowStock: searchParams.get('lowStock') || undefined,
    });

    const data = await adminService.getProducts(query);
    return apiResponse.ok(data);
  },

  async createProduct(req: NextRequest) {
    const body = await req.json();
    const input = createProductSchema.parse(body);
    const product = await adminService.createProduct(input);
    return apiResponse.created(product);
  },

  async getProduct(req: NextRequest, params: { id: string }) {
    const product = await adminService.getProductById(params.id);
    return apiResponse.ok(product);
  },

  async updateProduct(req: NextRequest, params: { id: string }) {
    const body = await req.json();
    const input = updateProductSchema.parse(body);
    const product = await adminService.updateProduct(params.id, input);
    return apiResponse.ok(product);
  },

  async deleteProduct(req: NextRequest, params: { id: string }) {
    const { searchParams } = new URL(req.url);
    const hardDelete = searchParams.get('hard') === 'true';
    const result = await adminService.deleteProduct(params.id, hardDelete);
    return apiResponse.ok(result);
  },

  async getOrders(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const orders = await adminService.getOrders({ status, search });
    return apiResponse.ok(orders);
  },

  async updateOrderStatus(req: NextRequest, params: { id: string }) {
    const body = await req.json();
    const input = updateOrderStatusSchema.parse(body);
    const order = await adminService.updateOrderStatus(params.id, input);
    return apiResponse.ok(order);
  },

  async getCustomerProfile(params: { id: string }) {
    return apiResponse.ok(await adminService.getCustomerProfile(params.id));
  },

  async getCustomerFavorites(params: { id: string }) {
    return apiResponse.ok(await adminService.getCustomerFavorites(params.id));
  },

  async getCustomerCart(params: { id: string }) {
    return apiResponse.ok(await adminService.getCustomerCart(params.id));
  },

  async getCustomerOrders(params: { id: string }) {
    return apiResponse.ok(await adminService.getCustomerOrders(params.id));
  },

  async getHomepageSections() {
    const sections = await adminService.getHomepageSections();
    return apiResponse.ok(sections);
  },

  async updateHomepageSections(req: NextRequest) {
    const body = await req.json();
    const input = updateHomepageSectionSchema.parse(body);
    const sections = await adminService.updateHomepageSections(input);
    return apiResponse.ok(sections);
  },
};
