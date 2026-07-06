import * as React from 'react';

import type { AdminArticleRow, ArticleListResponse, ListArticlesParams } from '@/api/admin-articles';
import { AuthApiError } from '@/auth/auth-api';

export type ArticleListSortKey = NonNullable<ListArticlesParams['sortBy']>;

export function usePaginatedArticleList(
	listFn: (params: ListArticlesParams) => Promise<ArticleListResponse>,
	searchInput: string,
	sortBy: ArticleListSortKey,
	sortOrder: 'asc' | 'desc',
	pageSize: number,
	status: 'all' | NonNullable<ListArticlesParams['status']> = 'all'
) {
	const deferredSearch = React.useDeferredValue(searchInput.trim());

	const filterKey = React.useMemo(
		() => `${deferredSearch}\0${sortBy}\0${sortOrder}\0${pageSize}\0${status}`,
		[deferredSearch, sortBy, sortOrder, pageSize, status]
	);

	const filterEpochRef = React.useRef(filterKey);
	const [page, setPage] = React.useState(0);
	const pageRef = React.useRef(page);
	pageRef.current = page;

	let pageForRequest = page;
	if (filterEpochRef.current !== filterKey) {
		filterEpochRef.current = filterKey;
		pageForRequest = 0;
	}

	const [rows, setRows] = React.useState<AdminArticleRow[]>([]);
	const [total, setTotal] = React.useState(0);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		let cancelled = false;

		(async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await listFn({
					q: deferredSearch || undefined,
					sortBy,
					sortOrder,
					limit: pageSize,
					offset: pageForRequest * pageSize,
					status,
				});
				if (cancelled) return;
				setRows(res.items);
				setTotal(res.total);
				if (pageForRequest !== pageRef.current) {
					React.startTransition(() => {
						setPage(pageForRequest);
					});
				}
			} catch (e) {
				if (!cancelled) {
					setError(e instanceof AuthApiError ? e.message : 'Không tải được danh sách');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [listFn, deferredSearch, sortBy, sortOrder, pageSize, pageForRequest, status]);

	const refetch = React.useCallback(
		async (opts?: { page?: number; silent?: boolean }) => {
			const targetPage = opts?.page ?? page;
			if (!opts?.silent) setLoading(true);
			setError(null);
			try {
				const res = await listFn({
					q: deferredSearch || undefined,
					sortBy,
					sortOrder,
					limit: pageSize,
					offset: targetPage * pageSize,
					status,
				});
				setRows(res.items);
				setTotal(res.total);
				setPage(targetPage);
			} catch (e) {
				setError(e instanceof AuthApiError ? e.message : 'Không tải được danh sách');
			} finally {
				if (!opts?.silent) setLoading(false);
			}
		},
		[listFn, deferredSearch, sortBy, sortOrder, pageSize, status, page]
	);

	const upsertRow = React.useCallback((row: AdminArticleRow) => {
		setRows(prev => {
			const i = prev.findIndex(r => r.id === row.id);
			if (i === -1) return [row, ...prev];
			const next = [...prev];
			next[i] = row;
			return next;
		});
	}, []);

	const removeRow = React.useCallback((id: string) => {
		setRows(prev => prev.filter(r => r.id !== id));
		setTotal(t => Math.max(0, t - 1));
	}, []);

	return {
		rows,
		total,
		loading,
		error,
		page,
		setPage,
		refetch,
		upsertRow,
		removeRow,
	};
}
