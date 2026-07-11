export type OrderRow = Record<string, any>;
export type ListOrdersParams = Record<string, any>;
export type PaymentMethod = string;
export type BulkUpdateOrderStatusBody = { orderIds?: string[]; ids?: string[]; status: string };
export type OrderStatus = string;
export type PaymentStatus = string;
export type OrderStatusHistory = Record<string, any>;
export type UpdateOrderParams = Record<string, any>;
export type OrderListResponse = {
	data: OrderRow[];
	items: OrderRow[];
	total: number;
	page: number;
	totalPages: number;
};

const emptyList: OrderListResponse = { data: [], items: [], total: 0, page: 0, totalPages: 1 };
export function listOrders(_params?: any): Promise<OrderListResponse> {
	return Promise.resolve(emptyList);
}
export function getOrder(_id: string): Promise<OrderRow | null> {
	return Promise.resolve(null);
}
export function updateOrderStatus(_id: string, _status: string): Promise<OrderRow> {
	return Promise.resolve({ id: _id, status: _status });
}
export async function updateOrder(id: string, data?: any): Promise<OrderRow> {
	return { id, ...data };
}
export async function bulkUpdateOrderStatus(body: BulkUpdateOrderStatusBody): Promise<any> {
	return { updated: body.orderIds?.length ?? body.ids?.length ?? 0, skipped: 0 };
}
