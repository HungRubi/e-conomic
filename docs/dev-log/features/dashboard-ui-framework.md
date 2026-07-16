# Feature: Admin Dashboard UI Framework

## Metadata
- **Ngày bắt đầu:** 2026-07 (ước lượng)
- **Ngày hoàn thành:** ✅ Done (UI), ⏳ Partial (API integration)
- **Module(s):** `dashboard/`
- **Trạng thái:** ✅ UI Done, 🔌 Backend Integration In Progress

## Mô tả
Admin panel với sidebar navigation, routing, auth context, shadcn/ui components, dark mode.

## Các file ảnh hưởng
```
dashboard/src/App.tsx
dashboard/src/admin-routes.tsx
dashboard/src/components/admin-layout.tsx
dashboard/src/components/app-sidebar.tsx
dashboard/src/auth/
dashboard/src/components/ui/ (shadcn components)
dashboard/src/api/ (API modules — nhiều cái còn mock)
```

## Routes
27 routes — overview, products, orders, customers, users, inventory, content (pages/articles/feedbacks/inquiries), campaigns, promotions, settings, audit logs.

## Quyết định kiến trúc
- Vite + React 19 + TypeScript 6
- shadcn/ui + Radix primitives
- react-router-dom v7 for routing
- Zustand + TanStack Query (giống client)
- Lazy loading + error boundaries cho mỗi page

## API Status
- ✅ Admin products, categories, materials, articles, static pages, users, global config
- ⏳ Mock pending backend: orders, campaigns, promotions, inventory, customers, feedbacks, inquiries, audit logs
