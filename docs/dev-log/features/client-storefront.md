# Feature: Client Storefront

## Metadata
- **Ngày bắt đầu:** 2026-07
- **Ngày hoàn thành:** ✅ UI + Mock Data Done, ❌ Real API integration not started
- **Module(s):** `client/`
- **Trạng thái:** ⏳ Mock Complete, 🔴 Real API Pending

## Mô tả
Next.js storefront cho người dùng cuối: xem sản phẩm, giỏ hàng, checkout, đơn hàng, reviews, blog.

## Pages
| Route | Component | Status |
|---|---|---|
| / | Home (category listing) | ✅ |
| /san-pham/[slug] | Product Detail | ✅ |
| /gio-hang | Cart | ✅ |
| /thanh-toan | Checkout | ✅ |
| /don-hang-cua-ban | My Orders | ✅ |
| /don-hang-cua-ban/[id] | Order Detail | ✅ |
| /blog | Blog | ✅ |
| /blog/[slug] | Blog Post | ✅ |
| /dang-nhap | Login | ✅ |
| /dang-ky | Register | ✅ |

## Data Layer
- Zustand stores: `cart-store.ts` (persist), `ui-store.ts`
- Mock data: `lib/products.ts`, `lib/orders.ts`, `lib/reviews.ts`, etc.
- TanStack Query provider set up nhưng chưa dùng cho real API calls

## Notes
- Tất cả data hiện tại là mock, cần tích hợp server API
- Cart persist ở localStorage qua Zustand middleware
