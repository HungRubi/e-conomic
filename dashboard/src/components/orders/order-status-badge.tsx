import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/api/admin-orders';
import { ORDER_STATUS_BADGE } from '@/lib/status-styles';

type OrderStatusBadgeProps = {
	status: OrderStatus;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
	PENDING: 'Chờ xác nhận',
	CONFIRMED: 'đã xác nhận',
	PROCESSING: 'Đang xử lý',
	SHIPPED: 'đã giao vận',
	DELIVERED: 'đã giao',
	CANCELLED: 'đã hủy',
	REFUNDED: 'đã hoàn tiền',
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
	return <Badge variant={ORDER_STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>;
}
