# Feature: Discount Sync — Dashboard ↔ Server

## Metadata
- **Ngày bắt đầu:** 2026-07-15
- **Ngày hoàn thành:** 2026-07-15
- **Module(s):** `dashboard/`
- **Trạng thái:** ✅ Done

## Mô tả
Dashboard gửi `discountPercent` nhưng server DTO chỉ nhận `compareAtPrice`. 
Cần đồng bộ 2 chiều:
- Server → Dashboard: `compareAtPrice` → `discountPercent` (hiển thị)
- Dashboard → Server: `discountPercent` → `compareAtPrice` (lưu)

## Vấn đề
- `normalizeProduct()` không tính `discountPercent` từ `compareAtPrice` → dashboard hiển thị 0%
- `toServerProductBody()` không map `discountPercent` → `compareAtPrice` → server không nhận được discount
- `toServerProductBody()` thiếu nhiều field: `shortDescription`, `type`, `seoTitle`, `seoDescription`, `seoKeywords`, `weight`, `width`, `height`, `length`

## Các file ảnh hưởng
```
dashboard/src/api/admin-products.ts              — normalizeProduct() + toServerProductBody()
dashboard/src/api/__tests__/discount-sync.test.ts — 16 tests cho discount round-trip
docs/dev-log/features/discount-sync.md           — file này
```

## Logic đồng bộ discount
```
normalizeProduct():
  compareAtPrice → discountPercent = round((1 - price / compareAtPrice) * 100)

toServerProductBody():
  discountPercent → compareAtPrice = round(price / (1 - discountPercent/100))
  discountPercent=0 → compareAtPrice = null (xóa giảm giá)
  discountPercent ưu tiên hơn compareAtPrice nếu cả 2 được gửi
```

## Tests
16 tests — tất cả pass:
- `toServerProductBody`: discountPercent → compareAtPrice, ưu tiên, nullify
- `normalizeProduct`: compareAtPrice → discountPercent, edge cases
- Round-trip: discountPercent → compareAtPrice → discountPercent (sai số ≤ 1%)
- Field integrity: seoTitle, seoDescription, seoKeywords, isFeatured, sortOrder

Chạy: `cd dashboard && node --experimental-strip-types src/api/__tests__/discount-sync.test.ts`
