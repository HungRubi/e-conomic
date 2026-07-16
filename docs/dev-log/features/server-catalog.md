# Feature: Server Catalog (Products + Categories)

## Metadata
- **Ngày bắt đầu:** 2026-07 (ước lượng)
- **Ngày hoàn thành:** ✅ Done
- **Module(s):** `server/`
- **Trạng thái:** ✅ Done

## Các file ảnh hưởng
```
server/src/catalog/
server/prisma/schema.prisma (Product, ProductVariant, ProductCategory, CategoryAttribute, ProductCategoryMap)
```

## API Endpoints
### Products
| Method | Path | Mô tả |
|---|---|---|
| GET | /api/admin/products | List (paginated, search, filter) |
| GET | /api/admin/products/:id | Detail |
| POST | /api/admin/products | Create |
| PATCH | /api/admin/products/:id | Update |
| PATCH | /api/admin/products/:id/publish | Publish |
| PATCH | /api/admin/products/:id/archive | Archive (soft delete) |
| DELETE | /api/admin/products/:id | Delete |

### Categories
| Method | Path | Mô tả |
|---|---|---|
| GET | /api/admin/product-categories | List (tree query) |
| GET | /api/admin/product-categories/all | All flat |
| GET | /api/admin/product-categories/tree | Full tree |
| GET | /api/admin/product-categories/:id | Detail |
| POST | /api/admin/product-categories | Create |
| POST | /api/admin/product-categories/:id/attributes | Thêm attribute |
| PATCH | /api/admin/product-categories/:id | Update |
| PATCH | /api/admin/product-categories/:id/publish | Publish |
| PATCH | /api/admin/product-categories/:id/archive | Archive |
| DELETE | /api/admin/product-categories/:id | Delete |

## Database
- Product: SKU unique, slug unique, Decimal cho price, JSON cho images/attributes/metadata
- ProductVariant: link tới Product, riêng SKU/price/stock
- ProductCategory: self-referencing parent-child, max 3 levels, path + pathIds for tree traversal
- ProductCategoryMap: many-to-many join
