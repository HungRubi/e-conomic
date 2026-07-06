import * as React from 'react';
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type Row,
	type SortingState,
	type VisibilityState,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	ArrowDownAZIcon,
	ArrowUpAZIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	Columns3Icon,
	ListFilterIcon,
	PlusIcon,
	RotateCcwIcon,
	SearchIcon,
} from 'lucide-react';

export type DataTableRowBase = { id: number };

function getColumnHeaderLabel<T>(col: ColumnDef<T>): string {
	const h = col.header;
	if (typeof h === 'string') return h;
	const id = 'accessorKey' in col && col.accessorKey != null ? String(col.accessorKey) : col.id;
	return id ?? 'Cột';
}

function globalFilterRow<T extends DataTableRowBase>(row: Row<T>, _columnId: string, filterValue: unknown): boolean {
	const q = String(filterValue ?? '')
		.toLowerCase()
		.trim();
	if (!q) return true;
	const o = row.original as Record<string, unknown>;
	return Object.values(o).some(v => v != null && String(v).toLowerCase().includes(q));
}

function DraggableRow<T extends DataTableRowBase>({ row }: { row: Row<T> }) {
	const { transform, transition, setNodeRef, isDragging } = useSortable({
		id: row.original.id,
	});

	return (
		<TableRow
			data-state={row.getIsSelected() && 'selected'}
			data-dragging={isDragging}
			ref={setNodeRef}
			className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
			style={{
				transform: CSS.Transform.toString(transform),
				transition: transition,
			}}
		>
			{row.getVisibleCells().map(cell => (
				<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
			))}
		</TableRow>
	);
}

export function DataTable<T extends DataTableRowBase>({
	data: initialData,
	columns,
}: {
	data: T[];
	columns: ColumnDef<T>[];
}) {
	const [data, setData] = React.useState<T[]>(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = React.useState('');
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const sortableId = React.useId();
	const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

	const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

	const statusFilterOptions = React.useMemo(() => {
		const hasStatus = columns.some(c => 'accessorKey' in c && c.accessorKey === 'status');
		if (!hasStatus) return [] as string[];
		return Array.from(new Set(data.map(r => String((r as Record<string, unknown>).status ?? ''))))
			.filter(Boolean)
			.sort();
	}, [columns, data]);

	const typeFilterOptions = React.useMemo(() => {
		const hasType = columns.some(c => 'accessorKey' in c && c.accessorKey === 'type');
		if (!hasType) return [] as string[];
		return Array.from(new Set(data.map(r => String((r as Record<string, unknown>).type ?? ''))))
			.filter(Boolean)
			.sort();
	}, [columns, data]);

	const sortToolbarOptions = React.useMemo(() => {
		return columns
			.filter(
				(c): c is ColumnDef<T> & { accessorKey: keyof T } =>
					'accessorKey' in c &&
					c.accessorKey != null &&
					c.enableSorting !== false &&
					String(c.accessorKey) !== ''
			)
			.map(c => ({
				id: String(c.accessorKey),
				label: getColumnHeaderLabel(c),
			}));
	}, [columns]);

	const table = useReactTable<T>({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
			globalFilter,
		},
		getRowId: row => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: globalFilterRow,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (active && over && active.id !== over.id) {
			setData(data => {
				const oldIndex = dataIds.indexOf(active.id);
				const newIndex = dataIds.indexOf(over.id);
				return arrayMove(data, oldIndex, newIndex);
			});
		}
	}

	const statusColumn = table.getColumn('status');
	const typeColumn = table.getColumn('type');
	const statusFilterValue = (statusColumn?.getFilterValue() as string | undefined) ?? '__all__';
	const typeFilterValue = (typeColumn?.getFilterValue() as string | undefined) ?? '__all__';

	function resetToolbar() {
		setGlobalFilter('');
		setColumnFilters([]);
		setSorting([]);
		setPagination(p => ({ ...p, pageIndex: 0 }));
	}

	return (
		<Tabs defaultValue='outline' className='w-full flex-col justify-start gap-6'>
			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
				<Label htmlFor='view-selector' className='sr-only'>
					View
				</Label>
				<Select defaultValue='outline'>
					<SelectTrigger className='flex w-fit @4xl/main:hidden' size='sm' id='view-selector'>
						<SelectValue placeholder='Select a view' />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value='outline'>Outline</SelectItem>
							<SelectItem value='past-performance'>Past Performance</SelectItem>
							<SelectItem value='key-personnel'>Key Personnel</SelectItem>
							<SelectItem value='focus-documents'>Focus Documents</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<TabsList className='hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex w-fit'>
					<TabsTrigger value='outline'>Outline</TabsTrigger>
					<TabsTrigger value='past-performance'>
						Past Performance <Badge variant='secondary'>3</Badge>
					</TabsTrigger>
					<TabsTrigger value='key-personnel'>
						Key Personnel <Badge variant='secondary'>2</Badge>
					</TabsTrigger>
					<TabsTrigger value='focus-documents'>Focus Documents</TabsTrigger>
				</TabsList>
				<div className='flex items-center gap-2'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' size='sm'>
								<Columns3Icon data-icon='inline-start' />
								Columns
								<ChevronDownIcon data-icon='inline-end' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end' className='w-32'>
							{table
								.getAllColumns()
								.filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
								.map(column => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='capitalize'
											checked={column.getIsVisible()}
											onCheckedChange={value => column.toggleVisibility(!!value)}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
					<Button variant='outline' size='sm'>
						<PlusIcon />
						<span className='hidden lg:inline'>Add Section</span>
					</Button>
				</div>
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between'>
				<div className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'>
					<div className='relative min-w-48 flex-1 sm:max-w-sm'>
						<SearchIcon className='text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
						<Input
							placeholder='Tìm kiếm theo mọi cột…'
							value={globalFilter}
							onChange={e => {
								setGlobalFilter(e.target.value);
								table.setPageIndex(0);
							}}
							className='h-9 pl-9'
							aria-label='Tìm kiếm'
						/>
					</div>
					{statusColumn && statusFilterOptions.length > 0 ? (
						<div className='flex items-center gap-2'>
							<ListFilterIcon
								className='text-muted-foreground size-4 shrink-0 max-sm:hidden'
								aria-hidden
							/>
							<Select
								value={statusFilterValue}
								onValueChange={value => {
									statusColumn.setFilterValue(value === '__all__' ? undefined : value);
									table.setPageIndex(0);
								}}
							>
								<SelectTrigger
									size='sm'
									className='h-9 w-[min(100%,11rem)] sm:w-44'
									aria-label='Lọc trạng thái'
								>
									<SelectValue placeholder='Trạng thái' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='__all__'>Tất cả trạng thái</SelectItem>
										{statusFilterOptions.map(s => (
											<SelectItem key={s} value={s}>
												{s}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					) : null}
					{typeColumn && typeFilterOptions.length > 0 ? (
						<Select
							value={typeFilterValue}
							onValueChange={value => {
								typeColumn.setFilterValue(value === '__all__' ? undefined : value);
								table.setPageIndex(0);
							}}
						>
							<SelectTrigger size='sm' className='h-9 w-[min(100%,11rem)] sm:w-48' aria-label='Lọc loại'>
								<SelectValue placeholder='Loại / section' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='__all__'>Tất cả loại</SelectItem>
									{typeFilterOptions.map(t => (
										<SelectItem key={t} value={t}>
											{t}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					) : null}
					{sortToolbarOptions.length > 0 ? (
						<div className='flex flex-wrap items-center gap-2'>
							<Select
								value={
									sorting[0] ? `${sorting[0].id}-${sorting[0].desc ? 'desc' : 'asc'}` : '__default__'
								}
								onValueChange={value => {
									if (value === '__default__') {
										setSorting([]);
										return;
									}
									const [colId, dir] = value.split(/-(?=[^-]+$)/);
									const desc = dir === 'desc';
									setSorting([{ id: colId, desc }]);
									table.setPageIndex(0);
								}}
							>
								<SelectTrigger
									size='sm'
									className='h-9 w-[min(100%,14rem)] sm:w-56'
									aria-label='Sắp xếp'
								>
									<span className='flex items-center gap-2 truncate'>
										<ArrowDownAZIcon className='size-4 shrink-0' />
										<SelectValue placeholder='Sắp xếp' />
									</span>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='__default__'>Mặc định (thứ tự kéo)</SelectItem>
										{sortToolbarOptions.flatMap(opt => [
											<SelectItem key={`${opt.id}-asc`} value={`${opt.id}-asc`}>
												<span className='flex items-center gap-2'>
													<ArrowUpAZIcon className='size-3.5' />
													{opt.label}: A → Z
												</span>
											</SelectItem>,
											<SelectItem key={`${opt.id}-desc`} value={`${opt.id}-desc`}>
												<span className='flex items-center gap-2'>
													<ArrowDownAZIcon className='size-3.5' />
													{opt.label}: Z → A
												</span>
											</SelectItem>,
										])}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					) : null}
				</div>
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='h-9 shrink-0 gap-1.5'
					onClick={resetToolbar}
				>
					<RotateCcwIcon className='size-3.5' />
					đặt lại bộ lọc
				</Button>
			</div>

			<TabsContent value='outline' className='relative flex flex-col gap-4 overflow-auto'>
				<div className='overflow-hidden rounded-lg border bg-background'>
					<DndContext
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						id={sortableId}
					>
						<Table>
							<TableHeader className='sticky top-0 z-10 bg-muted'>
								{table.getHeaderGroups().map(headerGroup => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map(header => {
											return (
												<TableHead key={header.id} colSpan={header.colSpan}>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className='**:data-[slot=table-cell]:first:w-8'>
								{table.getRowModel().rows?.length ? (
									<SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
										{table.getRowModel().rows.map(row => (
											<DraggableRow key={row.id} row={row} />
										))}
									</SortableContext>
								) : (
									<TableRow>
										<TableCell colSpan={columns.length} className='h-24 text-center'>
											No results.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</DndContext>
				</div>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
					<div className='hidden flex-1 text-sm text-muted-foreground lg:flex'>
						{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
						row(s) selected.
					</div>
					<div className='flex w-full items-center gap-8 lg:w-fit'>
						<div className='hidden items-center gap-2 lg:flex'>
							<Label htmlFor='rows-per-page' className='text-sm font-medium'>
								Rows per page
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={value => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size='sm' className='w-20' id='rows-per-page'>
									<SelectValue placeholder={table.getState().pagination.pageSize} />
								</SelectTrigger>
								<SelectContent side='top'>
									<SelectGroup>
										{[10, 20, 30, 40, 50].map(pageSize => (
											<SelectItem key={pageSize} value={`${pageSize}`}>
												{pageSize}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<div className='flex w-fit items-center justify-center text-sm font-medium'>
							Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
						</div>
						<div className='ml-auto flex items-center gap-2 lg:ml-0'>
							<Button
								variant='outline'
								className='hidden h-8 w-8 p-0 lg:flex'
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className='sr-only'>Go to first page</span>
								<ChevronsLeftIcon />
							</Button>
							<Button
								variant='outline'
								className='size-8'
								size='icon'
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className='sr-only'>Go to previous page</span>
								<ChevronLeftIcon />
							</Button>
							<Button
								variant='outline'
								className='size-8'
								size='icon'
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className='sr-only'>Go to next page</span>
								<ChevronRightIcon />
							</Button>
							<Button
								variant='outline'
								className='hidden size-8 lg:flex'
								size='icon'
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className='sr-only'>Go to last page</span>
								<ChevronsRightIcon />
							</Button>
						</div>
					</div>
				</div>
			</TabsContent>
			<TabsContent value='past-performance' className='flex flex-col'>
				<div className='aspect-video w-full flex-1 rounded-lg border border-dashed bg-background/50'></div>
			</TabsContent>
			<TabsContent value='key-personnel' className='flex flex-col'>
				<div className='aspect-video w-full flex-1 rounded-lg border border-dashed bg-background/50'></div>
			</TabsContent>
			<TabsContent value='focus-documents' className='flex flex-col'>
				<div className='aspect-video w-full flex-1 rounded-lg border border-dashed bg-background/50'></div>
			</TabsContent>
		</Tabs>
	);
}
