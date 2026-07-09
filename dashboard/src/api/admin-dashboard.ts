export type DashboardRange = '7d' | '30d' | '90d' | '12m';

export interface DashboardKpi {
  current: number;
  previous: number;
  changePct?: number;
  trend: 'up' | 'down' | 'flat';
}

export interface OrderStatusItem {
  status: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodItem {
  status: string;
  count: number;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  totalVnd: number;
  itemsSummary: string;
}

export interface CatalogSummary {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  totalArticles: number;
  publishedArticles: number;
  activePromotions: number;
}

export interface DashboardOverviewResponse {
  kpis: {
    revenue: DashboardKpi;
    orders: DashboardKpi;
    newCustomers: DashboardKpi;
    averageOrderValue: DashboardKpi;
  };
  statusBreakdown: OrderStatusItem[];
  paymentMethodBreakdown: PaymentMethodItem[];
  recentOrders: RecentOrderItem[];
  catalog: CatalogSummary;
  meta: {
    fromDate: string;
    toDate: string;
  };
}

const kpi = (): DashboardKpi => ({ current: 0, previous: 0, changePct: undefined, trend: 'flat' });
const overview: DashboardOverviewResponse = {
  kpis: { revenue: kpi(), orders: kpi(), newCustomers: kpi(), averageOrderValue: kpi() },
  statusBreakdown: [],
  paymentMethodBreakdown: [],
  recentOrders: [],
  catalog: { totalProducts: 0, activeProducts: 0, totalCategories: 0, totalArticles: 0, publishedArticles: 0, activePromotions: 0 },
  meta: { fromDate: '2026-06-09', toDate: '2026-07-09' },
};

export function getDashboardOverview(_params?: any): Promise<DashboardOverviewResponse> {
  return Promise.resolve(overview);
}
