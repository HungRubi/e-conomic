import { apiUrl } from './api-url';
import { readStoredAccessToken, refreshSession, clearSession } from '@/auth/auth-api';

function getAuthHeaders(): Record<string, string> {
	const token = readStoredAccessToken();
	const headers: Record<string, string> = {};
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

/**
 * Core fetch wrapper.
 * - Attaches Bearer token automatically
 * - On 401, tries token refresh once then retries
 * - Returns typed JSON or throws AuthApiError
 */
export async function apiFetch<T = any>(
	url: string,
	opts?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }
): Promise<T> {
	const { skipAuth, skipRefresh, ...fetchOpts } = opts ?? {};
	const headers: Record<string, string> = {
		...(skipAuth ? {} : getAuthHeaders()),
		...(fetchOpts.headers as Record<string, string>),
	};
	// Only set Content-Type if body is not FormData
	if (!headers['Content-Type'] && !(fetchOpts.body instanceof FormData)) {
		headers['Content-Type'] = 'application/json';
	}

	let res = await fetch(apiUrl(url), { ...fetchOpts, headers });

	// 401 → try refresh once
	if (res.status === 401 && !skipAuth && !skipRefresh) {
		const newToken = await refreshSession();
		if (newToken) {
			headers['Authorization'] = `Bearer ${newToken}`;
			res = await fetch(apiUrl(url), { ...fetchOpts, headers });
		} else {
			clearSession();
			window.location.href = '/login';
			throw new Error('Session expired');
		}
	}

	if (!res.ok) {
		let body: any;
		try {
			body = await res.json();
		} catch {
			throw new Error(`HTTP ${res.status}`);
		}
		throw new Error(body.message || body.error || `HTTP ${res.status}`);
	}

	// Handle no-content responses
	const contentType = res.headers.get('content-type');
	if (contentType?.includes('application/json')) {
		return res.json();
	}
	return undefined as T;
}

/**
 * Convenience builder — keeps the same API signature as before.
 * Each method auto-injects auth headers.
 */
export function apiClient() {
	return {
		get: <T = any>(url: string) => apiFetch<T>(url, { method: 'GET' }),

		post: <T = any>(url: string, body?: any) =>
			apiFetch<T>(url, {
				method: 'POST',
				body: body instanceof FormData ? body : JSON.stringify(body),
			}),

		put: <T = any>(url: string, body?: any) =>
			apiFetch<T>(url, {
				method: 'PUT',
				body: body instanceof FormData ? body : JSON.stringify(body),
			}),

		del: <T = any>(url: string) => apiFetch<T>(url, { method: 'DELETE' }),
	};
}

export function setAccessToken(_token: string | null) {
	// Token is managed by auth-api.ts; this is a no-op kept for compat.
}
