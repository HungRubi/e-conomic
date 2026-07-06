import * as React from 'react';

import type { AdminStaticPageRow, ListStaticPagesParams, StaticPageListResponse } from '@/api/admin-static-pages';
import { AuthApiError } from '@/auth/auth-api';

export type StaticPageListSortKey = NonNullable<ListStaticPagesParams['sortBy']>;

export function usePaginatedStaticPageList(
	listFn: (params: ListStaticPagesParams) => Promise<StaticPageListResponse>,
	searchInput: string,
	slugFilter: string,
	language: string,
	sortBy: StaticPageListSortKey,
	sortOrder: 'asc' | 'desc',
	pageSize: number,
	status: 'all' | NonNullable<ListStaticPagesParams['status']> = 'all'
) {
	const deferredSearch = React.useDeferredValue(searchInput.trim());
	const slugKey = slugFilter.trim();
	const languageKey = language.trim();

	const filterKey = React.useMemo(
		() => `${deferredSearch}\0${slugKey}\0${languageKey}\0${sortBy}\0${sortOrder}\0${pageSize}\0${status}`,
		[deferredSearch, slugKey, languageKey, sortBy, sortOrder, pageSize, status]
	);

	const [pageState, setPageState] = React.useState(() => ({ filterKey, page: 0 }));
	const page = pageState.filterKey === filterKey ? pageState.page : 0;
	const setPage = React.useCallback<React.Dispatch<React.SetStateAction<number>>>(
		nextPage => {
			setPageState(prev => {
				const currentPage = prev.filterKey === filterKey ? prev.page : 0;
				const resolvedPage = typeof nextPage === 'function' ? nextPage(currentPage) : nextPage;
				return { filterKey, page: resolvedPage };
			});
		},
		[filterKey]
	);

	const [rows, setRows] = React.useState<AdminStaticPageRow[]>([]);
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
					slug: slugKey || undefined,
					language: languageKey || undefined,
					sortBy,
					sortOrder,
					limit: pageSize,
					offset: page * pageSize,
					status,
				});
				if (cancelled) return;
				setRows(res.items);
				setTotal(res.total);
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
	}, [listFn, deferredSearch, slugKey, languageKey, sortBy, sortOrder, pageSize, page, status]);

	const refetch = React.useCallback(
		async (opts?: { page?: number; silent?: boolean }) => {
			const targetPage = opts?.page ?? page;
			if (!opts?.silent) setLoading(true);
			setError(null);
			try {
				const res = await listFn({
					q: deferredSearch || undefined,
					slug: slugKey || undefined,
					language: languageKey || undefined,
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
		[listFn, deferredSearch, slugKey, languageKey, sortBy, sortOrder, pageSize, status, page, setPage]
	);

	const upsertRow = React.useCallback((row: AdminStaticPageRow) => {
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
