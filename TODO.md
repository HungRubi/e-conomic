# 📋 TODO — e-conomic

> Danh sách công việc toàn dự án. Cập nhật khi có thay đổi.

---

## 🔴 High Priority

### Server — API

- [x] **Public endpoints** — Tạo `/api/products` và `/api/categories` public (không cần auth) cho client
- [x] **Banner API** — BannerModule (CRUD + public endpoints + seed 5 banners)
- [x] **Dashboard banners** — List + detail/edit (xịn như product-detail)
### Client — Real API Integration

- [x] **Product list** — Fetch từ server thay vì mock data
- [ ] **Category list** — Fetch từ server thay vì mock data (components chưa migrate hết)
- [ ] **Cart sync** — API cho cart (hiện chỉ localStorage client)
- [ ] **Order history** — Fetch từ server API
- [ ] **Auth** — Kết nối client auth với server JWT endpoints

### Client — Banner Integration

- [x] **Banners lib** — `lib/banners.ts` fetch từ API public
- [x] **Hero slider** — Thay hardcode slides bằng HERO banners từ API
- [x] **Ad banners** — Thay mock ads bằng BANNER banners từ API

- [ ] **Product images** — Tạo upload server/endpoint cho ảnh sản phẩm (hiện seed dùng Unsplash URL)
- [ ] **ProductVariant CRUD** — API quản lý variants (size/color/price riêng)
- [ ] **Order API** — CRUD đơn hàng (hiện chưa có endpoint nào)
- [ ] **Search** — Full-text search cho products (dùng PostgreSQL tsvector hoặc LIKE)

### Client — Real API Integration

- [x] **Product list** — Fetch từ server thay vì mock data
- [ ] **Category list** — Fetch từ server thay vì mock data (components chưa migrate hết)
- [ ] **Cart sync** — API cho cart (hiện chỉ localStorage client)
- [ ] **Order history** — Fetch từ server API
- [ ] **Auth** — Kết nối client auth với server JWT endpoints

### Dashboard — Backend Integration

- [ ] **Orders admin** — Connect real API, bỏ mock
- [ ] **Campaigns** — Connect real API
- [ ] **Promotions** — Connect real API
- [ ] **Inventory** — Connect real API
- [ ] **Customers** — Connect real API
- [ ] **Permissions** — Implement RBAC thực tế (hiện đều return true)

---

## 🟡 Medium Priority

### Server

- [ ] **Pagination + sorting** — Kiểm tra đã đủ ở products list
- [ ] **Rate limiting** — Thêm rate limit cho auth endpoints
- [ ] **Validation messages** — Tiếng Việt cho class-validator messages
- [ ] **Swagger tags** — Cập nhật đầy đủ Swagger cho tất cả endpoints
- [ ] **E2E tests** — Viết test cho các API endpoints
- [ ] **Docker Compose** — Dockerize server + postgres cho dev

### Client

- [ ] **SEO** — Thêm metadata, sitemap, structured data
- [ ] **Image optimization** — next/image với remote patterns
- [ ] **Error boundaries** — Xử lý error state ở mỗi page
- [ ] **Loading skeletons** — Thêm loading state cho product list, detail
- [ ] **PWA** — Thêm service worker, offline support

### Dashboard

- [ ] **Data export** — Export products/orders ra CSV/Excel
- [ ] **Bulk actions** — Bulk delete, bulk publish products
- [ ] **Activity log** — Kết nối audit log với server
- [ ] **Dashboard stats** — Real data từ server (hiện mock)

---

## 🟢 Low Priority / Future

### Features

- [ ] **AI Chat** — Chat hỗ trợ khách hàng (schema đã có trong docs)
- [ ] **Recommendation engine** — Gợi ý sản phẩm (ProductEmbedding model)
- [ ] **Size recommendation** — Gợi ý size (SizeChart model)
- [ ] **Multi-warehouse** — Quản lý nhiều kho
- [ ] **Multi-currency** — Hỗ trợ nhiều loại tiền tệ
- [ ] **Reviews API** — API cho reviews từ khách hàng

### Technical Debt

- [ ] **Upgrade Prisma** — 5.22 → 7.x (major update, cần migrate guide)
- [ ] **Monorepo tool** — Cân nhắc dùng Turborepo/Nx khi dự án lớn
- [ ] **Storybook** — Component library cho dashboard UI
- [ ] **Cypress/Playwright** — E2E tests
- [ ] **CI/CD** — GitHub Actions tự động test + deploy
- [ ] **Sentry** — Error tracking (đã import trong dashboard, cần config)

---

## ✅ Done

- [x] Server auth — JWT login/register, forgot/reset password
- [x] Server catalog — Products CRUD + Categories CRUD
- [x] Dashboard UI framework — shadcn/ui, routing, sidebar
- [x] Seed data — 58 categories + 80 products với Unsplash ảnh
- [x] Seed validation tests — 21 tests (category counts, hierarchy, images)
- [x] Sidebar merge — Sản phẩm + Danh mục trong 1 tab cha
- [x] Client storefront UI — Product browsing, cart, checkout, orders
- [x] Dev log — `docs/dev-log/` cho quá trình phát triển
