# ADR-005: Category Hierarchy

## Context
Danh mục sản phẩm cần hierarchical tree (có cấp cha-con-cháu) cho navigation.

## Decision
- Self-referencing: `ProductCategory.parentId` → `ProductCategory.id`
- **Max 3 levels** (level field 0,1,2)
- **Path:** `path` (name-based "/category/subcategory") + `pathIds` (UUID-based) for efficient tree query
- **Attributes** riêng per category type

## Rationale
- Nested set phức tạp cho TH này
- Level + path đủ cho tree traversal với max 3 levels
- pathIds cho lookup nhanh hơn string path

## Status
✅ Accepted
