import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { uploadProductImage } from '@/api/admin-products';
import {
	createProductMaterial,
	deleteProductMaterial,
	fetchProductMaterials,
	updateProductMaterial,
	type AdminProductMaterialRow,
} from '@/api/admin-product-materials';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { AuthApiError } from '@/auth/auth-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEntityCrud } from '@/hooks/use-permission';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { cn } from '@/lib/utils';
import {
	usePaginatedProductMaterialList,
	type ProductMaterialListSortKey,
} from '@/hooks/use-paginated-product-material-list';
import { digitsOnly, type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { fmtUserDate } from '@/components/users/user-table-shared';
import {
	Archive,
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	EllipsisVerticalIcon,
	PlusIcon,
	Trash2,
} from 'lucide-react';

const listMaterials = (params: Parameters<typeof fetchProductMaterials>[0]) => fetchProductMaterials(params);

export function ProductMaterialsAdminPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('productMaterials');

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<ProductMaterialListSortKey>('name');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [pageSize, setPageSize] = React.useState(20);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminProductMaterialRow['status']>('all');
	const [kindFilter, setKindFilter] = React.useState<'all' | AdminProductMaterialRow['kind']>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } =
		usePaginatedProductMaterialList(listMaterials, qInput, sortBy, sortOrder, pageSize, statusFilter, kindFilter);

	// Drawer chỉ dành cho TẠO MỚI — sửa đã chuyển sang trang detail.
	const [createOpen, setCreateOpen] = React.useState(false);
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});
	const [uploadBusy, setUploadBusy] = React.useState(false);
	const [formName, setFormName] = React.useState('');
	const [formPriceVnd, setFormPriceVnd] = React.useState('');
	const [formImage, setFormImage] = React.useState('');
	const [formSizeMm, setFormSizeMm] = React.useState('');
	const [formDisplaySize, setFormDisplaySize] = React.useState('');
	const [formKind, setFormKind] = React.useState<AdminProductMaterialRow['kind']>('STONE');
	const [formStatus, setFormStatus] = React.useState<AdminProductMaterialRow['status']>('ACTIVE');
	const [formDesignerCode, setFormDesignerCode] = React.useState('');
	const [formDesignerCategory, setFormDesignerCategory] = React.useState('');

	function openCreate() {
		setFormError(null);
		setFieldErrors({});
		setFormName('');
		setFormPriceVnd('');
		setFormImage('');
		setFormSizeMm('');
		setFormDisplaySize('');
		setFormKind('STONE');
		setFormStatus('ACTIVE');
		setFormDesignerCode('');
		setFormDesignerCategory('');
		setCreateOpen(true);
	}

	function openDetail(row: AdminProductMaterialRow) {
		navigate(`/products/decorative-stones/${row.id}`);
	}

	async function submitCreate() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};
		if (!formName.trim()) err['mf-name'] = 'Nhập tên đá/hạt';
		const priceN = Number(formPriceVnd.trim());
		if (formPriceVnd.trim() === '' || !Number.isFinite(priceN) || priceN < 0)
			err['mf-price'] = 'Nhập giá (VND ≥ 0)';
		const sizeN = formSizeMm.trim() ? Number(formSizeMm.trim()) : null;
		if (formSizeMm.trim() !== '' && (sizeN == null || !Number.isFinite(sizeN) || sizeN < 0))
			err['mf-size'] = 'Kích thước (mm) không hợp lệ';
		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(['mf-name', 'mf-price'] as const, err);
			return;
		}
		setFieldErrors({});

		const sizeMmRaw = sizeN != null ? Math.trunc(sizeN) : null;
		const priceVnd = Math.trunc(priceN);

		try {
			const body = {
				name: formName.trim(),
				priceVnd,
				image: formImage.trim() || null,
				sizeMm: sizeMmRaw,
				displaySize: formDisplaySize.trim() || null,
				kind: formKind,
				status: formStatus,
				designerCode: formDesignerCode.trim() || null,
				designerCategory: formDesignerCategory.trim() || null,
			};
			const created = await createProductMaterial(body as never);
			toast.success('Tạo đá trang trí thành công');
			upsertRow(created);
			setCreateOpen(false);
			if (page !== 0) {
				await refetch({ page: 0, silent: true });
			} else {
				await refetch({ silent: true });
			}
		} catch (e) {
			const message = e instanceof AuthApiError ? e.message : 'Thao tác thất bại';
			setFormError(message);
			toast.error(message);
		} finally {
			setFormBusy(false);
		}
	}

	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
	const [deleteTarget, setDeleteTarget] = React.useState<AdminProductMaterialRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);
	const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
	const [bulkDeleteBusy, setBulkDeleteBusy] = React.useState(false);

	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const pageIds = rows.map(r => r.id);
	const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
	const somePageSelected = !allPageSelected && pageIds.some(id => selectedIds.has(id));

	function togglePageSelection(checked: boolean) {
		setSelectedIds(prev => {
			const next = new Set(prev);
			for (const id of pageIds) {
				if (checked) next.add(id);
				else next.delete(id);
			}
			return next;
		});
	}

	function toggleRowSelection(id: string, checked: boolean) {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	async function confirmDelete() {
		if (!crud.canDelete || !deleteTarget) return;
		setDeleteBusy(true);
		try {
			const deletedId = deleteTarget.id;
			const isLastRowOnPage = rows.length === 1;
			const shouldGoPrevPage = isLastRowOnPage && page > 0;

			await toast.promise(deleteProductMaterial(deletedId), {
				loading: 'Đang xóa…',
				success: 'đã xóa đá trang trí',
				error: 'Xóa thất bại',
			});
			removeRow(deletedId);
			setSelectedIds(prev => {
				if (!prev.has(deletedId)) return prev;
				const next = new Set(prev);
				next.delete(deletedId);
				return next;
			});
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

	const selectedRows = rows.filter(r => selectedIds.has(r.id));

	async function confirmBulkDelete() {
		if (!crud.canDelete || selectedIds.size === 0) return;
		setBulkDeleteBusy(true);
		try {
			const ids = Array.from(selectedIds);
			const isLastRowOnPage = rows.length === ids.length;
			const shouldGoPrevPage = isLastRowOnPage && page > 0;

			await toast.promise(Promise.all(ids.map(id => deleteProductMaterial(id))), {
				loading: 'Đang xóa…',
				success: `đã xóa ${ids.length} đá trang trí`,
				error: 'Xóa thất bại',
			});
			for (const id of ids) removeRow(id);
			setSelectedIds(new Set());
			setBulkDeleteOpen(false);
			if (shouldGoPrevPage) {
				await refetch({ page: page - 1, silent: true });
			} else {
				await refetch({ silent: true });
			}
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Xóa thất bại');
		} finally {
			setBulkDeleteBusy(false);
		}
	}

	return (
		<div className='dashboard-fade-in flex min-h-0 flex-1 flex-col gap-4'>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Đá trang trí</h1>
					<p className='text-muted-foreground text-sm'>Click một đá để mở chi tiết và chỉnh sửa.</p>
				</div>
				{crud.canCreate ? (
					<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
						<PlusIcon className='size-4' />
						Thêm đá
					</Button>
				) : null}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='pm-q'
						name='product-material-search'
						placeholder='Tìm theo tên / slug / mã thiết kế…'
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
								<SelectItem value='ACTIVE'>Đang dùng</SelectItem>
								<SelectItem value='DRAFT'>Nháp</SelectItem>
								<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select value={kindFilter} onValueChange={v => setKindFilter(v as typeof kindFilter)}>
						<SelectTrigger className='w-40'>
							<SelectValue placeholder='Loại' />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='all'>Mọi loại</SelectItem>
								<SelectItem value='STONE'>Đá</SelectItem>
								<SelectItem value='BEAD'>Hạt</SelectItem>
								<SelectItem value='CHARM'>Charm</SelectItem>
								<SelectItem value='ACCESSORY'>Phụ kiện</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select value={sortBy} onValueChange={v => setSortBy(v as ProductMaterialListSortKey)}>
						<SelectTrigger className='w-40'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value='name'>Tên</SelectItem>
								<SelectItem value='createdAt'>Ngày tạo</SelectItem>
								<SelectItem value='priceVnd'>Giá</SelectItem>
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
								{[20, 50, 100, 200].map(n => (
									<SelectItem key={n} value={String(n)}>
										{n}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
			</div>

			{selectedIds.size > 0 && crud.canDelete ? (
				<div className='flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5'>
					<span className='text-sm font-medium'>
						Đã chọn <span className='text-destructive font-semibold'>{selectedIds.size}</span> đá
					</span>
					<div className='ml-auto flex items-center gap-2'>
						<Button type='button' variant='outline' size='sm' onClick={() => setSelectedIds(new Set())}>
							Bỏ chọn
						</Button>
						<Button
							type='button'
							variant='destructive'
							size='sm'
							className='gap-1.5'
							onClick={() => setBulkDeleteOpen(true)}
						>
							<Trash2 className='size-4' />
							Xóa {selectedIds.size} đá
						</Button>
					</div>
				</div>
			) : null}

			<div className='overflow-hidden rounded-lg border bg-background'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<div className='flex items-center justify-center'>
									<Checkbox
										checked={allPageSelected || (somePageSelected ? 'indeterminate' : false)}
										onCheckedChange={v => togglePageSelection(Boolean(v))}
										aria-label='Chọn tất cả trên trang'
									/>
								</div>
							</TableHead>
							<TableHead>Ảnh</TableHead>
							<TableHead>Tên</TableHead>
							<TableHead>Loại</TableHead>
							<TableHead>Kích thước</TableHead>
							<TableHead>Giá</TableHead>
							<TableHead>Mã</TableHead>
							<TableHead className='text-muted-foreground hidden md:table-cell'>Cập nhật</TableHead>
							<TableHead className='text-right'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRowsSkeleton rows={6} columns={9} />
						) : error ? (
							<TableErrorStateRow colSpan={9} message={error} onRetry={() => void refetch()} />
						) : rows.length === 0 ? (
							<TableEmptyStateRow colSpan={9} />
						) : (
							rows.map(row => (
								<TableRow
									key={row.id}
									className='dashboard-row-enter cursor-pointer'
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
											<Checkbox
												checked={selectedIds.has(row.id)}
												onCheckedChange={v => toggleRowSelection(row.id, Boolean(v))}
												aria-label={`Chọn ${row.name}`}
											/>
										</div>
									</TableCell>
									<TableCell>
										<img
											src={publicAssetUrl(row.image ?? '/images/logo.png')}
											alt=''
											className='size-10 rounded-full border border-border object-cover'
											loading='lazy'
										/>
									</TableCell>
									<TableCell className='max-w-0 truncate font-medium' title={row.name}>
										{row.name}
									</TableCell>
									<TableCell className='text-muted-foreground text-sm'>{row.kind}</TableCell>
									<TableCell className='text-muted-foreground text-sm'>
										{row.displaySize ?? (row.sizeMm ? `${row.sizeMm}mm` : '—')}
									</TableCell>
									<TableCell className='text-sm'>{row.priceVnd.toLocaleString('vi-VN')}₫</TableCell>
									<TableCell className='text-muted-foreground text-sm'>
										{row.designerCode ?? '—'}
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
												{crud.canUpdate ? (
													<DropdownMenuItem
														onClick={async () => {
															try {
																const r = await updateProductMaterial(row.id, {
																	status: 'ARCHIVED',
																});
																upsertRow(r);
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
												) : null}
												{crud.canDelete ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant='destructive'
															onClick={() => setDeleteTarget(row)}
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

			<Drawer
				open={createOpen}
				onOpenChange={open => !formBusy && setCreateOpen(open)}
				modal
				shouldScaleBackground={false}
			>
				<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
					<DrawerHeader className='shrink-0 border-b px-6 py-5 pr-16 text-left'>
						<DrawerTitle>Thêm đá trang trí</DrawerTitle>
						<DrawerDescription className='mt-1.5 max-w-2xl'>
							Sau khi tạo bạn có thể mở chi tiết để chỉnh sửa từng trường inline.
						</DrawerDescription>
					</DrawerHeader>

					<div className='min-h-0 flex-1 overflow-y-auto'>
						<div className='mx-auto w-full max-w-4xl px-6 py-6 pb-8'>
							{formError ? (
								<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>
									{formError}
								</p>
							) : null}
							<FieldGroup className='flex flex-col gap-6'>
								<section className='space-y-4'>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='mf-name'>Tên</FieldLabel>
											<Input
												id='mf-name'
												value={formName}
												onChange={e => setFormName(e.target.value)}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['mf-name'])}
												className={cn(fieldErrors['mf-name'] && 'border-destructive')}
											/>
											{fieldErrors['mf-name'] ? (
												<p className='text-destructive mt-1 text-xs'>
													{fieldErrors['mf-name']}
												</p>
											) : null}
										</Field>
										<Field>
											<FieldLabel htmlFor='mf-price'>Giá (VND)</FieldLabel>
											<Input
												id='mf-price'
												inputMode='numeric'
												pattern='[0-9]*'
												value={formPriceVnd}
												onChange={e => {
													setFormPriceVnd(digitsOnly(e.target.value));
													stripFieldError(setFieldErrors, 'mf-price');
												}}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['mf-price'])}
												className={cn(fieldErrors['mf-price'] && 'border-destructive')}
											/>
											{fieldErrors['mf-price'] ? (
												<p className='text-destructive mt-1 text-xs'>
													{fieldErrors['mf-price']}
												</p>
											) : null}
										</Field>
									</div>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='pm-kind'>Loại</FieldLabel>
											<Select
												value={formKind}
												onValueChange={v => setFormKind(v as AdminProductMaterialRow['kind'])}
												disabled={formBusy}
											>
												<SelectTrigger id='pm-kind'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='STONE'>Đá</SelectItem>
													<SelectItem value='BEAD'>Hạt</SelectItem>
													<SelectItem value='CHARM'>Charm</SelectItem>
													<SelectItem value='ACCESSORY'>Phụ kiện</SelectItem>
												</SelectContent>
											</Select>
										</Field>
										<Field>
											<FieldLabel htmlFor='pm-status'>Trạng thái</FieldLabel>
											<Select
												value={formStatus}
												onValueChange={v =>
													setFormStatus(v as AdminProductMaterialRow['status'])
												}
												disabled={formBusy}
											>
												<SelectTrigger id='pm-status'>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='ACTIVE'>Đang dùng</SelectItem>
													<SelectItem value='DRAFT'>Nháp</SelectItem>
													<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
												</SelectContent>
											</Select>
										</Field>
									</div>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='mf-size'>Kích thước (mm)</FieldLabel>
											<Input
												id='mf-size'
												inputMode='numeric'
												pattern='[0-9]*'
												value={formSizeMm}
												onChange={e => {
													setFormSizeMm(digitsOnly(e.target.value));
													stripFieldError(setFieldErrors, 'mf-size');
												}}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['mf-size'])}
												className={cn(fieldErrors['mf-size'] && 'border-destructive')}
											/>
											{fieldErrors['mf-size'] ? (
												<p className='text-destructive mt-1 text-xs'>
													{fieldErrors['mf-size']}
												</p>
											) : null}
										</Field>
										<Field>
											<FieldLabel htmlFor='pm-display-size'>Nhãn kích thước</FieldLabel>
											<Input
												id='pm-display-size'
												value={formDisplaySize}
												onChange={e => setFormDisplaySize(e.target.value)}
												disabled={formBusy}
												placeholder='Ví dụ: 8mm'
											/>
										</Field>
									</div>
									<Field>
										<FieldLabel>Ảnh (tối đa 1)</FieldLabel>
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
												onUploadFile={async file => {
													setUploadBusy(true);
													try {
														const { url } = await uploadProductImage(file);
														setFormImage(url);
														toast.success('đã tải ảnh lên');
													} catch (e) {
														toast.error(
															e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại'
														);
													} finally {
														setUploadBusy(false);
													}
												}}
											/>
										</div>
									</Field>
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='pm-code'>Mã thiết kế</FieldLabel>
											<Input
												id='pm-code'
												value={formDesignerCode}
												onChange={e => setFormDesignerCode(e.target.value)}
												disabled={formBusy}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor='pm-cat'>Nhóm thiết kế</FieldLabel>
											<Input
												id='pm-cat'
												value={formDesignerCategory}
												onChange={e => setFormDesignerCategory(e.target.value)}
												disabled={formBusy}
												placeholder='sphere / defaultPendant / ...'
											/>
										</Field>
									</div>
								</section>
							</FieldGroup>
						</div>
					</div>

					<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
						<div className='mx-auto flex w-full max-w-4xl flex-col gap-2 px-6 py-4 sm:flex-row sm:justify-end'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setCreateOpen(false)}
								disabled={formBusy}
							>
								Hủy
							</Button>
							<Button type='button' onClick={() => void submitCreate()} disabled={formBusy}>
								{formBusy ? 'Đang tạo…' : 'Tạo đá'}
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
						<AlertDialogTitle>Xóa đá trang trí?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác.{' '}
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

			<AlertDialog open={bulkDeleteOpen} onOpenChange={open => !bulkDeleteBusy && setBulkDeleteOpen(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa {selectedIds.size} đá trang trí?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Các đá sau sẽ bị xóa vĩnh viễn:
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className='max-h-48 space-y-1 overflow-y-auto rounded-md bg-muted/30 px-3 py-2 text-sm'>
						{selectedRows.length > 0
							? selectedRows.slice(0, 20).map(r => (
									<div key={r.id} className='flex items-center gap-2 py-0.5'>
										<span className='text-muted-foreground'>•</span>
										<span className='font-medium'>{r.name}</span>
										{r.designerCode ? (
											<span className='ml-auto font-mono text-xs text-muted-foreground'>
												{r.designerCode}
											</span>
										) : null}
									</div>
								))
							: null}
						{selectedIds.size > 20 ? (
							<p className='text-muted-foreground pt-1 text-xs'>...và {selectedIds.size - 20} đá khác</p>
						) : null}
					</div>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={bulkDeleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={bulkDeleteBusy}
							onClick={() => void confirmBulkDelete()}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{bulkDeleteBusy ? 'Đang xóa…' : `Xóa ${selectedIds.size} đá`}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
