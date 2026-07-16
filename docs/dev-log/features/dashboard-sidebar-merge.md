# Feature: Gộp Sản phẩm & Danh mục vào 1 tab cha

## Metadata
- **Ngày hoàn thành:** 2026-07-15 ✅
- **Module(s):** `dashboard/src/admin-routes.tsx`
- **Trạng thái:** ✅ Done

## Mô tả
Sidebar dashboard: "Sản phẩm" là collapsible parent với children "Tất cả sản phẩm" và "Danh mục" (giống cấu trúc "Đơn hàng" / "Trang & bài viết").

## Trước
```
Thương mại
├── Sản phẩm        ← flat link
├── Đơn hàng
│   ├── Tất cả đơn
│   └── Chờ xử lý
```

## Sau
```
Thương mại
├── Sản phẩm         ← collapsible
│   ├── Tất cả sản phẩm
│   └── Danh mục
├── Đơn hàng
│   ├── Tất cả đơn
│   └── Chờ xử lý
```

## File ảnh hưởng
- `dashboard/src/admin-routes.tsx` — ADMIN_NAV_SECTIONS, thêm `children` vào item Sản phẩm
