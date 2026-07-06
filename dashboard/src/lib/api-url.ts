/**
 * Nest dùng `setGlobalPrefix('api')` → mọi path kiểu `/auth/login`, `/admin/customers` thành `/api/auth/login`, ...
 * - Không set VITE_API_URL → `/api` + path (Vite proxy tới server, không rewrite).
 * - `VITE_API_URL=http://localhost:4000` → `http://localhost:4000/api` + path.
 */
export function apiUrl(path: string): string {
	const rawBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
	const p = path.startsWith('/') ? path : `/${path}`;
	if (!rawBase) return `/api${p}`;
	const base = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
	return `${base}${p}`;
}
