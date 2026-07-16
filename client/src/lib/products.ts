import type { Product } from '@/types';
import { apiFetch } from './api-client';
import { mapProduct, mapProductList, type ServerProduct } from './data-mapper';

// ── API functions ──

export async function getProducts(filters?: {
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.categorySlug) params.set('categorySlug', filters.categorySlug);
  if (filters?.sort) {
    switch (filters.sort) {
      case 'price_asc': params.set('sortBy', 'price'); params.set('sortOrder', 'asc'); break;
      case 'price_desc': params.set('sortBy', 'price'); params.set('sortOrder', 'desc'); break;
      case 'rating': params.set('sortBy', 'createdAt'); params.set('sortOrder', 'desc'); break;
      case 'newest': params.set('sortBy', 'createdAt'); params.set('sortOrder', 'desc'); break;
      default: params.set('sortBy', 'createdAt'); params.set('sortOrder', 'desc');
    }
  }
  if (filters?.search) params.set('q', filters.search);
  params.set('pageSize', '100');

  const data = await apiFetch<{ data: ServerProduct[]; items: ServerProduct[] }>(`/products?${params}`);
  return mapProductList(data.data ?? data.items ?? []);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const data = await apiFetch<ServerProduct>(`/products/${slug}`);
  return mapProduct(data);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const data = await apiFetch<{ data: ServerProduct[]; items: ServerProduct[] }>('/products/featured');
  return mapProductList(data.data ?? data.items ?? []);
}

export async function getNewArrivals(): Promise<Product[]> {
  const data = await apiFetch<{ data: ServerProduct[]; items: ServerProduct[] }>('/products/new-arrivals');
  return mapProductList(data.data ?? data.items ?? []);
}

export async function getBestSellingProducts(): Promise<Product[]> {
  const data = await apiFetch<{ data: ServerProduct[]; items: ServerProduct[] }>('/products/best-selling');
  return mapProductList(data.data ?? data.items ?? []);
}

export async function getRelatedProducts(productId: string, categoryId?: string): Promise<Product[]> {
  if (categoryId) {
    try {
      const data = await apiFetch<{ data: ServerProduct[]; items: ServerProduct[] }>(`/products?categoryId=${categoryId}&pageSize=8`);
      const list = mapProductList(data.data ?? data.items ?? []);
      return list.filter(p => p.id !== productId);
    } catch {
      return [];
    }
  }
  return [];
}

// ── Fallback mock data (used by cart suggested products, kept for backward compat) ──

import { products } from './products.mock';
export { products };

// Also re-export type for convenience
export type { Product };
