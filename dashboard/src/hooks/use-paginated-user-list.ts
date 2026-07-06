import * as React from 'react';

import type { AdminUserRow, ListUsersParams, UserListResponse } from '@/api/admin-users';
import { AuthApiError } from '@/auth/auth-api';

export type UserListSortKey = 'createdAt' | 'email' | 'name' | 'role';

export function usePaginatedUserList(
	listFn: (params: ListUsersParams) => Promise<UserListResponse>,
	searchInput: string,
	sortBy: UserListSortKey,
	sortOrder: 'asc' | 'desc',
	pageSize: number
) {
	const deferredSearch = React.useDeferredValue(searchInput.trim());

	const filterKey = React.useMemo(
		() => `${deferredSearch}\0${sortBy}\0${sortOrder}\0${pageSize}`,
		[deferredSearch, sortBy, sortOrder, pageSize]
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

	const [rows, setRows] = React.useState<UserListResponse['data']>([]);
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
				});
				if (cancelled) return;
				setRows(res.data);
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
	}, [listFn, deferredSearch, sortBy, sortOrder, pageSize, pageForRequest]);

	const refetch = React.useCallback(
		async (opts?: { page?: number; silent?: boolean }) => {
			const targetPage = opts?.page ?? page;
			if (!opts?.silent) {
				setLoading(true);
				setError(null);
			}
			try {
				const res = await listFn({
					q: deferredSearch || undefined,
					sortBy,
					sortOrder,
					limit: pageSize,
					offset: targetPage * pageSize,
				});
				setRows(res.data);
				setTotal(res.total);
				if (opts?.page !== undefined && opts.page !== page) {
					React.startTransition(() => setPage(opts.page!));
				}
			} catch (e) {
				setError(e instanceof AuthApiError ? e.message : 'Không tải được danh sách');
			} finally {
				if (!opts?.silent) setLoading(false);
			}
		},
		[listFn, deferredSearch, sortBy, sortOrder, pageSize, page]
	);

	const upsertRow = React.useCallback(
		(row: AdminUserRow, opts?: { prependOnInsert?: boolean }) => {
			let inserted = false;
			setRows(prev => {
				const idx = prev.findIndex(r => r.id === row.id);
				if (idx >= 0) {
					const next = [...prev];
					next[idx] = row;
					return next;
				}
				inserted = true;
				if (opts?.prependOnInsert) {
					return [row, ...prev].slice(0, pageSize);
				}
				return prev;
			});
			if (inserted) {
				setTotal(prev => prev + 1);
			}
		},
		[pageSize]
	);

	const removeRow = React.useCallback((id: string) => {
		let removed = false;
		setRows(prev => {
			const next = prev.filter(r => r.id !== id);
			removed = next.length !== prev.length;
			return next;
		});
		if (removed) {
			setTotal(prev => Math.max(0, prev - 1));
		}
	}, []);

	return {
		rows,
		total,
		loading,
		error,
		page,
		setPage,
		pageSize,
		refetch,
		upsertRow,
		removeRow,
	};
}
