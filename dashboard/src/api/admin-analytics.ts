export type AnalyticsRange = '7d' | '30d' | '90d' | '12m';

export type AnalyticsKpi = {
	label: string;
	value: number | string;
	change?: number;
	tone?: string;
	trend?: 'up' | 'down' | 'flat';
	changePct?: number | null;
};

export interface AnalyticsTrendPoint {
	bucket: string;
	netRevenue: number;
	grossRevenue: number;
}

export interface AnalyticsPaymentHealth {
	fulfillmentRate: number;
	cancellationRate: number;
	refundRate: number;
	pendingPaymentOrders: number;
}

export interface AnalyticsTopProduct {
	productId: string;
	name: string;
	image: string | null;
	soldQuantity: number;
	revenueVnd: number;
	revenueShare: number;
}

export interface AnalyticsHourlyPoint {
	hour: number;
	orders: number;
}

export interface AnalyticsResponse {
	meta: {
		granularity: 'day' | 'month';
		fromDate: string;
		toDate: string;
	};
	trend: AnalyticsTrendPoint[];
	paymentHealth: AnalyticsPaymentHealth;
	topProducts: AnalyticsTopProduct[];
	hourlyPattern: AnalyticsHourlyPoint[];
}

export function getAnalytics(_params?: any): Promise<AnalyticsResponse> {
	// Mock data — replace with real API when server endpoint exists
	return Promise.resolve({
		meta: { granularity: 'day', fromDate: '2026-06-09', toDate: '2026-07-09' },
		trend: [],
		paymentHealth: { fulfillmentRate: 0, cancellationRate: 0, refundRate: 0, pendingPaymentOrders: 0 },
		topProducts: [],
		hourlyPattern: [],
	});
}
