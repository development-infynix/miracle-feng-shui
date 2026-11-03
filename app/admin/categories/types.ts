export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  /** Active products: the same set the products page lists for this category. */
  activeCount: number;
  inactiveCount: number;
  /** All linked products, active and inactive. */
  productCount: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CategoryStats {
  totalCategories: number;
  activeProducts: number;
  inactiveProducts: number;
}
