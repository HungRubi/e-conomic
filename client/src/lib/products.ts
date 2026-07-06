import type { Product } from '@/types';

export const products: Product[] = [
  {
    id: 'prod-1',
    slug: 'ao-thun-cotton-cao-cap',
    name: 'Áo Thun Cotton Cao Cấp',
    description: 'Áo thun chất liệu cotton 100% cao cấp, mềm mại, thoáng mát. Thiết kế đơn giản nhưng tinh tế, phù hợp cho cả nam và nữ. Form regular fit, không co rút sau khi giặt.',
    price: 299000,
    compareAtPrice: 499000,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-1',
    variants: [
      { id: 'v-1', productId: 'prod-1', size: 'S', sku: 'TS-S', stock: 50, price: 299000 },
      { id: 'v-2', productId: 'prod-1', size: 'M', sku: 'TS-M', stock: 100, price: 299000 },
      { id: 'v-3', productId: 'prod-1', size: 'L', sku: 'TS-L', stock: 80, price: 299000 },
      { id: 'v-4', productId: 'prod-1', size: 'XL', sku: 'TS-XL', stock: 30, price: 299000 },
    ],
    tags: ['bán chạy', 'mới'],
    rating: 4.5,
    reviewCount: 128,
    createdAt: '2026-06-15T00:00:00Z',
  },
  {
    id: 'prod-2',
    slug: 'tai-nghe-khong-day-airbuds',
    name: 'Tai Nghe Không Dây AirBuds Pro',
    description: 'Tai nghe không dây chống ồn chủ động ANC, chất âm Hi-Res, thời lượng pin 30 giờ. Sạc nhanh USB-C, chống nước IPX5.',
    price: 1590000,
    compareAtPrice: 2490000,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12f032f58?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-2',
    variants: [
      { id: 'v-5', productId: 'prod-2', color: 'Trắng', sku: 'AB-W', stock: 60, price: 1590000 },
      { id: 'v-6', productId: 'prod-2', color: 'Đen', sku: 'AB-B', stock: 40, price: 1590000 },
    ],
    tags: ['bán chạy', 'hot'],
    rating: 4.8,
    reviewCount: 256,
    createdAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'prod-3',
    slug: 'den-ban-lam-viec-minimal',
    name: 'Đèn Bàn Làm Việc Minimal',
    description: 'Đèn bàn LED hiện đại với thiết kế tối giản. 3 chế độ sáng, chống mỏi mắt, có cổng sạc USB. Phù hợp cho không gian làm việc và học tập.',
    price: 499000,
    compareAtPrice: 699000,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-3',
    variants: [
      { id: 'v-7', productId: 'prod-3', color: 'Trắng', sku: 'DL-W', stock: 35, price: 499000 },
      { id: 'v-8', productId: 'prod-3', color: 'Đen', sku: 'DL-B', stock: 45, price: 499000 },
    ],
    tags: ['mới'],
    rating: 4.3,
    reviewCount: 72,
    createdAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'prod-4',
    slug: 'serum-duong-da-vitamin-c',
    name: 'Serum Dưỡng Da Vitamin C',
    description: 'Serum vitamin C 15% kết hợp EGF và Hyaluronic Acid. Giúp làm sáng da, mờ thâm nám, cấp ẩm sâu. An toàn cho mọi loại da.',
    price: 389000,
    compareAtPrice: 590000,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1570194065650-d99fb4ee3541?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-4',
    variants: [
      { id: 'v-9', productId: 'prod-4', size: '30ml', sku: 'VC-30', stock: 90, price: 389000 },
      { id: 'v-10', productId: 'prod-4', size: '50ml', sku: 'VC-50', stock: 60, price: 549000 },
    ],
    tags: ['bán chạy'],
    rating: 4.6,
    reviewCount: 185,
    createdAt: '2026-05-25T00:00:00Z',
  },
  {
    id: 'prod-5',
    slug: 'giay-chay-bo-ultralight',
    name: 'Giày Chạy Bộ UltraLight 360',
    description: 'Giày chạy bộ siêu nhẹ với công nghệ đệm Boost, thoáng khí, độ bám cao. Thích hợp cho chạy đường dài và tập luyện hàng ngày.',
    price: 1890000,
    compareAtPrice: 2590000,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-5',
    variants: [
      { id: 'v-11', productId: 'prod-5', size: '39', sku: 'UL-39', stock: 25, price: 1890000 },
      { id: 'v-12', productId: 'prod-5', size: '40', sku: 'UL-40', stock: 40, price: 1890000 },
      { id: 'v-13', productId: 'prod-5', size: '41', sku: 'UL-41', stock: 50, price: 1890000 },
      { id: 'v-14', productId: 'prod-5', size: '42', sku: 'UL-42', stock: 35, price: 1890000 },
    ],
    tags: ['hot'],
    rating: 4.7,
    reviewCount: 94,
    createdAt: '2026-06-18T00:00:00Z',
  },
  {
    id: 'prod-6',
    slug: 'sach-lap-trinh-typescript',
    name: 'Sách Lập Trình TypeScript Toàn Tập',
    description: 'Cuốn sách toàn diện về TypeScript từ cơ bản đến nâng cao. Bao gồm: types, generics, decorators, design patterns, và dự án thực tế.',
    price: 249000,
    images: [
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-6',
    variants: [
      { id: 'v-15', productId: 'prod-6', sku: 'TS-BOOK', stock: 200, price: 249000 },
    ],
    tags: ['mới'],
    rating: 4.4,
    reviewCount: 56,
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'prod-7',
    slug: 'ao-khoac-jeans-classic',
    name: 'Áo Khoác Jeans Classic',
    description: 'Áo khoác denim cổ điển, chất liệu bền đẹp, form dáng chuẩn. Phối hợp dễ dàng với nhiều trang phục.',
    price: 699000,
    compareAtPrice: 990000,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-1',
    variants: [
      { id: 'v-16', productId: 'prod-7', size: 'M', sku: 'JK-M', stock: 40, price: 699000 },
      { id: 'v-17', productId: 'prod-7', size: 'L', sku: 'JK-L', stock: 55, price: 699000 },
      { id: 'v-18', productId: 'prod-7', size: 'XL', sku: 'JK-XL', stock: 30, price: 699000 },
    ],
    tags: ['bán chạy'],
    rating: 4.2,
    reviewCount: 43,
    createdAt: '2026-06-05T00:00:00Z',
  },
  {
    id: 'prod-8',
    slug: 'may-anh-polaroid-mini',
    name: 'Máy Ảnh Polaroid Mini 12',
    description: 'Máy ảnh chụp liền Polaroid thế hệ mới. Tính năng tự động lấy nét, chế độ chân dung, màu sắc rực rỡ.',
    price: 1290000,
    compareAtPrice: 1690000,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop',
    ],
    categoryId: 'cat-2',
    variants: [
      { id: 'v-19', productId: 'prod-8', color: 'Xanh Mint', sku: 'PM-G', stock: 20, price: 1290000 },
      { id: 'v-20', productId: 'prod-8', color: 'Hồng', sku: 'PM-P', stock: 15, price: 1290000 },
    ],
    tags: ['hot', 'mới'],
    rating: 4.9,
    reviewCount: 312,
    createdAt: '2026-06-22T00:00:00Z',
  },
];

// Simulate API
export function getProducts(filters?: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
}): Promise<Product[]> {
  let result = [...products];

  if (filters) {
    if (filters.categoryId) {
      result = result.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      );
    }
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
      }
    }
  }

  return new Promise((resolve) => setTimeout(() => resolve(result), 500));
}

export function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      const product = products.find((p) => p.slug === slug);
      if (product) resolve(product);
      else reject(new Error('Product not found'));
    }, 400),
  );
}

export function getFeaturedProducts(): Promise<Product[]> {
  return new Promise((resolve) =>
    setTimeout(
      () => resolve(products.filter((p) => p.tags.includes('bán chạy'))),
      300,
    ),
  );
}

export function getNewArrivals(): Promise<Product[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          [...products]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 4),
        ),
      300,
    ),
  );
}

export function getRelatedProducts(productId: string): Promise<Product[]> {
  const product = products.find((p) => p.id === productId);
  if (!product) return Promise.resolve([]);
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          products.filter(
            (p) =>
              p.id !== productId &&
              p.categoryId === product.categoryId,
          ),
        ),
      300,
    ),
  );
}
