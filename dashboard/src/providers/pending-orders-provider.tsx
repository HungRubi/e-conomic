import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { listOrders, type OrderRow } from '@/api/admin-orders';
import { useAuth } from '@/auth/auth-context';
import { hasPermission } from '@/auth/permissions';

const PENDING_LIMIT = 50;
const POLL_MS = 60_000;

type PendingOrdersState = {
	count: number;
	items: OrderRow[];
	isFetching: boolean;
};

const PendingOrdersContext = React.createContext<PendingOrdersState>({ count: 0, items: [], isFetching: false });

/**
 * Sprint 6: poll orders status=PENDING mỗi 60s và phát toast khi có đơn mới
 * (so sánh tập id với lần fetch trước). Sidebar + NotificationBell cùng dùng context này
 * để khỏi gọi API trùng nhau.
 */
export function PendingOrdersProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const enabled = hasPermission(user?.role, 'orders.read');
	const previousIdsRef = React.useRef<Set<string> | null>(null);

	const query = useQuery({
		queryKey: ['pending-orders-watch'],
		queryFn: () =>
			listOrders({ status: 'PENDING', limit: PENDING_LIMIT, page: 1, sortBy: 'createdAt', order: 'desc' }),
		refetchInterval: POLL_MS,
		staleTime: POLL_MS / 2,
		enabled,
	});

	const items = query.data?.items ?? [];

	React.useEffect(() => {
		if (!enabled || !query.data) return;
		const currentIds = new Set(items.map(o => o.id));
		const previous = previousIdsRef.current;
		if (previous) {
			const newOrders = items.filter(o => !previous.has(o.id));
			if (newOrders.length === 1) {
				const order = newOrders[0];
				toast.info(`Đơn mới ${order.orderNumber}`, {
					description: `${order.customerName} · ${formatVnd(order.totalVnd)}`,
				});
			} else if (newOrders.length > 1) {
				toast.info(`${newOrders.length} đơn mới đang chờ xử lý`);
			}
		}
		previousIdsRef.current = currentIds;
	}, [enabled, items, query.data]);

	const value = React.useMemo<PendingOrdersState>(
		() => ({ count: query.data?.total ?? 0, items, isFetching: query.isFetching }),
		[query.data?.total, items, query.isFetching]
	);

	return <PendingOrdersContext.Provider value={value}>{children}</PendingOrdersContext.Provider>;
}

function formatVnd(value: number): string {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
		value
	);
}

export function usePendingOrders(): PendingOrdersState {
	return React.useContext(PendingOrdersContext);
}
