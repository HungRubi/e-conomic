import * as React from 'react';

import { uploadProductImage } from '@/api/admin-products';
import {
	archiveProductCategory,
	createProductCategory,
	deleteProductCategory,
	fetchAllProductCategories,
	fetchProductCategories,
	publishProductCategory,
	type AdminProductCategoryRow,
} from '@/api/admin-product-categories';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
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
import {
	Drawer,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerPageContent,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parentChoicesForCategoryForm } from '@/lib/product-category-helpers';
import { digitsOnly, type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
	usePaginatedProductCategoryList,
	type ProductCategoryListSortKey,
} from '@/hooks/use-paginated-product-category-list';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';
import {
	Archive,
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	GripVerticalIcon,
	PlusIcon,
	Send,
	Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const listCategories = (params: Parameters<typeof fetchProductCategories>[0]) => fetchProductCategories(params);

const STATUS_LABEL: Record<AdminProductCategoryRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang hiển thị',
	ARCHIVED: 'Lưu trữ',
};

const LEVEL_LABEL: Record<number, string> = {
	0: 'Gốc (0)',
	1: 'Cấp 1',
	2: 'Cấp 2',
};

const CATEGORY_FORM_SCROLL_ORDER = ['cf-name', 'cf-sort'] as const;

export function ProductCategoriesAdminPanel() {
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();
	const isAdmin = currentUser?.role === 'ADMIN';

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<ProductCategoryListSortKey>('sortOrder');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [pageSize, setPageSize] = React.useState(10);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminProductCategoryRow['status']>('all');
	const [levelFilter, setLevelFilter] = React.useState<'all' | 0 | 1 | 2>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } =
		usePaginatedProductCategoryList(listCategories, qInput, sortBy, sortOrder, pageSize, statusFilter, levelFilter);

	const [lookupRows, setLookupRows] = React.useState<AdminProductCategoryRow[]>([]);

	const reloadLookup = React.useCallback(() => {
		void fetchAllProductCategories({
			status: 'all',
			sortBy: 'name',
			sortOrder: 'asc',
		})
			.then(setLookupRows)
			.catch(() => {});
	}, []);

	React.useEffect(() => {
		reloadLookup();
	}, [reloadLookup]);

	const nameById = React.useMemo(() => {
		const m = new Map<string, string>();
		for (const c of lookupRows) m.set(c.id, c.name);
		return m;
	}, [lookupRows]);

	// Drawer chỉ dùng cho TẠO MỚI — sửa danh mục đã chuyển sang trang detail
	// (`/products/categories/:id`) với pattern inline-edit như product-detail.
	const [createOpen, setCreateOpen] = React.useState(false);
	const [formSlug, setFormSlug] = React.useState('');
	const [formName, setFormName] = React.useState('');
	const [formDescription, setFormDescription] = React.useState('');
	const [formImage, setFormImage] = React.useState('');
	const [formParentId, setFormParentId] = React.useState<string>('__root__');
	const [formStatus, setFormStatus] = React.useState<AdminProductCategoryRow['status']>('ACTIVE');
	const [formSortOrder, setFormSortOrder] = React.useState('0');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});
	const [uploadBusy, setUploadBusy] = React.useState(false);

	const [deleteTarget, setDeleteTarget] = React.useState<AdminProductCategoryRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	const parentChoices = React.useMemo(() => parentChoicesForCategoryForm(lookupRows, null), [lookupRows]);

	function openCreate() {
		setFormSlug('');
		setFormName('');
		setFormDescription('');
		setFormImage('');
		setFormParentId('__root__');
		setFormStatus('ACTIVE');
		setFormSortOrder('0');
		setFormError(null);
		setFieldErrors({});
		setCreateOpen(true);
		reloadLookup();
	}

	function openDetail(row: AdminProductCategoryRow) {
		navigate(`/products/categories/${row.id}`);
	}

	function parseOptionalInt(raw: string): number | null {
		const t = raw.trim();
		if (!t) return null;
		const n = Number(t);
		return Number.isFinite(n) ? Math.trunc(n) : null;
	}

	async function submitCreate() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};
		if (!formName.trim()) err['cf-name'] = 'Nhập tên danh mục';
		const sortOrderN = parseOptionalInt(formSortOrder);
		if (formSortOrder.trim() === '' || sortOrderN == null || sortOrderN < 0) {
			err['cf-sort'] = 'Nhập thứ tự (số ≥ 0)';
		}
		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(CATEGORY_FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});

		const sortOrderFinal = sortOrderN as number;
		const parentId = formParentId === '__root__' ? null : formParentId;
		const imageTrim = formImage.trim() || null;

		try {
			const created = await createProductCategory({
				...(formSlug.trim() ? { slug: formSlug.trim() } : {}),
				name: formName.trim(),
				description: formDescription.trim() || null,
				image: imageTrim,
				parentId,
				status: formStatus,
				sortOrder: sortOrderFinal,
			});
			toast.success('Tạo danh mục thành công');
			upsertRow(created, { prependOnInsert: page === 0 });
			reloadLookup();
			setCreateOpen(false);
			if (page !== 0) {
				await refetch({ page: 0, silent: true });
			} else {
				await refetch({ silent: true });
			}
		} catch (e) {
			const message = e instanceof AuthApiError ? e.message : 'Tạo danh mục thất bại';
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

			await toast.promise(deleteProductCategory(deletedId), {
				loading: 'Đang xóa…',
				success: 'đã xóa danh mục',
				error: 'Xóa thất bại',
			});
			removeRow(deletedId);
			reloadLookup();
			if (shouldGoPrevPage) {
				await refetch({ page: page - 1, silent: true });
			} else {
				await refetch({ silent: true });
			}
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
					<h1 className='text-lg font-semibold tracking-tight'>Danh mục sản phẩm</h1>
					<p className='text-muted-foreground text-sm'>Click một danh mục để xem chi tiết và chỉnh sửa.</p>
				</div>
				<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
					<PlusIcon className='size-4' />
					Thêm danh mục
				</Button>
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='cat-q'
						name='category-search'
						placeholder='Tên, slug, mô tả…'
						value={qInput}
						onChange={e => setQInput(e.target.value)}
						autoComplete='off'
						spellCheck={false}
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
						<SelectTrigger className='w-40'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='all'>Mọi trạng thái</SelectItem>
								<SelectItem value='DRAFT'>Nháp</SelectItem>
								<SelectItem value='ACTIVE'>Đang hiển thị</SelectItem>
								<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select
						value={String(levelFilter)}
						onValueChange={v => setLevelFilter(v === 'all' ? 'all' : (Number(v) as 0 | 1 | 2))}
					>
						<SelectTrigger className='w-36'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='all'>Mọi cấp</SelectItem>
								<SelectItem value='0'>Cấp 0</SelectItem>
								<SelectItem value='1'>Cấp 1</SelectItem>
								<SelectItem value='2'>Cấp 2</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={v => setSortBy(v as ProductCategoryListSortKey)}>
						<SelectTrigger className='w-40'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='sortOrder'>Thứ tự</SelectItem>
								<SelectItem value='createdAt'>Ngày tạo</SelectItem>
								<SelectItem value='name'>Tên</SelectItem>
								<SelectItem value='level'>Cấp</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
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
					<Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
						<SelectTrigger className='w-24'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{[10, 20, 50, 100].map(n => (
									<SelectItem key={n} value={String(n)}>
										{n}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='overflow-hidden rounded-lg border bg-background'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<div className='flex items-center justify-center'>
									<GripVerticalIcon className='text-muted-foreground size-4' />
								</div>
							</TableHead>
							<TableHead className='w-14'>Ảnh</TableHead>
							<TableHead>Tên</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead className='w-24'>Cấp</TableHead>
							<TableHead>Danh mục cha</TableHead>
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
									onClick={() => openDetail(row)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											openDetail(row);
										}
									}}
								>
									<TableCell>
										<div
											className='flex items-center justify-center'
											onClick={e => e.stopPropagation()}
										>
											<GripVerticalIcon className='text-muted-foreground size-4' />
										</div>
									</TableCell>
									<TableCell>
										{row.image ? (
											<img
												src={publicAssetUrl(row.image)}
												alt=''
												className='size-10 rounded-md border border-border object-cover'
												loading='lazy'
											/>
										) : (
											<span className='text-muted-foreground block size-10 rounded-md border border-dashed border-border text-center text-[10px] leading-10'>
												—
											</span>
										)}
									</TableCell>
									<TableCell className='max-w-0 truncate font-medium' title={row.name}>
										{row.name}
									</TableCell>
									<TableCell className='text-muted-foreground font-mono text-sm'>
										{row.slug}
									</TableCell>
									<TableCell className='text-sm'>{LEVEL_LABEL[row.level] ?? row.level}</TableCell>
									<TableCell className='text-muted-foreground text-sm'>
										{row.parentId
											? (nameById.get(row.parentId) ?? row.parentId.slice(0, 8) + '…')
											: '—'}
									</TableCell>
									<TableCell>
										<Badge variant={CONTENT_STATUS_BADGE[row.status]}>
											{STATUS_LABEL[row.status]}
										</Badge>
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
													aria-label='Thao tác'
													onClick={e => e.stopPropagation()}
												>
													<EllipsisVerticalIcon className='size-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='end'
												className='w-48'
												onClick={e => e.stopPropagation()}
											>
												<DropdownMenuItem onClick={() => openDetail(row)}>
													<ArrowUpRight className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={async () => {
														try {
															const r = await publishProductCategory(row.id);
															upsertRow(r);
															reloadLookup();
															toast.success('đã xuất bản');
														} catch (e) {
															toast.error(
																e instanceof AuthApiError ? e.message : 'Thất bại'
															);
														}
													}}
												>
													<Send className='size-4' />
													Xuất bản
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={async () => {
														try {
															const r = await archiveProductCategory(row.id);
															upsertRow(r);
															reloadLookup();
															toast.success('đã lưu trữ');
														} catch (e) {
															toast.error(
																e instanceof AuthApiError ? e.message : 'Thất bại'
															);
														}
													}}
												>
													<Archive className='size-4' />
													Lưu trữ
												</DropdownMenuItem>
												{isAdmin ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant='destructive'
															onClick={() => {
																setDeleteTarget(row);
															}}
														>
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
					Hiển thị {total === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} / {total}
				</span>
				<div className='flex items-center gap-2'>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page <= 0}
						onClick={() => setPage(p => Math.max(0, p - 1))}
					>
						<ChevronLeftIcon className='size-4' />
					</Button>
					<span>
						Trang {page + 1} / {pageCount}
					</span>
					<Button
						type='button'
						variant='outline'
						size='icon'
						className='size-8'
						disabled={page + 1 >= pageCount}
						onClick={() => setPage(p => p + 1)}
					>
						<ChevronRightIcon className='size-4' />
					</Button>
				</div>
			</div>

			<Drawer open={createOpen} onOpenChange={setCreateOpen} modal shouldScaleBackground={false}>
				<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
					<DrawerHeader className='shrink-0 border-b px-6 py-5 pr-16 text-left'>
						<DrawerTitle>Danh mục mới</DrawerTitle>
						<DrawerDescription className='mt-1.5 max-w-2xl'>
							Slug để trống sẽ tự sinh từ tên. Cấp được tính theo danh mục cha (tối đa cấp 2). Sau khi tạo
							xong bạn có thể vào trang chi tiết để chỉnh sửa thông tin và quản lý sản phẩm.
						</DrawerDescription>
					</DrawerHeader>

					<div className='min-h-0 flex-1 overflow-y-auto'>
						<div className='mx-auto w-full max-w-6xl px-6 py-6 pb-8'>
							{formError ? (
								<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>
									{formError}
								</p>
							) : null}

							<FieldGroup className='flex flex-col gap-8'>
								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Nhận diện
									</p>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='cf-name'>Tên</FieldLabel>
											<Input
												id='cf-name'
												className={cn('mt-1.5', fieldErrors['cf-name'] && 'border-destructive')}
												value={formName}
												onChange={e => {
													setFormName(e.target.value);
													stripFieldError(setFieldErrors, 'cf-name');
												}}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['cf-name'])}
											/>
											{fieldErrors['cf-name'] ? (
												<p className='text-destructive mt-1 text-sm'>
													{fieldErrors['cf-name']}
												</p>
											) : null}
										</Field>
										<Field>
											<FieldLabel htmlFor='cf-slug'>Slug (tuỳ chọn)</FieldLabel>
											<Input
												id='cf-slug'
												className='mt-1.5'
												value={formSlug}
												onChange={e => setFormSlug(e.target.value)}
												disabled={formBusy}
												autoComplete='off'
												placeholder='Để trống để tự sinh'
											/>
										</Field>
									</div>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Phân cấp
									</p>
									<p className='text-muted-foreground text-xs'>
										Chọn danh mục cha (chỉ cấp 0–1 có thể làm cha).
									</p>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='cf-parent'>Danh mục cha</FieldLabel>
											<Select
												value={formParentId}
												onValueChange={setFormParentId}
												disabled={formBusy}
											>
												<SelectTrigger id='cf-parent' className='mt-1.5 w-full'>
													<SelectValue placeholder='Chọn danh mục cha' />
												</SelectTrigger>
												<SelectContent className='max-h-72'>
													<SelectItem value='__root__'>(Không — cấp gốc)</SelectItem>
													{parentChoices.map(c => (
														<SelectItem key={c.id} value={c.id}>
															<span className='text-muted-foreground mr-1.5 font-mono text-[10px]'>
																{LEVEL_LABEL[c.level]}
															</span>
															{`${'—'.repeat(c.level)} ${c.name}`}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</Field>
										<Field>
											<FieldLabel htmlFor='cf-sort'>Thứ tự hiển thị</FieldLabel>
											<Input
												id='cf-sort'
												inputMode='numeric'
												pattern='[0-9]*'
												className={cn(
													'mt-1.5 w-full lg:max-w-none',
													fieldErrors['cf-sort'] && 'border-destructive'
												)}
												value={formSortOrder}
												onChange={e => {
													setFormSortOrder(digitsOnly(e.target.value));
													stripFieldError(setFieldErrors, 'cf-sort');
												}}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['cf-sort'])}
											/>
											{fieldErrors['cf-sort'] ? (
												<p className='text-destructive mt-1 text-sm'>
													{fieldErrors['cf-sort']}
												</p>
											) : null}
										</Field>
									</div>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Nội dung
									</p>
									<div className='flex flex-col gap-6'>
										<Field>
											<FieldLabel htmlFor='cf-desc'>Mô tả</FieldLabel>
											<Textarea
												id='cf-desc'
												className='mt-1.5 min-h-40 w-full'
												value={formDescription}
												onChange={e => setFormDescription(e.target.value)}
												disabled={formBusy}
												rows={6}
											/>
										</Field>
										<Field>
											<FieldLabel>Ảnh đại diện (tối đa 1)</FieldLabel>
											<div className='mt-1.5 w-full'>
												<SingleImageUrlDropzone
													label={
														formImage.trim()
															? 'Kéo thả hoặc bấm để thay ảnh'
															: 'Kéo thả hoặc bấm để chọn ảnh'
													}
													hint='JPEG, PNG, WebP, GIF, SVG'
													url={formImage}
													disabled={formBusy}
													uploadBusy={uploadBusy}
													hasError={Boolean(fieldErrors['cf-image'])}
													onUploadFile={async file => {
														setUploadBusy(true);
														try {
															const { url } = await uploadProductImage(file);
															setFormImage(url);
															stripFieldError(setFieldErrors, 'cf-image');
															toast.success('đã tải ảnh lên');
														} catch (e) {
															toast.error(
																e instanceof AuthApiError
																	? e.message
																	: 'Tải ảnh thất bại'
															);
														} finally {
															setUploadBusy(false);
														}
													}}
												/>
												{fieldErrors['cf-image'] ? (
													<p className='text-destructive mt-1 text-sm'>
														{fieldErrors['cf-image']}
													</p>
												) : null}
											</div>
										</Field>
									</div>
								</section>

								<section className='space-y-4'>
									<p className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
										Trạng thái
									</p>
									<Field>
										<FieldLabel>Trạng thái</FieldLabel>
										<Select
											value={formStatus}
											onValueChange={v => setFormStatus(v as AdminProductCategoryRow['status'])}
											disabled={formBusy}
										>
											<SelectTrigger id='cf-status' className='mt-1.5'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='DRAFT'>Nháp</SelectItem>
												<SelectItem value='ACTIVE'>Đang hiển thị</SelectItem>
												<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								</section>
							</FieldGroup>
						</div>
					</div>

					<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
						<div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 sm:flex-row sm:justify-end'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setCreateOpen(false)}
								disabled={formBusy}
							>
								Hủy
							</Button>
							<Button type='button' onClick={() => void submitCreate()} disabled={formBusy}>
								{formBusy ? 'Đang tạo…' : 'Tạo danh mục'}
							</Button>
						</div>
					</DrawerFooter>
				</DrawerPageContent>
			</Drawer>

			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
						<AlertDialogDescription>
							Chỉ xóa được khi không còn danh mục con.{' '}
							<span className='font-medium text-foreground'>{deleteTarget?.name}</span> sẽ bị xóa vĩnh
							viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction disabled={deleteBusy} onClick={() => void confirmDelete()}>
							{deleteBusy ? 'Đang xóa…' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
