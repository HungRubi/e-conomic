export type OrderRow = Record<string, any>;
export type ListOrdersParams = Record<string, any>;
export type PaymentMethod = string;
export type BulkUpdateOrderStatusBody = { orderIds: string[]; status: string };
export type OrderStatus = string;
export type PaymentStatus = string;
export type OrderStatusHistory = Record<string, any>;
export type UpdateOrderParams = Record<string, any>;
export function listOrders(_params?: any) { return Promise.resolve({ data: [], total: 0 }); }
export function getOrder(_id: string) { return Promise.resolve(null); }
export function updateOrderStatus(_id: string, _status: string) { return Promise.resolve(); }
export async function updateOrder(..._args: any[]): Promise<void> {}
export async function bulkUpdateOrderStatus(..._args: any[]): Promise<any> { return { updated: 0, skipped: 0 }; }
