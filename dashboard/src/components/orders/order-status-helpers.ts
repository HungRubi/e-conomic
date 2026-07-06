import type { OrderStatus, PaymentStatus } from '@/api/admin-orders';

/**
 * Quy tắc chuyển trạng thái — đồng bộ với server (`OrdersService.validateStatusTransition`).
 * Khi server đổi quy tắc thì cũng cập nhật ở đây để UI ẩn nút không hợp lệ.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đã giao vận',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Chờ thanh toán',
  AWAITING_CONFIRMATION: 'Chờ xác nhận CK',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Đã hoàn tiền',
};

/** Thứ tự bước trên timeline; nhánh CANCELLED/REFUNDED hiển thị riêng. */
export const ORDER_PROGRESS_STEPS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
];

export function isOrderTerminal(status: OrderStatus): boolean {
  return status === 'CANCELLED' || status === 'REFUNDED';
}

export function canTransitionTo(current: OrderStatus, next: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

export function nextAllowedStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[current] ?? [];
}

/**
 * Bước tiếp theo "tiến lên" trong vòng đời đơn (không tính hủy/hoàn).
 * Dùng cho nút primary trên detail page (Xác nhận, Bắt đầu xử lý, ...).
 */
export function primaryNextStatus(current: OrderStatus): OrderStatus | null {
  const allowed = nextAllowedStatuses(current);
  const forwardOrder: OrderStatus[] = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  for (const s of forwardOrder) {
    if (allowed.includes(s)) return s;
  }
  return null;
}

export function primaryActionLabel(target: OrderStatus): string {
  switch (target) {
    case 'CONFIRMED':
      return 'Xác nhận đơn';
    case 'PROCESSING':
      return 'Bắt đầu xử lý';
    case 'SHIPPED':
      return 'Đánh dấu đã giao vận';
    case 'DELIVERED':
      return 'Đánh dấu đã giao';
    case 'REFUNDED':
      return 'Đánh dấu đã hoàn tiền';
    default:
      return ORDER_STATUS_LABEL[target];
  }
}

/** Số bước đã qua (1-indexed) trong vòng đời chính. -1 nếu trạng thái terminal. */
export function progressIndex(status: OrderStatus): number {
  if (isOrderTerminal(status)) return -1;
  return ORDER_PROGRESS_STEPS.indexOf(status);
}
