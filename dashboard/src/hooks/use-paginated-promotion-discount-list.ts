import * as React from 'react';
import {
	type AdminPromotionDiscountRow,
	type ListPromotionDiscountsParams,
} from '@/api/admin-promotion-discounts';
import { AuthApiError } from '@/auth/auth-api';

export type PromotionDiscountListSortKey = 'createdAt' | 'title' | 'code' | 'sortOrder';

type FetchFn = (params: ListPromotionDiscountsParams) => Promise<{
	items: AdminPromotionDiscountRow[];
	total: number;
	limit: number;
	offset: number;
	hasMore: boolean;
}>;

export function usePaginatedPromotionDiscountList(
	fetchFn: FetchFn,
	q: string,
	sortBy: PromotionDiscountListSortKey,
	sortOrder: 'asc' | 'desc',
	pageSize: number,
	statusFilter: 'all' | AdminPromotionDiscountRow['status']
) {
	const [rows, setRows] = React.useState<AdminPromotionDiscountRow[]>([]);
	const [total, setTotal] = React.useState(0);
	const [page, setPage] = React.useState(0);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const load = React.useCallback(
		async (opts?: { page?: number; silent?: boolean }) => {
			const targetPage = opts?.page ?? page;
			if (!opts?.silent) setLoading(true);
			setError(null);
			try {
				const res = await fetchFn({
					q,
					sortBy,
					sortOrder,
					limit: pageSize,
					offset: targetPage * pageSize,
					status: statusFilter,
				});
				setRows(res.items);
				setTotal(res.total);
				if (opts?.page !== undefined) setPage(opts.page);
			} catch (e) {
				const message = e instanceof AuthApiError ? e.message : 'Tải dữ liệu thất bại';
				setError(message);
			} finally {
				if (!opts?.silent) setLoading(false);
			}
		},
		[fetchFn, q, sortBy, sortOrder, pageSize, statusFilter, page]
	);

	React.useEffect(() => {
		setPage(0);
	}, [q, sortBy, sortOrder, pageSize, statusFilter]);

	React.useEffect(() => {
		void load();
	}, [load]);

	const upsertRow = React.useCallback(
		(updated: AdminPromotionDiscountRow, opts?: { prependOnInsert?: boolean }) => {
			setRows(prev => {
				const idx = prev.findIndex(r => r.id === updated.id);
				if (idx >= 0) {
					const next = [...prev];
					next[idx] = updated;
					return next;
				}
				if (opts?.prependOnInsert) return [updated, ...prev];
				return prev;
			});
		},
		[]
	);

	const removeRow = React.useCallback((id: string) => {
		setRows(prev => prev.filter(r => r.id !== id));
		setTotal(prev => Math.max(0, prev - 1));
	}, []);

	return {
		rows,
		total,
		loading,
		error,
		page,
		setPage,
		refetch: load,
		upsertRow,
		removeRow,
	};
}
