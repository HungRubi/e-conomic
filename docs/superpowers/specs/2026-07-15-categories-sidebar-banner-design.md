# Categories: Sidebar Featured + Banner List + Product Sorting Fix

## Problem
- Sidebar hiển thị tất cả 18 danh mục (nên chỉ hiển thị danh mục nổi bật)
- "Bán chạy" đang dùng `isFeatured` (không đúng nghĩa)
- Chưa có `soldCount` để sort theo lượt bán thực tế

## Changes

### Server
1. **Product model**: thêm `soldCount Int @default(0)`
2. **Endpoint** `GET /api/products/best-selling`: sort by soldCount DESC, limit 8
3. **Categories API**: hỗ trợ query param `?isFeatured=true`
4. Dashboard form thêm field soldCount

### Client
5. **data-mapper + types**: map soldCount, isFeatured
6. **categories.ts**: fetch từ API, support `getFeaturedCategories()`
7. **ShopSidebar**: chỉ hiển thị featured categories từ API
8. **Homepage**: "Bán chạy" → best-selling API; banner vẫn all categories

### Order
1. Prisma schema + migration
2. Server service/controller
3. Dashboard
4. Client types/data-mapper
5. Client categories lib
6. Client sidebar + homepage
