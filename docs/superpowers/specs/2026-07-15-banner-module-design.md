# Banner Module — Design Spec

## Overview
Thêm hệ thống banner cho trang home client: model Banner riêng, API CRUD + public, seed 5 banner, Dashboard UI quản lý (xịn như product detail), tích hợp vào client homepage thay thế mock data.

## Architecture
- **Server**: `BannerModule` riêng — Prisma model + controller + service + seed
- **Dashboard**: Banner CRUD trong tab "Nội dung", UI edit như product-detail-panel
- **Client**: fetch từ API, thay thế hero slides + AdBanner mock

## Server — BannerModule

### Prisma model
```prisma
model Banner {
  id        String     @id @default(uuid())
  imageUrl  String
  linkUrl   String?
  altText   String?
  type      BannerType @default(BANNER)
  sortOrder Int        @default(0)
  active    Boolean    @default(true)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  @@map("banners")
}
enum BannerType { HERO BANNER }
```

### Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/banners?type=HERO` | Public | Lấy banner theo type, active=true, sortOrder ASC |
| `GET` | `/api/admin/banners` | Admin | List all (cả inactive) |
| `POST` | `/api/admin/banners` | Admin | Create |
| `PATCH` | `/api/admin/banners/:id` | Admin | Update |
| `DELETE` | `/api/admin/banners/:id` | Admin | Delete |
| `POST` | `/api/admin/banners/upload` | Admin | Upload ảnh → return URL |

### Upload
- Dùng multer, lưu `server/uploads/banners/`
- File: `banner-<uuid>.<ext>`
- Accept: JPEG, PNG, WebP, GIF
- Max 5MB per file

### Seed — 5 banners
**HERO (1920x640)**:
1. Thời trang nam cao cấp
2. Trang sức & phụ kiện sang trọng

**BANNER (1200x240)**:
3. Miễn phí vận chuyển cho đơn trên 500K
4. Sale mùa hè — giảm đến 40%
5. Bộ sưu tập mới — thu đông 2026

### Files
```
server/src/banners/
  banners.module.ts
  banners.service.ts
  banners.controller.ts
  public-banners.controller.ts
  dto/create-banner.dto.ts
  dto/update-banner.dto.ts
  seed/banner-seed.ts
server/uploads/banners/
```

## Dashboard — Banner CRUD
- Mục "Banners" trong sidebar tab "Nội dung"
- **List page**: table ảnh preview, type badge, active toggle, actions
- **Detail page**: layout như product-detail-panel — EditableField cho từng field
- **Image editor**: reuse `ProductImagesEditor` (upload file + URL remote)
- Delete confirmation dialog

## Client — Homepage Integration
- `client/src/lib/banners.ts` — fetch banners từ public API
- Hero slider → replace hardcode với HERO banners (fallback nếu empty)
- AdBanner sections → replace mock ads với BANNER banners
- Loading/empty/error states

## 3 Rounds
1. **Server**: Prisma schema + migration + seed + BannerModule (public + admin endpoints + upload)
2. **Client**: lib/banners.ts, hero slider integration, AdBanner integration
3. **Dashboard**: Banner list page + detail/edit page (xịn như product-detail-panel)
