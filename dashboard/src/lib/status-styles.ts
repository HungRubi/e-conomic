import type { VariantProps } from 'class-variance-authority';

import { badgeVariants } from '@/components/ui/badge';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export type CommonContentStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

/**
 * Mapping nhất quán cho các trạng thái nội dung (sản phẩm, danh mục, bài viết, trang tĩnh).
 *   ACTIVE  → success (xanh lá)  – đang phát hành
 *   DRAFT   → warning (vàng)     – chưa phát hành
 *   ARCHIVED→ muted   (xám)      – đã lưu trữ
 */
export const CONTENT_STATUS_BADGE: Record<CommonContentStatus, BadgeVariant> = {
	ACTIVE: 'success',
	DRAFT: 'warning',
	ARCHIVED: 'muted',
};

export type UserRoleKey = 'ADMIN' | 'STAFF' | 'CUSTOMER';

/**
 * Vai trò tài khoản: nổi bật ADMIN, trung tính cho khách hàng.
 */
export const USER_ROLE_BADGE: Record<UserRoleKey, BadgeVariant> = {
	ADMIN: 'destructive',
	STAFF: 'info',
	CUSTOMER: 'muted',
};

export type OrderStatusKey =
	'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

/**
 * Trạng thái đơn hàng — màu sắc phản ánh hướng trong vòng đời:
 *   PENDING/CONFIRMED → warning/info (chờ và xác nhận)
 *   PROCESSING/SHIPPED → info (đang vận hành)
 *   DELIVERED         → success (hoàn tất tích cực)
 *   CANCELLED         → destructive (đã hủy)
 *   REFUNDED          → muted (kết thúc, đã hoàn tiền)
 */
export const ORDER_STATUS_BADGE: Record<OrderStatusKey, BadgeVariant> = {
	PENDING: 'warning',
	CONFIRMED: 'info',
	PROCESSING: 'info',
	SHIPPED: 'info',
	DELIVERED: 'success',
	CANCELLED: 'destructive',
	REFUNDED: 'muted',
};

export type PaymentStatusKey = 'PENDING' | 'AWAITING_CONFIRMATION' | 'PAID' | 'FAILED' | 'REFUNDED';

/**
 * Trạng thái thanh toán:
 *   PENDING                 → warning (chờ thanh toán)
 *   AWAITING_CONFIRMATION   → info (chờ admin xác nhận chuyển khoản)
 *   PAID                    → success (đã thanh toán)
 *   FAILED                  → destructive (lỗi)
 *   REFUNDED                → muted (đã hoàn tiền)
 */
export const PAYMENT_STATUS_BADGE: Record<PaymentStatusKey, BadgeVariant> = {
	PENDING: 'warning',
	AWAITING_CONFIRMATION: 'info',
	PAID: 'success',
	FAILED: 'destructive',
	REFUNDED: 'muted',
};
