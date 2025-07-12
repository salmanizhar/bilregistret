export interface TickoProduct {
  id: string;
  name: string;
  brand: string;
  price: string;
  image_url: string;
  url: string;
  description?: string;
  scale?: string;  // Model scale like 1:18, 1:43, etc.
}

export interface SkruvatProduct {
  name: string;
  category: string;
  price: string;
  shipping: string;
  imageurl: string;
  trackingurl: string;
  brand: string;
}

export interface MekonomenProduct {
  Name: string;
  Category: string;
  Price: string;
  ImageUrl: string;
  TrackingUrl: string;
  Brand: string;
}

export interface DrivknutenProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  image_url: string;
  product_url: string;
  carlinkment_id: string[];
  modell_id: string[];
  matched_by: 'carlinkment_id' | 'modell_id' | 'universal';
}

export interface DacklineProduct {
  season: string;
  name: string;
  image: string;
  brand: string;
  price: string;
  productUrl: string;
  type: 'wheel' | 'tyre';
  size: number;
  width?: number;
  profile?: number;
}

export interface DacklineParams {
  tyres: string[];
  et_min: number;
  et_max: number;
  pcd: string;
}

// Response types
export interface TickoProductsResponse {
  results: TickoProduct[];
  total: number;
  page: number;
  page_size: number;
}

export interface SkruvatProductsResponse {
  success: boolean;
  results: SkruvatProduct[];
}

export interface MekonomenProductsResponse {
  success: boolean;
  results: MekonomenProduct[];
}

export interface DrivknutenProductsResponse {
  success: boolean;
  matched_by: 'carlinkment_id' | 'modell_id' | 'universal';
  results: DrivknutenProduct[];
}

export interface DacklineProductsResponse {
  success: boolean;
  wheels: DacklineProduct[];
  tyre: DacklineProduct[];
  sizes: number[];
} 