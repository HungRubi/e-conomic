# Feature: Seed Data (Categories + Products)

## Metadata
- **Ngày bắt đầu:** 2026-07-15
- **Ngày hoàn thành:** 2026-07-15 ✅
- **Module(s):** `server/prisma/`
- **Trạng thái:** ✅ Done

## Mô tả
Seed script tạo dữ liệu mẫu cho development: 58 danh mục (3 levels) + 80 sản phẩm với ảnh.

## Image Strategy
**100% Unsplash** — mỗi sản phẩm và danh mục có ảnh thật từ Unsplash, đúng chủ đề.
- Product: `https://images.unsplash.com/{photo-id}?w=400&h=400&fit=crop&q=80` (thumbnail)
- Category: `https://images.unsplash.com/{photo-id}?w=800&h=800&fit=crop&q=80`
- Format: `?` (không `&`) cho query params đầu tiên

*(Local path option đã bỏ vì gây ảnh không hiển thị. Nếu cần upload server sau có thể thêm lại.)*

## Kết quả
| Loại | Count | Ghi chú |
|---|---|---|
| Danh mục level 0 | 12 | Top categories |
| Danh mục level 1 | 41 | Subcategories |
| Danh mục level 2 | 5 | Deep subcategories |
| **Tổng categories** | **58** | — |
| **Tổng products** | **80** | Active, SIMPLE type |
| Sản phẩm featured | ~20 | isFeatured = true |
| Giá thấp nhất | 35,000 | Bút bi / Bánh tráng |
| Giá cao nhất | 38,990,000 | Dell XPS 15 |

## Seed Tests
- `server/src/prisma/seed.spec.ts` — 21 tests kiểm tra counts, hierarchy, image URLs, unique slugs/SKUs
- Chạy: `cd server && npx jest src/prisma/seed.spec.ts`
- Tất cả pass ✅

## Cách dùng
```bash
cd server
npm run prisma:seed       # seed once
npm run prisma:db:seed    # reset + seed (if you add prisma:reset script)
```

## File
- `server/prisma/seed.ts` — main seed script
