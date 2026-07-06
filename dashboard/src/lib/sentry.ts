import * as Sentry from '@sentry/react';

/**
 * Khởi tạo Sentry chỉ khi VITE_SENTRY_DSN được cấu hình. Không có DSN → no-op
 * (ErrorBoundary vẫn báo lỗi local). Tracing & replay tắt mặc định để giảm chi phí
 * — bật khi có nhu cầu profiling hoặc reproduce bug ở production.
 */
export function initSentry(): void {
	const dsn = import.meta.env.VITE_SENTRY_DSN;
	if (!dsn) return;

	const environment = import.meta.env.VITE_SENTRY_ENV ?? import.meta.env.MODE;
	const release = import.meta.env.VITE_APP_VERSION;
	const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '0');

	Sentry.init({
		dsn,
		environment,
		release,
		integrations: [Sentry.browserTracingIntegration()],
		tracesSampleRate: Number.isFinite(tracesSampleRate) ? tracesSampleRate : 0,
		// PII safe-guards: tắt mặc định, người dùng chủ động bật khi cần debug.
		sendDefaultPii: false,
		ignoreErrors: ['ResizeObserver loop limit exceeded', 'Network request failed'],
	});
}

export function reportError(error: unknown, context?: Record<string, unknown>): void {
	if (!import.meta.env.VITE_SENTRY_DSN) {
		console.error('[reportError]', error, context);
		return;
	}
	Sentry.captureException(error, context ? { extra: context } : undefined);
}
