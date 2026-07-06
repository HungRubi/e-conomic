import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	RefreshCwIcon,
	ScrollTextIcon,
	SearchIcon,
} from 'lucide-react';

import { listAuditLogs, type AuditLogRow, type ListAuditLogsParams } from '@/api/admin-audit';
import { DateRangePicker, type DateRangeValue } from '@/components/date-range-picker';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dateStampForFile, exportToCsv } from '@/lib/csv-export';
import { cn } from '@/lib/utils';

function formatDateTime(iso: string): string {
	return new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	}).format(new Date(iso));
}

function entityHref(row: AuditLogRow): string | null {
	if (!row.entityType || !row.entityId) return null;
	switch (row.entityType) {
		case 'order':
			return `/orders/${row.entityId}`;
		case 'product':
			return `/products/${row.entityId}`;
		case 'article':
			return `/content/articles/${row.entityId}`;
		case 'customer-feedback':
			return `/content/customer-feedbacks/${row.entityId}`;
		case 'static-page':
			return `/content/pages/${row.entityId}`;
		case 'promotion-discount':
			return `/promotions/${row.entityId}`;
		case 'global_config':
			return `/settings/website`;
		case 'user':
		case 'internal-user':
			return `/internal-users/${row.entityId}`;
		case 'customer':
			return `/customers/${row.entityId}`;
		case 'product-category':
			return `/products/categories/${row.entityId}`;
		case 'product-material':
			return `/products/decorative-stones`;
		case 'contact-inquiry':
			return `/content/contact-inquiries/${row.entityId}`;
		default:
			return null;
	}
}

function actionTone(action: string): 'success' | 'warning' | 'destructive' | 'info' | 'muted' {
	if (action.includes('login') || action.includes('refresh')) return 'info';
	if (action.includes('delete') || action.includes('cancel') || action.includes('disable')) return 'destructive';
	if (action.includes('publish') || action.includes('paid')) return 'success';
	if (action.includes('update') || action.includes('bulk') || action.includes('reset')) return 'warning';
	return 'muted';
}

export default function AuditLogsPage() {
	const [page, setPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(50);
	const [actionInput, setActionInput] = React.useState('');
	const [actionFilter, setActionFilter] = React.useState('');
	const [actorIdFilter, setActorIdFilter] = React.useState('');
	const [entityFilter, setEntityFilter] = React.useState('');
	const [dateRange, setDateRange] = React.useState<DateRangeValue>({ from: null, to: null });
	const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

	const params: ListAuditLogsParams = {
		page,
		limit: pageSize,
		...(actionFilter && { action: actionFilter }),
		...(actorIdFilter && { actorId: actorIdFilter }),
		...(entityFilter && { entityType: entityFilter }),
		...(dateRange.from && { fromDate: dateRange.from }),
		...(dateRange.to && { toDate: dateRange.to }),
	};

	const { data, isLoading, isFetching, error, refetch } = useQuery({
		queryKey: ['audit-logs', params],
		queryFn: () => listAuditLogs(params),
		staleTime: 30_000,
	});

	function applyFilters() {
		setActionFilter(actionInput.trim());
		setPage(1);
	}

	function toggleExpand(id: string) {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function exportPage() {
		const items = data?.items ?? [];
		if (items.length === 0) return;
		exportToCsv(`audit-logs-${dateStampForFile()}`, items, [
			{ header: 'Thời gian', accessor: (r: AuditLogRow) => r.createdAt },
			{ header: 'Hành động', accessor: (r: AuditLogRow) => r.action },
			{ header: 'Actor', accessor: (r: AuditLogRow) => r.actorEmail ?? r.actorId ?? '' },
			{ header: 'Role', accessor: (r: AuditLogRow) => r.actorRole ?? '' },
			{ header: 'Entity', accessor: (r: AuditLogRow) => `${r.entityType ?? ''}:${r.entityId ?? ''}` },
			{ header: 'IP', accessor: (r: AuditLogRow) => r.ipAddress ?? '' },
			{ header: 'Metadata', accessor: (r: AuditLogRow) => JSON.stringify(r.metadata) },
		]);
	}

	const items = data?.items ?? [];
	const totalPages = data?.totalPages ?? 1;
	const total = data?.total ?? 0;

	return (
		<div className='dashboard-fade-in space-y-4'>
			<header className='flex flex-col gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex items-center gap-2'>
					<ScrollTextIcon className='size-5 text-muted-foreground' aria-hidden />
					<div>
						<h1 className='text-lg font-semibold tracking-tight'>Audit log</h1>
						<p className='text-xs text-muted-foreground'>
							Lịch sử hành động admin (login, đổi đơn, đổi trạng thái…). Mỗi sự kiện ghi actor + IP + metadata.
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Button type='button' variant='outline' size='sm' onClick={exportPage} disabled={items.length === 0}>
						Xuất CSV
					</Button>
					<Button type='button' variant='outline' size='sm' onClick={() => void refetch()} disabled={isFetching}>
						<RefreshCwIcon className={cn('mr-1.5 size-3.5', isFetching && 'animate-spin')} aria-hidden />
						Làm mới
					</Button>
				</div>
			</header>

			<div className='flex flex-wrap items-end gap-2'>
				<div className='min-w-[12rem] flex-1'>
					<Input
						placeholder='Tìm action (orders.update, auth.login…)'
						value={actionInput}
						onChange={(e) => setActionInput(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
					/>
				</div>
				<Button type='button' variant='outline' size='sm' onClick={applyFilters}>
					<SearchIcon className='mr-1 size-3.5' /> Áp dụng
				</Button>
				<Input
					placeholder='Actor ID'
					value={actorIdFilter}
					onChange={(e) => {
						setActorIdFilter(e.target.value);
						setPage(1);
					}}
					className='w-40'
				/>
				<Input
					placeholder='Entity type (order, user…)'
					value={entityFilter}
					onChange={(e) => {
						setEntityFilter(e.target.value);
						setPage(1);
					}}
					className='w-44'
				/>
				<DateRangePicker
					value={dateRange}
					onChange={(v) => {
						setDateRange(v);
						setPage(1);
					}}
				/>
				<Select
					value={String(pageSize)}
					onValueChange={v => {
						setPageSize(Number(v));
						setPage(1);
					}}
				>
					<SelectTrigger className='w-24'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							{[20, 50, 100].map(n => (
								<SelectItem key={n} value={String(n)}>
									{n}
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
			</div>

			<Card className='gap-0 overflow-hidden p-0'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<div className='flex items-center justify-center'>
									<Checkbox
										checked={(() => {
											const ids = items.map(r => r.id);
											if (ids.length === 0) return false;
											const all = ids.every(id => selectedIds.has(id));
											if (all) return true;
											return ids.some(id => selectedIds.has(id)) ? 'indeterminate' : false;
										})()}
										onCheckedChange={v => {
											const checked = Boolean(v);
											setSelectedIds(prev => {
												const next = new Set(prev);
												for (const r of items) {
													if (checked) next.add(r.id);
													else next.delete(r.id);
												}
												return next;
											});
										}}
										aria-label='Chọn tất cả audit log trên trang'
									/>
								</div>
							</TableHead>
							<TableHead className='w-44'>Thời gian</TableHead>
							<TableHead className='w-44'>Hành động</TableHead>
							<TableHead>Actor</TableHead>
							<TableHead>Entity</TableHead>
							<TableHead className='w-32'>IP</TableHead>
							<TableHead className='w-12 text-right'>Chi tiết</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRowsSkeleton rows={8} columns={7} />
						) : error ? (
							<TableErrorStateRow
								colSpan={7}
								message={error instanceof Error ? error.message : 'Không tải được audit log'}
								onRetry={() => void refetch()}
							/>
						) : items.length === 0 ? (
							<TableEmptyStateRow colSpan={7} description='Chưa có sự kiện nào khớp bộ lọc.' />
						) : (
							items.flatMap((row) => {
								const isExpanded = expanded.has(row.id);
								const metadataStr = JSON.stringify(row.metadata, null, 2);
								return [
									<TableRow
										key={row.id}
										onClick={() => toggleExpand(row.id)}
										className='dashboard-row-enter cursor-pointer'
									>
										<TableCell onClick={e => e.stopPropagation()}>
											<div className='flex items-center justify-center'>
												<Checkbox
													checked={selectedIds.has(row.id)}
													onCheckedChange={v =>
														setSelectedIds(prev => {
															const next = new Set(prev);
															if (v) next.add(row.id);
															else next.delete(row.id);
															return next;
														})
													}
													aria-label={`Chọn audit log ${row.id}`}
												/>
											</div>
										</TableCell>
										<TableCell className='whitespace-nowrap text-xs tabular-nums'>
											{formatDateTime(row.createdAt)}
										</TableCell>
										<TableCell>
											<Badge variant={actionTone(row.action)} className='font-mono text-[11px]'>
												{row.action}
											</Badge>
										</TableCell>
										<TableCell className='text-sm'>
											{row.actorEmail ?? row.actorId ?? '—'}
											{row.actorRole ? (
												<span className='ml-1.5 text-xs text-muted-foreground'>({row.actorRole})</span>
											) : null}
										</TableCell>
										<TableCell className='text-sm'>
											{row.entityType ? (
												(() => {
													const href = entityHref(row);
													const label = (
														<span className='font-mono text-xs'>
															{row.entityType}
															{row.entityId ? `:${row.entityId.slice(0, 8)}…` : ''}
														</span>
													);
													return href ? (
														<Link
															to={href}
															onClick={(e) => e.stopPropagation()}
															className='hover:underline'
														>
															{label}
														</Link>
													) : (
														label
													);
												})()
											) : (
												<span className='text-muted-foreground'>—</span>
											)}
										</TableCell>
										<TableCell className='text-xs text-muted-foreground'>{row.ipAddress ?? '—'}</TableCell>
										<TableCell className='text-right text-xs text-muted-foreground'>
											{isExpanded ? '▾' : '▸'}
										</TableCell>
									</TableRow>,
									isExpanded ? (
										<TableRow key={`${row.id}-detail`} className='bg-muted/30'>
											<TableCell colSpan={7} className='p-3'>
												<pre className='max-h-72 overflow-auto rounded-md bg-background p-3 text-xs'>
													{metadataStr}
												</pre>
												{row.userAgent ? (
													<p className='mt-2 break-all text-[11px] text-muted-foreground'>
														UA: {row.userAgent}
													</p>
												) : null}
											</TableCell>
										</TableRow>
									) : null,
								].filter(Boolean) as React.ReactElement[];
							})
						)}
					</TableBody>
				</Table>
			</Card>

			<div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
				<span>
					Hiển thị {total === 0 ? 0 : (page - 1) * pageSize + 1}–
					{Math.min(page * pageSize, total)} / {total}
				</span>
				<div className='flex items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page <= 1}
						onClick={() => setPage(p => Math.max(1, p - 1))}
					>
						<ChevronLeftIcon className='size-4' />
					</Button>
					<span>
						Trang {page} / {totalPages}
					</span>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page >= totalPages}
						onClick={() => setPage(p => Math.min(totalPages, p + 1))}
					>
						<ChevronRightIcon className='size-4' />
					</Button>
				</div>
			</div>
		</div>
	);
}
