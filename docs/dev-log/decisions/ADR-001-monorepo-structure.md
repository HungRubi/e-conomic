# ADR-001: Monorepo Structure

## Context
Dự án gồm 3 phần: storefront (Next.js), admin dashboard (Vite React), API server (NestJS).

## Decision
**Không dùng workspace root.** Mỗi dự án độc lập, có `package.json`, `node_modules`, `tsconfig` riêng. Chia sẻ qua `docs/` và conventions, không qua package.

## Rationale
- Đơn giản hơn cho dev ban đầu
- Mỗi project có thể deploy độc lập
- Tránh dependency hell khi 3 stack khác nhau

## Status
✅ Accepted
