export type DashboardRange = '7d' | '30d' | '90d' | '12m';
export type DashboardKpi = { current: number; previous: number; changePercent: number };
export type DashboardOverviewResponse = Record<string, any>;
export type DashboardResponse = Record<string, any>;

const kpi = (): DashboardKpi => ({ current: 0, previous: 0, changePercent: 0 });
const overview = {
	kpis: {
		revenue: kpi(),
		orders: kpi(),
		newCustomers: kpi(),
		averageOrderValue: kpi(),
	},
	analytics: { views: 0, sessions: 0, bounceRate: 0, topProducts: [], hourlyPattern: [] },
	recentOrders: [],
	topProducts: [],
};

export function getDashboardStats(_params?: any): Promise<any> {
	return Promise.resolve({ revenue: 0, orders: 0, customers: 0, products: 0, revenueChange: 0, ordersChange: 0, customersChange: 0, revenueByDate: [] });
}

export function getDashboardOverview(_params?: any): Promise<DashboardOverviewResponse> {
	return Promise.resolve(overview);
}
