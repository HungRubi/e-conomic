import type { Category } from '@/types';
import { apiFetch } from './api-client';
import { mapCategory, type ServerCategory } from './data-mapper';

export async function fetchCategories(isFeatured?: boolean): Promise<Category[]> {
  const params = isFeatured !== undefined ? `?isFeatured=${isFeatured}` : '';
  const data = await apiFetch<ServerCategory[]>(`/categories${params}`);
  return data.map(mapCategory);
}

export async function getCategories(): Promise<Category[]> {
  return fetchCategories();
}

export async function getFeaturedCategories(): Promise<Category[]> {
  return fetchCategories(true);
}
