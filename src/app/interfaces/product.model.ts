export interface Product {
  id: number;
  name: string;
  categoryId: number;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  createdAt?: string;
  minStock: number;
  description?: string;
  imageUrl?: string;
  brand?: string;
  model?: string;
  specifications?: {
    material?: string;
    capacity?: string;
    color?: string;
  };
  status: string;
  unit: string;
  barcode?: string;
  sku?: string;
  discount?: number;
}
