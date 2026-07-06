/**
 * Ảnh tĩnh do API phục vụ tại `/upload/...` (ngoài tiền tố `/api`).
 * Dev: Vite proxy `/upload` → server.
 */
export function publicAssetUrl(path: string): string {
	if (!path) return '';
	if (/^https?:\/\//i.test(path)) return path;

	const rawBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';
	const origin = rawBase.replace(/\/api$/, '');

	if (path.startsWith('/upload')) {
		if (origin) return `${origin}${path}`;
		return path;
	}

	if (path.startsWith('/images')) {
		const web = import.meta.env.VITE_PUBLIC_WEBSITE_URL?.replace(/\/$/, '') ?? '';
		// Đồng bộ trải nghiệm dev: nếu chưa cấu hình website URL, mặc định trỏ về Next dev server.
		const fallback = 'http://localhost:3000';
		return `${web || fallback}${path}`;
	}

	return path;
}
