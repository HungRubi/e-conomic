export type DashboardResponse = Record<string, any>;
export function getDashboardStats(_params?: any): Promise<any> {
  return Promise.resolve({ revenue: 0, orders: 0, customers: 0, products: 0, revenueChange: 0, ordersChange: 0, customersChange: 0, revenueByDate: [] });
}
