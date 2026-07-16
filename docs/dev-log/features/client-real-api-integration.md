# Feature: Client — Real API Integration

## Metadata
- **Ngày bắt đầu:** 2026-07-15
- **Ngày hoàn thành:** ⏳ In Progress
- **Module(s):** `server/` + `client/`
- **Trạng thái:** ⏳ In Progress

## Mô tả
Tạo public API endpoints cho client storefront (không cần auth), thay thế mock data bằng real API calls từ server.

## Các file ảnh hưởng

### Server — new files
```
server/src/catalog/public-products.controller.ts   — GET /api/products, /api/products/featured, /api/products/new-arrivals, /api/products/:slug
server/src/catalog/public-categories.controller.ts — GET /api/categories, /api/categories/:slug
```

### Server — modified files
```
server/src/catalog/catalog.module.ts               — register public controllers
server/src/catalog/products.service.ts             — add getBySlug(), isFeatured filter in list()
server/src/catalog/categories.service.ts           — add getBySlug()
```

### Client — new files
```
client/src/lib/env.ts                              — NEXT_PUBLIC_API_URL config
client/src/lib/api-client.ts                       — apiFetch<T>() wrapper + ApiError class
client/src/lib/data-mapper.ts                      — map server Product/Category → client types
client/src/lib/products.mock.ts                    — mock data extracted from products.ts
client/src/lib/categories.mock.ts                  — mock data extracted from categories.ts
client/.env.local                                  — API_URL=http://localhost:4000
```

### Client — modified files
```
client/src/lib/products.ts                         — replace mock fns with real API calls (getProducts, getProductBySlug, getFeaturedProducts, getNewArrivals, getRelatedProducts)
client/src/lib/categories.ts                       — add fetchCategories() + getCategories() with cache
client/src/app/(shop)/[[...slug]]/page.tsx          — update related products call with categoryId
client/src/app/(shop)/san-pham/[slug]/page.tsx      — update import to use new products.ts API fns
```

## Quyết định kiến trúc
- **Vấn đề:** Client đang dùng mock data, cần fetch từ server nhưng không muốn auth guard cho public pages
- **Giải pháp:** Tạo `PublicProductsController` và `PublicCategoriesController` không có `@UseGuards`, chỉ filter status=ACTIVE
- **Lý do:** Không lộ draft/archived products ra public, vẫn giữ admin controllers riêng với auth

## API Endpoints (public)
| Method | Path | Mô tả |
|---|---|---|
| GET | /api/products | List products (filter: categoryId, q, sortBy, sortOrder, pageSize, page) |
| GET | /api/products/featured | Featured products (isFeatured=true) |
| GET | /api/products/new-arrivals | Newest products |
| GET | /api/products/:slug | Product detail by slug |
| GET | /api/categories | All categories (status=ACTIVE) |
| GET | /api/categories/:slug | Category detail by slug |

## Data mapping
Server Prisma schema khác client types nên cần `data-mapper.ts`:
- `mapProduct()` — chuyển `ServerProduct` → `Product` (price Decimal→number, categories→categoryId, variants→options)
- `mapCategory()` — chuyển `ServerCategory` → `Category`
- `mapProductList()` — batch map

## Notes / Issues
- Cart page (gio-hang) vẫn dùng mock `products` cho suggested products — không ảnh hưởng core flow
- Product detail page "related products" section vẫn dùng mock array làm fallback — có thể cải thiện sau
- `categories` trong ShopSidebar và homepage vẫn import từ mock để tránh async loading phức tạp — sẽ migrate sau khi có TanStack Query integration
- Cần chạy server (`npm run dev` trong server/) trước khi client fetch
