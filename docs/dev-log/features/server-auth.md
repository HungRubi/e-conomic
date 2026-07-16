# Feature: Server Auth (JWT + RBAC)

## Metadata
- **Ngày bắt đầu:** 2026-07 (ước lượng)
- **Ngày hoàn thành:** ✅ Done
- **Module(s):** `server/`
- **Trạng thái:** ✅ Done

## Mô tả
Authentication & Authorization server — register, login, JWT access/refresh token, forgot/reset password, admin guard.

## Các file ảnh hưởng
```
server/src/auth/
server/src/users/
server/src/common/guards/admin.guard.ts
server/src/common/decorators/match.decorator.ts
server/src/prisma/
```

## Quyết định kiến trúc
- **Vấn đề:** Cần auth cho cả storefront và dashboard
- **Giải pháp:** JWT access token (7d) + refresh token (30d), bcrypt cost 12
- **Lý do:** Stateless, phù hợp REST API, built-in NestJS Passport support

## API Endpoints
| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | /api/auth/register | No | Đăng ký |
| POST | /api/auth/login | No | Đăng nhập |
| GET | /api/auth/me | JWT | Thông tin user hiện tại |
| PATCH | /api/auth/profile | JWT | Cập nhật profile |
| PATCH | /api/auth/password | JWT | Đổi mật khẩu |
| POST | /api/auth/refresh | No | Refresh token |
| POST | /api/auth/forgot-password | No | Quên mật khẩu |
| POST | /api/auth/reset-password | No | Đặt lại mật khẩu |
| GET/POST/PATCH/DELETE | /api/users/* | JWT+Admin | CRUD users |
