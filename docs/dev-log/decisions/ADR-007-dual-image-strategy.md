# ADR-007: Dual Image Strategy

## Context
Cần ảnh cho seed data và production. Không muốn phụ thuộc hoàn toàn vào external service, cũng không muốn mất ảnh khi chưa có upload server.

## Decision
**Dual strategy — mỗi lần seed, mỗi sản phẩm/danh mục random chọn 1 trong 2:**

1. **Remote (online)** — Unsplash cho category, Picsum cho product
   - `https://images.unsplash.com/{id}?w=800&h=800&fit=crop`
   - `https://picsum.photos/seed/{slug}-{i}/800/800`
   - Luôn hoạt động, không cần setup

2. **Local** — Path cục bộ, trỏ đến upload server
   - `/uploads/images/categories/{slug}.jpg`
   - `/uploads/images/products/{slug}.jpg`
   - Nếu có Nginx/Apache serve static files từ thư mục `uploads/`

## Resolution
Quyết định theo `hashCode(slug) % 2 === 0` → remote, ngược lại → local.
Như vậy mỗi lần seed ra cùng kết quả (deterministic).

## Status
✅ Accepted
