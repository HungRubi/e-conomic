# ADR-004: Soft Delete

## Context
Product và Category cần khả năng khôi phục khi xóa nhầm.

## Decision
Dùng `status = ARCHIVED` thay vì `DELETE FROM` cho Product và Category.

## Rationale
- Có thể unarchive
- Giữ referential integrity
- Query filter `status != ARCHIVED` cho listing

## Status
✅ Accepted
