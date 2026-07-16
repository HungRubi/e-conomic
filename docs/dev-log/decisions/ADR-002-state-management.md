# ADR-002: State Management

## Context
Cần quản lý cả client state (UI toggles, cart) và server state (API data).

## Decision
- **Client state:** Zustand (persist middleware cho cart)
- **Server state:** TanStack Query (React Query)
- **Form state:** React hook form + class-validator (server)

## Rationale
- Zustand nhẹ, không boilerplate, persist sẵn
- TanStack Query handle caching, refetch, loading/error states
- Phân tách rõ ràng UI state vs server state

## Status
✅ Accepted
