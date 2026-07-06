export type AnalyticsResponse = Record<string, any>;
export function getAnalytics(_params?: any) { return Promise.resolve({ views: 0, sessions: 0, bounceRate: 0 }); }
