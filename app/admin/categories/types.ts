export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  activeCount: number;
  inactiveCount: number;
  /** All linked products, active and inactive: the same set the products page lists. */
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
