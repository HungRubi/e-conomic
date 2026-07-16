# ADR-003: JWT Authentication

## Context
Cần auth cho cả storefront (user) và dashboard (admin/staff).

## Decision
- **Access token:** JWT, 7 ngày expiry
- **Refresh token:** JWT, 30 ngày expiry (separate secret derived từ JWT_SECRET)
- **Password:** bcrypt cost factor 12
- **Guard:** Passport JWT strategy, AdminGuard kiểm tra role

## Rationale
- Stateless, không cần session store
- Refresh token cho phép renew mà không cần re-login
- bcrypt 12 là mặc định an toàn

## Status
✅ Accepted
