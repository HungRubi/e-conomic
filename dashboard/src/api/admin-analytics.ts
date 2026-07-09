export type AnalyticsRange = '7d' | '30d' | '90d' | '12m';
export type AnalyticsKpi = { label: string; value: number | string; change?: number; tone?: string };
export type AnalyticsResponse = Record<string, any>;
export function getAnalytics(_params?: any): Promise<any> {
	return Promise.resolve({ views: 0, sessions: 0, bounceRate: 0, topProducts: [], hourlyPattern: [] });
}
