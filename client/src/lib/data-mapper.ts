import type { Product, ProductVariant, Category } from '@/types';

interface ServerProductCategoryMap {
  category: ServerCategory;
  isPrimary: boolean;
  sortOrder: number;
}

interface ServerCategory extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  level: number;
  path?: string;
  showInMenu: boolean;
  showInHomepage: boolean;
  isFeatured: boolean;
  sortOrder: number;
  children?: ServerCategory[];
  createdAt: string;
}

interface ServerProduct extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  shortDescription: string | null;
  price: number | string;
  compareAtPrice: number | string | null;
  images: string[];
  thumbnailSmall: string | null;
  thumbnailLarge: string | null;
  stockQuantity: number;
  isFeatured: boolean;
  status: string;
  type: string;
  categories: ServerProductCategoryMap[];
  variants: ServerVariant[];
  createdAt: string;
  attributes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

interface ServerVariant extends Record<string, unknown> {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number | string | null;
  compareAtPrice: number | string | null;
  stockQuantity: number;
  options?: Record<string, unknown> | null;
  images: string[];
  sortOrder: number;
  isActive: boolean;
}

export function mapProduct(p: ServerProduct): Product {
  const price = Number(p.price);
  const primaryCat = p.categories?.find((c) => c.isPrimary)?.category
    ?? p.categories?.[0]?.category;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? '',
    price,
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    images: p.images.length > 0
      ? p.images
      : (p.thumbnailLarge ? [p.thumbnailLarge] : []),
    categoryId: primaryCat?.id ?? p.categories?.[0]?.category?.id ?? '',
    category: primaryCat ? mapCategory(primaryCat) : undefined,
    variants: p.variants.filter((v) => v.isActive).map(mapVariant),
    tags: extractTags(p),
    soldCount: Number(p.soldCount ?? 0),
    rating: 0,
    reviewCount: 0,
    createdAt: p.createdAt,
  };
}

function mapVariant(v: ServerVariant): ProductVariant {
  const price = v.price ? Number(v.price) : 0;
  return {
    id: v.id,
    productId: v.productId,
    sku: v.sku ?? '',
    stock: v.stockQuantity,
    price,
    ...(v.options?.size ? { size: String(v.options.size) } : {}),
    ...(v.options?.color ? { color: String(v.options.color) } : {}),
  };
}

function extractTags(p: ServerProduct): string[] {
  const tags: string[] = [];
  if (p.isFeatured) tags.push('bán chạy');
  // Use metadata?.tags if provided by dashboard, else derive from status/featured
  if (p.metadata && typeof p.metadata === 'object' && 'tags' in p.metadata) {
    const metaTags = (p.metadata as { tags?: string[] }).tags;
    if (Array.isArray(metaTags)) tags.push(...metaTags);
  }
  return tags;
}

export function mapCategory(c: ServerCategory): Category {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    image: c.image ?? undefined,
    icon: c.icon ?? undefined,
    parentId: c.parentId ?? undefined,
    children: c.children?.map(mapCategory),
  };
}

export function mapProductList(data: ServerProduct[]): Product[] {
  return data.map(mapProduct);
}

export type { ServerProduct, ServerCategory };
