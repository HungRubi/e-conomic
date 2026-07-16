import * as React from 'react';

import { useNavigate } from 'react-router-dom';

import {
	archiveProduct,
	createProduct,
	deleteProduct,
	fetchProducts,
	publishProduct,
	type AdminProductRow,
} from '@/api/admin-products';
import { fetchAllProductCategories, type AdminProductCategoryRow } from '@/api/admin-product-categories';
import { AuthApiError } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate } from '@/components/users/user-table-shared';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Drawer,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPageContent,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { usePaginatedProductList, type ProductListSortKey } from '@/hooks/use-paginated-product-list';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { categoryBreadcrumb } from '@/lib/product-category-helpers';
import { ProductImagesEditor, type ProductImageEntry } from '@/components/products/product-images-editor';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import { digitsOnly, type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { cn } from '@/lib/utils';
import {
	CheckIcon,
	GripVerticalIcon,
	Archive,
	AlertCircleIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	PencilLine,
	PlusIcon,
	Send,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const listProducts = (params: Parameters<typeof fetchProducts>[0]) => fetchProducts(params);

const PRODUCT_FORM_SCROLL_ORDER = [
	'pf-name',
	'pf-images',
	'pf-category',
	'pf-price',
] as const;

const STATUS_LABEL: Record<AdminProductRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang bán',
	ARCHIVED: 'Lưu trữ',
};

export function ProductsAdminPanel() {
	const { user: currentUser } = useAuth();
	const isAdmin = currentUser?.role === 'ADMIN';
	const navigate = useNavigate();

	const [qDraft, setQDraft] = React.useState('');
	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<ProductListSortKey>('sortOrder');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [pageSize, setPageSize] = React.useState(10);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminProductRow['status']>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } = usePaginatedProductList(
		listProducts,
		qInput,
		sortBy,
		sortOrder,
		pageSize,
		statusFilter
	);

	React.useEffect(() => {
		const handle = window.setTimeout(() => setQInput(qDraft), 500);
		return () => window.clearTimeout(handle);
	}, [qDraft]);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [formSlug, setFormSlug] = React.useState('');
	const [formName, setFormName] = React.useState('');
	const [formCategoryIds, setFormCategoryIds] = React.useState<string[]>([]);
	const [categoryLookupRows, setCategoryLookupRows] = React.useState<AdminProductCategoryRow[]>([]);
	const [formDescription, setFormDescription] = React.useState('');
	const [formPrice, setFormPrice] = React.useState('');
	const [formMedia, setFormMedia] = React.useState<ProductImageEntry[]>([]);
	const [formStatus, setFormStatus] = React.useState<AdminProductRow['status']>('ACTIVE');
	const [advancedOpen, setAdvancedOpen] = React.useState(false);
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});

	const [deleteTarget, setDeleteTarget] = React.useState<AdminProductRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	const reloadCategoryLookup = React.useCallback(() => {
		void fetchAllProductCategories({ status: 'all', sortBy: 'name', sortOrder: 'asc' })
			.then(setCategoryLookupRows)
			.catch(() => {});
	}, []);

	React.useEffect(() => { reloadCategoryLookup(); }, [reloadCategoryLookup]);

	const leafChoices = React.useMemo(
		() => categoryLookupRows.filter(c => c.level === 2 || (c.level === 1 && !c.children?.length)),
		[categoryLookupRows]
	);

	const selectedLeaves = React.useMemo(
		() => formCategoryIds.map(id => categoryLookupRows.find(c => c.id === id)).filter(Boolean) as AdminProductCategoryRow[],
		[categoryLookupRows, formCategoryIds]
	);

	const slugPreview = React.useMemo(() => {
		const trimmed = formSlug.trim();
		if (trimmed) return trimmed;
		return slugifyVi(formName) || '...';
	}, [formSlug, formName]);

	const stepStatus = React.useMemo(() => ({
		basics: Boolean(formName.trim()) && formCategoryIds.length > 0,
		images: formMedia.length > 0 && Boolean(formMedia[0]?.url.trim()),
		pricing: Boolean(formPrice.trim()) && Number(formPrice) >= 0,
		content: Boolean(formDescription.trim()),
	}), [formName, formCategoryIds, formMedia, formPrice, formDescription]);

	const missingCount = Object.values(stepStatus).filter(v => !v).length;

	function openCreate() {
		setFormSlug('');
		setFormName('');
		setFormCategoryIds([]);
		setFormDescription('');
		setFormPrice('');
		setFormMedia([]);
		setFormStatus('ACTIVE');
		setFormError(null);
		setFieldErrors({});
		setAdvancedOpen(false);
		setDrawerOpen(true);
		reloadCategoryLookup();
	}

	function parseOptionalInt(raw: string): number | null {
		const t = raw.trim();
		if (!t) return null;
		const n = Number(t);
		return Number.isFinite(n) ? Math.trunc(n) : null;
	}

	async function submitForm() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};

		if (!formName.trim()) err['pf-name'] = 'Nhập tên sản phẩm';
		if (formMedia.length === 0 || !formMedia[0]?.url.trim()) err['pf-images'] = 'Thêm ít nhất một ảnh';
		if (formCategoryIds.length === 0) err['pf-category'] = 'Chọn ít nhất một danh mục';

		const priceVal = parseOptionalInt(formPrice);
		if (formPrice.trim() === '' || priceVal == null || priceVal < 0) {
			err['pf-price'] = 'Nhập giá (số, VND)';
		}

		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(PRODUCT_FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});

		try {
			const created = await createProduct({
				...(formSlug.trim() ? { slug: formSlug.trim() } : {}),
				name: formName.trim(),
				description: formDescription.trim(),
				priceVnd: priceVal!,
				status: formStatus,
				type: 'SIMPLE',
				categoryIds: formCategoryIds,
				primaryCategoryId: formCategoryIds[0],
				images: formMedia.map(m => m.url.trim()).filter(Boolean),
			});
			toast.success('Tạo sản phẩm thành công');
			upsertRow(created, { prependOnInsert: page === 0 });
			setDrawerOpen(false);
			if (page !== 0) await refetch({ page: 0, silent: true });
		} catch (e) {
			const message = e instanceof AuthApiError ? e.message : 'Thao tác thất bại';
			setFormError(message);
			toast.error(message);
		} finally {
			setFormBusy(false);
		}
	}

	async function confirmDelete() {
		if (!isAdmin || !deleteTarget) return;
		setDeleteBusy(true);
		try {
			const deletedId = deleteTarget.id;
			const isLastRowOnPage = rows.length === 1;
			const shouldGoPrevPage = isLastRowOnPage && page > 0;

			await toast.promise(deleteProduct(deletedId), {
				loading: 'Đang xóa sản phẩm...',
				success: 'Xóa sản phẩm thành công',
				error: 'Xóa sản phẩm thất bại',
			});
			removeRow(deletedId);
			if (shouldGoPrevPage) await refetch({ page: page - 1, silent: true });
			setDeleteTarget(null);
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Xóa thất bại');
		} finally {
			setDeleteBusy(false);
		}
	}

	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	return (
		<div className='flex min-h-0 flex-1 flex-col gap-4'>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Sản phẩm</h1>
					<p className='text-muted-foreground text-sm'>Quản lý danh sách sản phẩm.</p>
				</div>
				<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
					<PlusIcon className='size-4' />
					Thêm sản phẩm
				</Button>
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='prod-q'
						name='product-search'
						placeholder='Tên, mô tả…'
						value={qDraft}
						onChange={e => setQDraft(e.target.value)}
						autoComplete='off'
						spellCheck={false}
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<div>
						<Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
							<SelectTrigger className='w-40'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='all'>Mọi trạng thái</SelectItem>
									<SelectItem value='DRAFT'>Nháp</SelectItem>
									<SelectItem value='ACTIVE'>Đang bán</SelectItem>
									<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select value={sortBy} onValueChange={v => setSortBy(v as ProductListSortKey)}>
							<SelectTrigger className='w-44'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='sortOrder'>Thứ tự</SelectItem>
									<SelectItem value='createdAt'>Ngày tạo</SelectItem>
									<SelectItem value='name'>Tên</SelectItem>
									<SelectItem value='price'>Giá</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select value={sortOrder} onValueChange={v => setSortOrder(v as typeof sortOrder)}>
							<SelectTrigger className='w-32'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='asc'>Tăng dần</SelectItem>
									<SelectItem value='desc'>Giảm dần</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
							<SelectTrigger className='w-24'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{[10, 20, 50, 100].map(n => (
										<SelectItem key={n} value={String(n)}>{n}</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className='overflow-hidden rounded-lg border bg-background'>
				<Table className='table-fixed'>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<div className='flex items-center justify-center'>
									<GripVerticalIcon className='text-muted-foreground size-4' />
								</div>
							</TableHead>
							<TableHead className='w-14'>Ảnh</TableHead>
							<TableHead>Tên</TableHead>
							<TableHead>Danh mục</TableHead>
							<TableHead>Giá</TableHead>
							<TableHead>Tồn kho</TableHead>
							<TableHead>Trạng thái</TableHead>
							<TableHead className='text-muted-foreground hidden md:table-cell'>Cập nhật</TableHead>
							<TableHead className='w-16 text-right'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRowsSkeleton rows={5} columns={9} />
						) : error ? (
							<TableErrorStateRow colSpan={9} message={error} onRetry={() => void refetch()} />
						) : rows.length === 0 ? (
							<TableEmptyStateRow colSpan={9} />
						) : (
							rows.map(row => (
								<TableRow
									key={row.id}
									className='cursor-pointer'
									onClick={() => navigate(`/products/${row.id}`)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											navigate(`/products/${row.id}`);
										}
									}}
								>
									<TableCell>
										<div className='flex items-center justify-center' onClick={e => e.stopPropagation()}>
											<GripVerticalIcon className='text-muted-foreground size-4' />
										</div>
									</TableCell>
									<TableCell>
										<img
											src={publicAssetUrl(row.image)}
											alt=''
											className='size-10 rounded-md border border-border object-cover'
											loading='lazy'
										/>
									</TableCell>
									<TableCell className='max-w-0 truncate font-medium' title={row.name}>
										{row.name}
									</TableCell>
									<TableCell className='text-muted-foreground text-sm'>
										{row.categories && row.categories.length > 0 ? (
											<div className='flex items-center gap-1 min-w-0'>
												<Badge variant='secondary' className='max-w-[140px] truncate font-normal sm:max-w-[200px]'>
													{(row.categories[0] as any).name}
												</Badge>
												{row.categories.length > 1 ? (
													<span className='text-muted-foreground shrink-0 text-[11px]'>+{row.categories.length - 1}</span>
												) : null}
											</div>
										) : (
											<span className='truncate text-xs text-muted-foreground'>—</span>
										)}
									</TableCell>
									<TableCell className='text-sm'>{row.priceLabel}</TableCell>
									<TableCell className='text-sm'>
										{row.stockQuantity !== undefined ? (
											row.stockQuantity === 0 ? (
												<Badge variant='destructive'>Hết hàng</Badge>
											) : row.stockQuantity <= (row.lowStockThreshold ?? 5) ? (
												<Badge variant='warning'>Sắp hết ({row.stockQuantity})</Badge>
											) : (
												<Badge variant='success'>Còn {row.stockQuantity}</Badge>
											)
										) : (
											<span className='text-muted-foreground'>—</span>
										)}
									</TableCell>
									<TableCell>
										<Badge variant={CONTENT_STATUS_BADGE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
									</TableCell>
									<TableCell className='text-muted-foreground hidden text-sm md:table-cell'>
										{fmtUserDate(row.updatedAt)}
									</TableCell>
									<TableCell className='text-right'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													className='ml-auto size-8 text-muted-foreground data-[state=open]:bg-muted'
													aria-label='Mở thao tác'
													onClick={e => e.stopPropagation()}
												>
													<EllipsisVerticalIcon className='size-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end' className='w-48' onClick={e => e.stopPropagation()}>
												<DropdownMenuItem onClick={() => navigate(`/products/${row.id}`)}>
													<PencilLine className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={async () => {
														try {
															const r = await publishProduct(row.id);
															upsertRow(r);
															toast.success('Đã xuất bản');
														} catch (e) {
															toast.error(e instanceof AuthApiError ? e.message : 'Thất bại');
														}
													}}
												>
													<Send className='size-4' />
													Xuất bản
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={async () => {
														try {
															const r = await archiveProduct(row.id);
															upsertRow(r);
															toast.success('Đã lưu trữ');
														} catch (e) {
															toast.error(e instanceof AuthApiError ? e.message : 'Thất bại');
														}
													}}
												>
													<Archive className='size-4' />
													Lưu trữ
												</DropdownMenuItem>
												{isAdmin ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem variant='destructive' onClick={() => setDeleteTarget(row)}>
															<Trash2 className='size-4' />
															Xóa
														</DropdownMenuItem>
													</>
												) : null}
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<div className='text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between'>
				<span>
					Hiển thị {total === 0 ? 0 : page * pageSize + 1} – {Math.min((page + 1) * pageSize, total)} / {total}
				</span>
				<div className='flex items-center gap-2'>
					<Button type='button' variant='outline' size='icon' className='size-8' disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>
						<ChevronLeftIcon className='size-4' />
					</Button>
					<span>Trang {page + 1} / {pageCount}</span>
					<Button type='button' variant='outline' size='icon' className='size-8' disabled={page + 1 >= pageCount} onClick={() => setPage(p => p + 1)}>
						<ChevronRightIcon className='size-4' />
					</Button>
				</div>
			</div>

			{/* ────────────── CREATE FORM DRAWER ────────────── */}
			<Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal shouldScaleBackground={false}>
				<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
					<DrawerHeader className='shrink-0 border-b px-6 py-4 pr-24 text-left'>
						<div className='flex items-center justify-between gap-3'>
							<div>
								<DrawerTitle className='text-base'>Thêm sản phẩm mới</DrawerTitle>
								<DrawerDescription className='mt-0.5 text-xs'>
									{slugPreview !== '...' ? (
										<>Slug: <span className='font-mono text-foreground'>{slugPreview}</span></>
									) : (
										'Nhập tên sản phẩm để tự động sinh slug.'
									)}
								</DrawerDescription>
							</div>
							{missingCount > 0 ? (
								<Badge variant='outline' className='gap-1 text-[11px]'>
									<AlertCircleIcon className='size-3' aria-hidden />
									Cần {missingCount} bước
								</Badge>
							) : (
								<Badge variant='success' className='text-[11px]'>Sẵn sàng lưu</Badge>
							)}
						</div>
					</DrawerHeader>

					<nav className='shrink-0 overflow-x-auto border-b bg-muted/30'>
						<div className='mx-auto flex w-full max-w-6xl items-center gap-0 px-6 py-3 text-xs'>
							<SectionLink index={1} href='#sec-basics' label='Cơ bản' done={stepStatus.basics} />
							<SectionDivider done={stepStatus.basics} />
							<SectionLink index={2} href='#sec-images' label='Ảnh' done={stepStatus.images} />
							<SectionDivider done={stepStatus.images} />
							<SectionLink index={3} href='#sec-pricing' label='Giá' done={stepStatus.pricing} />
							<SectionDivider done={stepStatus.pricing} />
							<SectionLink index={4} href='#sec-content' label='Mô tả' done={stepStatus.content} />
						</div>
					</nav>

					<div className='min-h-0 flex-1 overflow-y-auto'>
						<div className='mx-auto w-full max-w-6xl px-6 py-6 pb-8'>
							{formError ? (
								<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>{formError}</p>
							) : null}

							<div className='flex flex-col gap-8'>
								{/* ── Cơ bản ── */}
								<section id='sec-basics' className='scroll-mt-4 space-y-4'>
									<SectionHeader index={1} title='Cơ bản' hint='Tên + danh mục là bắt buộc.' />
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='pf-name'>Tên sản phẩm</FieldLabel>
											<Input
												id='pf-name'
												value={formName}
												onChange={e => { setFormName(e.target.value); stripFieldError(setFieldErrors, 'pf-name'); }}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['pf-name'])}
												className={cn(fieldErrors['pf-name'] && 'border-destructive')}
												placeholder='Áo thun nam cổ tròn'
											/>
											{fieldErrors['pf-name'] ? (
												<p className='text-destructive mt-1 text-xs'>{fieldErrors['pf-name']}</p>
											) : (
												<p className='mt-1 text-[11px] text-muted-foreground'>
													Slug tự sinh: <span className='font-mono'>{slugPreview}</span>
												</p>
											)}
										</Field>
										<Field>
											<FieldLabel htmlFor='pf-category'>Danh mục</FieldLabel>
											<div
												id='pf-category'
												aria-invalid={Boolean(fieldErrors['pf-category'])}
												className={cn('rounded-md', fieldErrors['pf-category'] && 'ring-1 ring-destructive')}
											>
												<MultiSelectCombobox
													options={leafChoices.map(leaf => ({
														value: leaf.id,
														label: categoryBreadcrumb(leaf, categoryLookupRows),
													}))}
													selectedValues={formCategoryIds}
													onSelectedChange={values => { setFormCategoryIds(values); stripFieldError(setFieldErrors, 'pf-category'); }}
													placeholder='Chọn danh mục'
													searchPlaceholder='Tìm danh mục'
													emptyText={leafChoices.length === 0 ? 'Chưa có danh mục.' : 'Không tìm thấy.'}
													disabled={formBusy}
												/>
											</div>
											{fieldErrors['pf-category'] ? (
												<p className='text-destructive mt-1 text-xs'>{fieldErrors['pf-category']}</p>
											) : selectedLeaves.length > 0 ? (
												<p className='mt-1 text-[11px] text-muted-foreground'>
													Đã chọn {selectedLeaves.length} danh mục
												</p>
											) : null}
										</Field>
									</div>
								</section>

								{/* ── Ảnh ── */}
								<section id='sec-images' className='scroll-mt-4 space-y-4'>
									<SectionHeader index={2} title='Ảnh sản phẩm' hint='Ảnh đầu tiên là ảnh đại diện.' />
									<ProductImagesEditor
										entries={formMedia}
										onEntriesChange={next => { setFormMedia(next); stripFieldError(setFieldErrors, 'pf-images'); }}
										fieldError={fieldErrors['pf-images']}
										disabled={formBusy}
									/>
								</section>

								{/* ── Giá ── */}
								<section id='sec-pricing' className='scroll-mt-4 space-y-4'>
									<SectionHeader index={3} title='Định giá' hint='Giá bán sản phẩm.' />
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='pf-price'>Giá (VND)</FieldLabel>
											<Input
												id='pf-price'
												inputMode='numeric'
												pattern='[0-9]*'
												value={formPrice}
												onChange={e => { setFormPrice(digitsOnly(e.target.value)); stripFieldError(setFieldErrors, 'pf-price'); }}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['pf-price'])}
												className={cn(fieldErrors['pf-price'] && 'border-destructive')}
												placeholder='0'
											/>
											{fieldErrors['pf-price'] ? (
												<p className='text-destructive mt-1 text-xs'>{fieldErrors['pf-price']}</p>
											) : null}
										</Field>
										<Field>
											<FieldLabel htmlFor='pf-status'>Trạng thái</FieldLabel>
											<Select value={formStatus} onValueChange={v => setFormStatus(v as AdminProductRow['status'])} disabled={formBusy}>
												<SelectTrigger id='pf-status'><SelectValue /></SelectTrigger>
												<SelectContent>
													<SelectItem value='DRAFT'>Nháp</SelectItem>
													<SelectItem value='ACTIVE'>Đang bán</SelectItem>
												</SelectContent>
											</Select>
										</Field>
									</div>
								</section>

								{/* ── Mô tả ── */}
								<section id='sec-content' className='scroll-mt-4 space-y-4'>
									<SectionHeader index={4} title='Mô tả' hint='Hiển thị ở trang chi tiết sản phẩm.' />
									<Field>
										<FieldLabel htmlFor='pf-desc'>Mô tả sản phẩm</FieldLabel>
										<Textarea
											id='pf-desc'
											value={formDescription}
											onChange={e => setFormDescription(e.target.value)}
											disabled={formBusy}
											rows={5}
											className='block min-h-28 w-full resize-y'
											placeholder='Giới thiệu ngắn về sản phẩm…'
										/>
									</Field>
								</section>

								{/* ── Nâng cao ── */}
								<section id='sec-advanced' className='scroll-mt-4'>
									<button
										type='button'
										onClick={() => setAdvancedOpen(prev => !prev)}
										className='-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted/40'
										aria-expanded={advancedOpen}
									>
										<ChevronDownIcon
											className={cn('size-4 text-muted-foreground transition-transform', advancedOpen && 'rotate-180')}
											aria-hidden
										/>
										<span className='font-medium tracking-tight'>Cài đặt nâng cao</span>
										<span className='text-[11px] text-muted-foreground'>Slug, thứ tự</span>
									</button>
									{advancedOpen ? (
										<div className='space-y-4 pt-2'>
											<Field>
												<FieldLabel htmlFor='pf-slug'>Slug (URL)</FieldLabel>
												<Input
													id='pf-slug'
													value={formSlug}
													onChange={e => setFormSlug(e.target.value)}
													disabled={formBusy}
													autoComplete='off'
													placeholder={slugifyVi(formName) || 'tu-dong-sinh'}
													className='font-mono'
												/>
											</Field>
										</div>
									) : null}
								</section>
							</div>
						</div>
					</div>

					<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
						<div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between'>
							<div className='flex items-center gap-2 text-xs text-muted-foreground'>
								<Badge variant={CONTENT_STATUS_BADGE[formStatus]} className='text-[11px]'>
									{STATUS_LABEL[formStatus]}
								</Badge>
								{missingCount > 0 ? <span>còn {missingCount} bước chưa hoàn thành</span> : null}
							</div>
							<div className='flex items-center gap-2'>
								<Button type='button' variant='outline' onClick={() => setDrawerOpen(false)} disabled={formBusy}>
									Hủy
								</Button>
								<Button type='button' onClick={() => void submitForm()} disabled={formBusy}>
									{formBusy ? 'Đang lưu' : 'Lưu sản phẩm'}
								</Button>
							</div>
						</div>
					</DrawerFooter>
				</DrawerPageContent>
			</Drawer>

			<AlertDialog open={Boolean(deleteTarget)} onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Sản phẩm{' '}
							<span className='font-medium text-foreground'>{deleteTarget?.name}</span> sẽ bị xóa vĩnh viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction disabled={deleteBusy} onClick={() => void confirmDelete()}>
							{deleteBusy ? 'Đang xóa' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function SectionHeader({ index, title, hint }: { index?: number; title: string; hint?: string }) {
	return (
		<div className='flex items-baseline gap-2'>
			{index != null ? (
				<span aria-hidden className='text-[11px] font-semibold tabular-nums text-muted-foreground/70'>
					{String(index).padStart(2, '0')}
				</span>
			) : null}
			<div className='min-w-0'>
				<h3 className='text-sm font-semibold tracking-tight'>{title}</h3>
				{hint ? <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p> : null}
			</div>
		</div>
	);
}

function SectionLink({
	index,
	href,
	label,
	done,
	optional,
}: {
	index: number;
	href: string;
	label: string;
	done: boolean;
	optional?: boolean;
}) {
	const completed = done && !optional;
	return (
		<a
			href={href}
			className={cn(
				'group inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200',
				'hover:bg-background hover:shadow-sm',
				completed ? 'text-foreground' : 'text-muted-foreground'
			)}
		>
			<span
				className={cn(
					'relative inline-flex size-5 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-all duration-300',
					completed
						? 'bg-emerald-500 text-white shadow-sm'
						: optional
							? 'bg-muted text-muted-foreground/70 ring-1 ring-border'
							: 'bg-background text-muted-foreground ring-1 ring-border group-hover:ring-foreground/40'
				)}
				aria-hidden
			>
				<span className={cn('transition-all duration-300', completed ? 'scale-0 opacity-0' : 'scale-100 opacity-100')}>
					{index}
				</span>
				<CheckIcon
					className={cn('absolute size-3 transition-all duration-300', completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0')}
				/>
			</span>
			<span className='text-xs font-medium tracking-tight'>{label}</span>
			{optional ? <span className='text-[10px] font-normal text-muted-foreground/60'>• Tùy chọn</span> : null}
		</a>
	);
}

function SectionDivider({ done }: { done: boolean }) {
	return (
		<span
			aria-hidden
			className={cn('mx-1 h-px w-4 shrink-0 transition-colors duration-300 sm:w-6', done ? 'bg-emerald-500/60' : 'bg-border')}
		/>
	);
}

function slugifyVi(value: string): string {
	if (!value) return '';
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[đĐ]/g, 'd')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
