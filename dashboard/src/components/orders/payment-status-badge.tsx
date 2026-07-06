import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/api/admin-orders';
import { PAYMENT_STATUS_BADGE } from '@/lib/status-styles';

type PaymentStatusBadgeProps = {
	status: PaymentStatus;
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
	PENDING: 'Chờ thanh toán',
	AWAITING_CONFIRMATION: 'Chờ xác nhận CK',
	PAID: 'đã thanh toán',
	FAILED: 'Thất bại',
	REFUNDED: 'đã hoàn tiền',
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
	return <Badge variant={PAYMENT_STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>;
}
