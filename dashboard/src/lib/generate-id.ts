/**
 * Generate a unique ID string.
 * Uses crypto.randomUUID() when available (secure context / HTTPS),
 * falls back to a random string for non-secure contexts (HTTP in production).
 */
export function generateId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	// Fallback: timestamp + random chars — not a real UUID but unique enough for UI keys
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
}
