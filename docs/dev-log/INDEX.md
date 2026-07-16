# 📓 Dev Log — e-conomic

> **Mục đích:** Lưu trữ toàn bộ quá trình phát triển dự án — feature đã làm, đang làm, kiến trúc, quyết định.  
> **Quy tắc:** Trước khi code bất kỳ chức năng mới nào, **tra cứu INDEX này + search folder** để biết đã làm chưa và các file liên quan.

---

## Cấu trúc

| Đường dẫn | Mô tả |
|---|---|
| `features/` | Chi tiết từng feature — file ảnh hưởng, quyết định, trạng thái |
| `decisions/` | Architecture Decision Records (ADR) — lý do chọn giải pháp |
| `TEMPLATE.md` | Mẫu để ghi entry mới |

---

## Feature Status

| Feature | Module | Status | Files chính | Ghi chú |
|---|---|---|---|---|
| Auth — JWT login/register | Server | ✅ Done | `auth/`, `users/` | Passport JWT, refresh token, forgot/reset password |
| Auth — Guard & RBAC | Server | ✅ Done | `common/guards/admin.guard.ts` | Role check admin, permission stubs pending |
| Product CRUD | Server | ✅ Done | `catalog/products.*` | Paginated, search, filter, soft delete |
| Category CRUD | Server | ✅ Done | `catalog/categories.*` | Tree hierarchy 3 levels, attributes |
| Product variants | Server | ✅ Done | `prisma/schema.prisma` (ProductVariant) | Stock, pricing per variant |
| Dashboard — UI framework | Dashboard | ✅ Done | `App.tsx`, admin-routes, components/ui | shadcn/ui, Radix, routing |
| Dashboard — Products admin | Dashboard | ⏳ Partial | `api/admin-products.ts`, panels | UI done, backend calls return mock |
| Dashboard — Orders admin | Dashboard | ⏳ Partial | `api/admin-orders.ts`, panels | UI done, backend calls return mock |
| Dashboard — Categories admin | Dashboard | ⏳ Partial | panels | UI done |
| Dashboard — Content/Pages | Dashboard | ⏳ Partial | panels, visual editors | UI mostly done |
| Dashboard — Campaigns | Dashboard | ⏳ Partial | panels | Return mock |
| Dashboard — Promotions | Dashboard | ⏳ Partial | panels | Return mock |
| Dashboard — Customers | Dashboard | ⏳ Partial | page | UI shell |
| Dashboard — Inventory | Dashboard | ⏳ Partial | page | UI shell |
| Dashboard — Audit Logs | Dashboard | ⏳ Partial | page | UI shell |
| Dashboard — Global Config | Dashboard | ⏳ Partial | page | UI shell |
| Dashboard — Permissions | Dashboard | ❌ Stub | `auth/permissions.ts` | All return true, chưa implement |
| Client — Product browsing | Client | ✅ Done | routes, components, mock data | Includes categories, search |
| Client — Cart | Client | ✅ Done | `cart-store.ts`, Cart page | Zustand persist localStorage |
| Client — Checkout | Client | ✅ Done | Checkout page | UI + flow |
| Client — Orders | Client | ✅ Done | My Orders + Order Detail | UI + mock data |
| Client — Reviews | Client | ✅ Done | Review components | UI + mock data |
| Client — Blog | Client | ✅ Done | Blog page + post | UI + mock data |
| Client — Auth UI | Client | ✅ Done | Login/Register pages | UI |
| Seed Data (58 cat + 80 products) | Server | ✅ Done | `prisma/seed.ts` | 100% Unsplash ảnh thật, đúng chủ đề |
| Seed validation tests | Server | ✅ Done | `prisma/seed.spec.ts` | 21 tests, all pass |
| Dashboard — Products & Categories merge | Dashboard | ✅ Done | `admin-routes.tsx` | Sản phẩm là collapsible parent |
| TODO.md | Root | ✅ Done | `TODO.md` | Full project task list |
| Client — Real API integration | Client | ✅ Done | `lib/products.ts`, `lib/categories.ts`, `lib/api-client.ts`, `lib/data-mapper.ts`, `public-products.controller.ts`, `public-categories.controller.ts` | Public API endpoints, data mapper, thay mock bằng real fetch |
| Discount sync — Dashboard ↔ Server | Dashboard | ✅ Done | `admin-products.ts`, `__tests__/discount-sync.test.ts` | discountPercent ↔ compareAtPrice 2 chiều, 16 tests |
| Client — API integration (components) | Client | ⏳ Partial | components | ShopSidebar, homepage categories vẫn dùng mock — chờ TanStack Query |

---

## Architecture Decisions

| ID | Decision | Status |
|---|---|---|
| ADR-001 | Monorepo không workspace root — 3 dự án độc lập | ✅ |
| ADR-002 | Zustand cho client state, TanStack Query cho server state | ✅ |
| ADR-003 | JWT access + refresh token, bcrypt cost 12 | ✅ |
| ADR-004 | Soft delete cho Product/Category (status=ARCHIVED) | ✅ |
| ADR-005 | Category hierarchy max 3 levels, path + pathIds | ✅ |
| ADR-006 | Swagger tại /api-docs | ✅ |
| ADR-007 | Dual image strategy: Unsplash/Picsum + local path | ✅ |

---

## Feature đang phát triển

*(Cập nhật khi bắt đầu làm feature mới)*

| Feature | Ngày bắt đầu | Module | Trạng thái |
|---|---|---|---|
| Fix seed images → real Unsplash | 2026-07-15 | server/prisma | ✅ |
| Merge sidebar tab | 2026-07-15 | dashboard | ✅ |
| Seed validation tests | 2026-07-15 | server/prisma | ✅ |
| TODO.md creation | 2026-07-15 | root | ✅ |
| Client real API integration | 2026-07-15 | server + client | ✅ |
| Components API migration | 2026-07-15 | client | ⏳ |
| Discount sync | 2026-07-15 | dashboard | ✅ |

---

## Quy trình khi thêm feature mới

1. Search file `docs/dev-log/` + `grep` toàn bộ codebase
2. Tạo file `docs/dev-log/features/<feature-name>.md` (dùng TEMPLATE.md)
3. Cập nhật INDEX.md — thêm dòng vào bảng Feature Status
4. Sau khi code xong: cập nhật status, files chính, ghi chú
