export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CategoryStats {
  totalCategories: number;
  assignedProducts: number;
}
