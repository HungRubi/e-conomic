import * as React from 'react';

import { useNavigate } from 'react-router-dom';

import {
	archiveProduct,
	createProduct,
	deleteProduct,
	fetchProducts,
	publishProduct,
	uploadProductImage,
	type AdminProductRow,
} from '@/api/admin-products';
import { fetchAllProductCategories, type AdminProductCategoryRow } from '@/api/admin-product-categories';
import { fetchProductMaterials, type AdminProductMaterialRow } from '@/api/admin-product-materials';
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import {
	assignableLeafCategories,
	categoryBreadcrumb,
	productParentChildFromLeaf,
} from '@/lib/product-category-helpers';
import { ProductImagesEditor, type ProductImageEntry } from '@/components/products/product-images-editor';
import { MaterialPickerDialog } from '@/components/products/material-picker-dialog';
import { MultiSelectCombobox } from '@/components/ui/multi-select-combobox';
import {
	digitsOnly,
	type FieldErrorMap,
	scrollToFirstFieldError,
	stripFieldError,
} from '@/lib/form-field-ui';
import { cn } from '@/lib/utils';
import { GripVerticalIcon, Archive, AlertCircleIcon, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, ImageIcon, PencilLine, PlusIcon, Send, Trash2, XIcon } from 'lucide-react';
import { toast } from 'sonner';

const listProducts = (params: Parameters<typeof fetchProducts>[0]) => fetchProducts(params);

/** Thứ tự cuộn tới lỗi đầu tiên (trường id phần tử trong form). */
const PRODUCT_FORM_SCROLL_ORDER = [
	'pf-name',
	'pf-accent',
	'pf-images',
	'pf-category',
	'pf-price',
	'pf-sort',
	'pf-materials',
] as const;

const MIN_BEAD_COUNT = 10;

type CreateVariantDraft = {
	key: string;
	name: string;
	color: string;
	colorHex: string;
	image: string;
	priceVnd: string;
	stockQuantity: string;
	sortOrder: number;
};

let variantKeyCounter = 0;
function createEmptyVariantDraft(sortOrder: number): CreateVariantDraft {
	variantKeyCounter += 1;
	return {
		key: `v-${variantKeyCounter}`,
		name: '',
		color: '',
		colorHex: '',
		image: '',
		priceVnd: '',
		stockQuantity: '',
		sortOrder,
	};
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

function randomSoldSeed(): number {
	return Math.floor(Math.random() * 16) + 5;
}

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
		const handle = window.setTimeout(() => {
			setQInput(qDraft);
		}, 500);
		return () => window.clearTimeout(handle);
	}, [qDraft]);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [formSlug, setFormSlug] = React.useState('');
	const [formName, setFormName] = React.useState('');
	const [formCategoryIds, setFormCategoryIds] = React.useState<string[]>([]);
	const [categoryLookupRows, setCategoryLookupRows] = React.useState<AdminProductCategoryRow[]>([]);
	const [formAccent, setFormAccent] = React.useState('');
	const [formDescription, setFormDescription] = React.useState('');
	const [formDetailTitle, setFormDetailTitle] = React.useState('');
	const [formPrice, setFormPrice] = React.useState('');
	
	const [formSortOrder, setFormSortOrder] = React.useState('0');
	const [formMedia, setFormMedia] = React.useState<ProductImageEntry[]>([]);
	const [formStatus, setFormStatus] = React.useState<AdminProductRow['status']>('DRAFT');
	const [formType, setFormType] = React.useState<AdminProductRow['type']>('PHYSICAL');
	const [formIsBracelet, setFormIsBracelet] = React.useState(false);
	const [formCustom, setFormCustom] = React.useState(false);
	const [materialRows, setMaterialRows] = React.useState<AdminProductMaterialRow[]>([]);
	const [selectedMaterialIds, setSelectedMaterialIds] = React.useState<string[]>([]);
	const [beadPickerOpen, setBeadPickerOpen] = React.useState(false);
	const [hasVariants, setHasVariants] = React.useState(false);
	const [variantDrafts, setVariantDrafts] = React.useState<CreateVariantDraft[]>([]);

	/** Tự tính tổng giá từ các hạt đã chọn cho sản phẩm custom, ghi đè formPrice. */
	React.useEffect(() => {
		if (!formCustom || selectedMaterialIds.length < MIN_BEAD_COUNT) return;
		const sum = selectedMaterialIds
			.map(id => materialRows.find(m => m.id === id))
			.filter((m): m is AdminProductMaterialRow => Boolean(m))
			.reduce((a, m) => a + m.priceVnd, 0);
		if (sum > 0) setFormPrice(String(sum));
	}, [formCustom, selectedMaterialIds, materialRows]);
	const [advancedOpen, setAdvancedOpen] = React.useState(false);
	const [formCareTips, setFormCareTips] = React.useState('');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});

	const [deleteTarget, setDeleteTarget] = React.useState<AdminProductRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	const reloadCategoryLookup = React.useCallback(() => {
		void fetchAllProductCategories({
			status: 'all',
			sortBy: 'name',
			sortOrder: 'asc',
		})
			.then(setCategoryLookupRows)
			.catch(() => {});
	}, []);
	const reloadMaterialLookup = React.useCallback(() => {
		void fetchProductMaterials({
			limit: 500,
			offset: 0,
			status: 'all',
			kind: 'all',
			sortBy: 'name',
			sortOrder: 'asc',
		})
			.then(res => setMaterialRows(res.items.filter(i => i.status !== 'ARCHIVED')))
			.catch(() => {});
	}, []);

	React.useEffect(() => {
		reloadCategoryLookup();
		reloadMaterialLookup();
	}, [reloadCategoryLookup, reloadMaterialLookup]);

	const leafChoices = React.useMemo(() => assignableLeafCategories(categoryLookupRows), [categoryLookupRows]);

	const selectedLeaves = React.useMemo(
		() =>
			formCategoryIds
				.map(id => categoryLookupRows.find(c => c.id === id))
				.filter((c): c is AdminProductCategoryRow => Boolean(c)),
		[categoryLookupRows, formCategoryIds]
	);

	/** Danh mục chính = lá đầu tiên trong danh sách đã chọn để suy ra parent/child hiển thị web. */
	const primaryLeaf = selectedLeaves[0];

	const resolvedParentChild = React.useMemo(() => {
		if (!primaryLeaf) return { parent: '', child: '' };
		return productParentChildFromLeaf(primaryLeaf, categoryLookupRows);
	}, [primaryLeaf, categoryLookupRows]);

	const slugPreview = React.useMemo(() => {
		const trimmed = formSlug.trim();
		if (trimmed) return trimmed;
		const generated = slugifyVi(formName);
		return generated || 'đ';
	}, [formSlug, formName]);

	/** Trạng thái hoàn thành mới được quyết định dot xanh/xám trong nav và đầm việc còn thiếu trong save button. */
	const stepStatus = React.useMemo(() => {
		const priceVal = formPrice.trim() && Number(formPrice) >= 0;
		const beadsOk = !formCustom || selectedMaterialIds.length >= MIN_BEAD_COUNT;
		const pricingOk = hasVariants
			? variantDrafts.length > 0 && variantDrafts.every(v => {
					const p = Number(v.priceVnd);
					return v.priceVnd.trim() !== '' && Number.isFinite(p) && p >= 0;
				})
			: Boolean(priceVal);
		return {
			basics: Boolean(formName.trim()) && formCategoryIds.length > 0,
			images: formMedia.length > 0 && Boolean(formMedia[0]?.url.trim()),
			pricing: pricingOk,
			content: Boolean(formDescription.trim()),
			variants: beadsOk,
		};
	}, [formName, formCategoryIds, formMedia, formPrice, formDescription, formCustom, selectedMaterialIds, hasVariants, variantDrafts]);

	const missingCount = Object.values(stepStatus).filter(v => !v).length;

	function openCreate() {
		setFormSlug('');
		setFormName('');
		setFormCategoryIds([]);
		setFormAccent('');
		setFormDescription('');
		setFormDetailTitle('');
		setFormPrice('');
		setFormSortOrder('0');
		setFormMedia([]);
		setFormStatus('DRAFT');
		setFormType('PHYSICAL');
		setFormIsBracelet(false);
		setFormCustom(false);
		setSelectedMaterialIds([]);
		setFormCareTips('');
		setFormError(null);
		setFieldErrors({});
		setAdvancedOpen(false);
		setHasVariants(false);
		setVariantDrafts([]);
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
		if (formMedia.length === 0 || !formMedia[0]?.url.trim()) err['pf-images'] = 'Thêm đt nhạt một ảnh';
		const chosenLeaves = formCategoryIds
			.map(id => categoryLookupRows.find(c => c.id === id))
			.filter((c): c is AdminProductCategoryRow => Boolean(c));
		if (formCategoryIds.length === 0) err['pf-category'] = 'Chọn ít nhất một danh mục';
		else if (chosenLeaves.length !== formCategoryIds.length)
			err['pf-category'] = 'Có danh mục không còn hợp lệ để chọn lại';

		let priceVal: number | null = null;
		if (hasVariants) {
			if (variantDrafts.length === 0) {
				err['pf-price'] = 'Thêm ít nhất một biến thể';
			} else {
				for (let i = 0; i < variantDrafts.length; i++) {
					const v = variantDrafts[i];
					const p = parseOptionalInt(v.priceVnd);
					if (p == null || p < 0) {
						err['pf-price'] = 'Biến thể #' + (i + 1) + ': giá không hợp lệ';
						break;
					}
				}
			}
			if (Object.keys(err).length === 0) {
				priceVal = Math.min(...variantDrafts.map(v => Number(parseOptionalInt(v.priceVnd)!)));
			}
		} else {
			priceVal = parseOptionalInt(formPrice);
			if (formPrice.trim() === '' || priceVal == null || priceVal < 0) {
				err['pf-price'] = 'Nhập giá (số, VND)';
			}
		}
		
		const sortOrder = parseOptionalInt(formSortOrder);
		if (sortOrder == null || sortOrder < 0) err['pf-sort'] = 'Nhập thứ tự (số ≥ 0)';

		if (formCustom && selectedMaterialIds.length < MIN_BEAD_COUNT) {
			err['pf-materials'] = `Sản phẩm custom cần đt nhạt ${MIN_BEAD_COUNT} hạt`;
		}

			if (!formAccent.trim()) err['pf-accent'] = 'Nhập điểm nhấn';
			if (formAccent.includes('\n')) err['pf-accent'] = 'Không được xuống dòng';
			if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(PRODUCT_FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});

		if (chosenLeaves.length === 0) {
			setFormBusy(false);
			return;
		}

		const sold = randomSoldSeed();
		// Lđ đầu tiđn = danh m?c chọnh ? suy ra parent/child hi?n th? web (giá tđđng thđch storefront).
		const { parent: parentStr, child: childStr } = productParentChildFromLeaf(chosenLeaves[0], categoryLookupRows);
		const categorySlugs = chosenLeaves.map(c => c.slug);
		const userImageUrls = formMedia.map(m => m.url.trim()).filter(Boolean);

		const careTips = formCareTips
			.split('\n')
			.map(s => s.trim())
			.filter(Boolean);

		const selectedMaterials = selectedMaterialIds
			.map(id => materialRows.find(m => m.id === id))
			.filter((m): m is AdminProductMaterialRow => Boolean(m));
		const components = selectedMaterials.map(m => ({
			materialId: m.id,
			name: m.name,
			amountVnd: m.priceVnd,
			image: m.image ?? undefined,
			quantity: 1,
			unitPriceVnd: m.priceVnd,
		}));

		// Ch? dđng Ảnh do user upload đ Ảnh hạt (t? material) không đđược tr?n vào
		// product.images[] đã trênh hi?n th? sai trên gallery. Ảnh hạt đã đđược g?i
		// riđng qua components[].imageSnapshot ? priceDetailGems ? ProductBraceletPriceDetail.
		const imageUrls = userImageUrls;
		const primaryImage = imageUrls[0];

		try {
			const created = await createProduct({
				...(formSlug.trim() ? { slug: formSlug.trim() } : {}),
				name: formName.trim(),
				parent: parentStr,
				child: childStr,
				categorySlugs,
				accent: formAccent.trim(),
				description: formDescription.trim(),
				detailTitle: formDetailTitle.trim(),
				priceVnd: priceVal!,
				sold,
				image: primaryImage,
				status: formStatus,
				type: formType,
				custom: formCustom,
				isBracelet: formIsBracelet,
				sortOrder: sortOrder!,
				careTips,
				images: imageUrls.map(url => ({ url, alt: formName.trim() })),
				components: formCustom ? components : [],
				...(hasVariants
					? {
						variants: variantDrafts.map((v, idx) => ({
							name: v.name.trim() || null,
							color: v.color.trim() || null,
							colorHex: v.colorHex.trim() || null,
							image: v.image.trim() || null,
							priceVnd: Math.trunc(Number(v.priceVnd)),
							stockQuantity: parseOptionalInt(v.stockQuantity) ?? undefined,
							sortOrder: idx,
						})),
					}
				: {}),
			});
			toast.success('Tạo sản phẩm thành công');
			upsertRow(created, { prependOnInsert: page === 0 });
			setDrawerOpen(false);
			if (page !== 0) {
				await refetch({ page: 0, silent: true });
			}
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
			if (shouldGoPrevPage) {
				await refetch({ page: page - 1, silent: true });
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
					<h1 className='text-lg font-semibold tracking-tight'>Sản phẩm</h1>
					<p className='text-muted-foreground text-sm'>
						CRUD qua API server; ảnh lưu tại <span className='font-medium text-foreground'>/upload</span>{' '}
						trên API.
					</p>
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
						placeholder='Tên, mô tả, tiêu đề chi tiết'
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
									<SelectItem value='DRAFT'>Nhập</SelectItem>
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
									<SelectItem value='sold'>đã bán</SelectItem>
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
										<SelectItem key={n} value={String(n)}>
											{n}
										</SelectItem>
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
									<TableCell className='max-w-0 truncate font-medium' title={row.name}>{row.name}</TableCell>
									<TableCell className='text-muted-foreground text-sm'>
											{row.categories && row.categories.length > 0 ? (
												<div className='flex items-center gap-1 min-w-0'>
													<Badge variant='secondary' className='max-w-[140px] truncate font-normal sm:max-w-[200px]'>
														{row.categories[0].name}
													</Badge>
													{row.categories.length > 1 ? (
														<span className='text-muted-foreground shrink-0 text-[11px]'>+{row.categories.length - 1}</span>
													) : null}
												</div>
											) : (
												<span className='truncate text-xs text-muted-foreground'>
													{row.parent} / {row.child}
												</span>
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
													aria-label='Mở thao tác sản phẩm'
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
												<DropdownMenuItem onClick={() => navigate(`/products/${row.id}`)}>
													<PencilLine className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={async () => {
														try {
															const r = await publishProduct(row.id);
															upsertRow(r);
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
															const r = await archiveProduct(row.id);
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
					Hiển thị {total === 0 ? 0 : page * pageSize + 1} – {Math.min((page + 1) * pageSize, total)} / {total}
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

			<Drawer open={drawerOpen} onOpenChange={setDrawerOpen} modal shouldScaleBackground={false}>
				<DrawerPageContent className='flex flex-col gap-0 p-0' showCloseButton>
					<DrawerHeader className='shrink-0 border-b px-6 py-4 pr-24 text-left'>
						<div className='flex items-center justify-between gap-3'>
							<div>
								<DrawerTitle className='text-base'>Sản phẩm mới</DrawerTitle>
								<DrawerDescription className='mt-0.5 text-xs'>
									{slugPreview !== 'đ' ? (
										<>
											Slug: <span className='font-mono text-foreground'>{slugPreview}</span>
										</>
									) : (
										'Bắt đầu bằng tên sản phẩm để hệ thống tự sinh slug.'
									)}
								</DrawerDescription>
							</div>
							{missingCount > 0 ? (
								<Badge variant='outline' className='gap-1 text-[11px]'>
									<AlertCircleIcon className='size-3' aria-hidden />
									Cần {missingCount} bước
								</Badge>
							) : (
								<Badge variant='success' className='text-[11px]'>
									Sẵn sàng lưu
								</Badge>
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
							<SectionDivider done={stepStatus.content} />
							<SectionLink
								index={5}
								href='#sec-variants'
								label='Hạt'
								done={stepStatus.variants}
								optional={!formCustom}
							/>
							<SectionDivider done={stepStatus.variants} />
							<SectionLink index={6} href='#sec-advanced' label='Nâng cao' done optional />
						</div>
					</nav>

					<div className='min-h-0 flex-1 overflow-y-auto'>
						<div className='mx-auto w-full max-w-6xl px-6 py-6 pb-8'>
							{formError ? (
								<p className='text-destructive bg-destructive/10 mb-6 rounded-md px-3 py-2 text-sm'>
									{formError}
								</p>
							) : null}

							<FieldGroup className='flex flex-col divide-y divide-border/60'>
								<section
									id='sec-basics'
									className='scroll-mt-4 space-y-4 pb-8'
								>
									<SectionHeader index={1} title='Cơ bản' hint='Tên + danh mục là 2 trường bắt buộc đầu tiên.' />
									<div className='grid gap-4 lg:grid-cols-2'>
										<Field>
											<FieldLabel htmlFor='pf-name'>Tên sản phẩm</FieldLabel>
											<Input
												id='pf-name'
												value={formName}
												onChange={e => {
													setFormName(e.target.value);
													stripFieldError(setFieldErrors, 'pf-name');
												}}
												disabled={formBusy}
												aria-invalid={Boolean(fieldErrors['pf-name'])}
												className={cn(fieldErrors['pf-name'] && 'border-destructive')}
												placeholder='Vòng tay thạch anh hồng'
											/>
											{fieldErrors['pf-name'] ? (
												<p className='text-destructive mt-1 text-xs'>{fieldErrors['pf-name']}</p>
											) : (
												<p className='mt-1 text-[11px] text-muted-foreground'>
													Slug tự sinh: <span className='font-mono'>{slugPreview}</span>{' '}
													<button
														type='button'
														className='ml-1 underline-offset-2 hover:underline'
														onClick={() => setAdvancedOpen(true)}
													>
														chỉnh tay
													</button>
												</p>
											)}
										</Field>
										<Field>
											<FieldLabel htmlFor='pf-category'>Danh mục</FieldLabel>
											<div
												id='pf-category'
												aria-invalid={Boolean(fieldErrors['pf-category'])}
												className={cn(
													'rounded-md',
													fieldErrors['pf-category'] && 'ring-1 ring-destructive'
												)}
											>
												<MultiSelectCombobox
													options={leafChoices.map(leaf => ({
														value: leaf.id,
														label: categoryBreadcrumb(leaf, categoryLookupRows),
													}))}
													selectedValues={formCategoryIds}
													onSelectedChange={values => {
														setFormCategoryIds(values);
														stripFieldError(setFieldErrors, 'pf-category');
													}}
													placeholder='Chọn danh mục'
													searchPlaceholder='Tìm danh mục'
													emptyText={leafChoices.length === 0 ? 'Chưa có danh mục lá khô dùng.' : 'Không tìm thấy danh mục phù hợp.'}
													disabled={formBusy}
												/>
											</div>
											{fieldErrors['pf-category'] ? (
												<p className='text-destructive mt-1 text-xs'>{fieldErrors['pf-category']}</p>
											) : primaryLeaf ? (
												<p className='mt-1 text-[11px] text-muted-foreground'>
													Hiển thị web: <span className='font-medium text-foreground'>{resolvedParentChild.parent} đ {resolvedParentChild.child}</span>
													{selectedLeaves.length > 1 ? <span className='ml-1'>({selectedLeaves.length} danh mục)</span> : null}
												</p>
											) : null}
										</Field>
									</div>
								</section>

								<section
									id='sec-images'
									className='scroll-mt-4 space-y-4 py-8'
								>
									<SectionHeader index={2} title='Ảnh sản phẩm' hint='Ảnh đầu tiên hiển thị trên thẻ sản phẩm.' />
									<ProductImagesEditor
										entries={formMedia}
										onEntriesChange={next => {
											setFormMedia(next);
											stripFieldError(setFieldErrors, 'pf-images');
										}}
										fieldError={fieldErrors['pf-images']}
										disabled={formBusy}
									/>
								</section>

								<section
									id='sec-pricing'
									className='scroll-mt-4 space-y-4 py-8'
								>
									<div className='grid gap-4 lg:grid-cols-1'>
										<Field>
											<FieldLabel htmlFor='pf-has-variants'>Có biến thể (nhiều màu sắc/kích thước)</FieldLabel>
											<div className='flex items-center gap-3'>
												<button
													id='pf-has-variants'
													type='button'
													role='switch'
													aria-checked={hasVariants}
													onClick={() => {
														const next = !hasVariants;
														setHasVariants(next);
														if (next && variantDrafts.length === 0) {
															setVariantDrafts([createEmptyVariantDraft(0)]);
														}
													}}
													disabled={formBusy}
													className={cn(
														'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
														hasVariants ? 'bg-primary' : 'bg-input'
													)}
												>
													<span
														className={cn(
															'pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out',
															hasVariants ? 'translate-x-5' : 'translate-x-0'
														)}
													/>
												</button>
												<span className='text-sm text-muted-foreground'>
													{hasVariants
														? 'Bật - sản phẩm có nhiều phiên bản giá khác nhau'
														: 'Tắt - một giá duy nhất'}
												</span>
											</div>
											<p className='mt-1 text-[11px] text-muted-foreground'>
												Bật để thêm các biến thể màu sắc/kích thước với giá riêng. Khi có biến thể, giá sản phẩm sẽ hiển thị dạng khoảng (vd. 35.000₫ - 89.000₫). Có thể nhập tồn kho riêng cho từng biến thể.
											</p>
										</Field>
									</div>

									{/* Conditionally show single price + type, or variant rows */}
									{!hasVariants ? (
										<div className='grid gap-4 lg:grid-cols-3'>
											<Field>
												<FieldLabel htmlFor='pf-price'>Giá (VND)</FieldLabel>
												<Input
													id='pf-price'
													inputMode='numeric'
													pattern='[0-9]*'
													value={formPrice}
													onChange={e => { setFormPrice(digitsOnly(e.target.value)); stripFieldError(setFieldErrors, 'pf-price');
													}}
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
												<FieldLabel htmlFor='pf-type'>Loại sản phẩm</FieldLabel>
												<Select
													value={formType}
													onValueChange={v => setFormType(v as AdminProductRow['type'])}
													disabled={formBusy}
												>
													<SelectTrigger id='pf-type'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='PHYSICAL'>Vật lý</SelectItem>
														<SelectItem value='SERVICE'>Dịch vụ</SelectItem>
														<SelectItem value='CUSTOM_DESIGN'>Thiết kế riêng</SelectItem>
													</SelectContent>
												</Select>
											</Field>
										</div>
									) : (
										<div className='space-y-3'>
											<div className='rounded-md border border-border/60 bg-background'>
												<div className='flex items-center justify-between border-b border-border/60 px-3 py-2'>
													<span className='text-xs font-medium'>
														Danh sách biến thể ({variantDrafts.length})
													</span>
													<Button
														type='button'
														variant='outline'
														size='sm'
														className='h-7 gap-1 px-2 text-xs'
														onClick={() => setVariantDrafts(prev => [...prev, createEmptyVariantDraft(prev.length)])}
														disabled={formBusy}
													>
														<PlusIcon className='size-3.5' />
														Thêm biến thể
													</Button>
												</div>
												{variantDrafts.length === 0 ? (
													<p className='px-3 py-6 text-center text-xs text-muted-foreground'>
														Chưa có biến thể nào. Nhấn "Thêm biến thể" để bắt đầu.
													</p>
												) : (
													<div className='divide-y divide-border/60'>
														{variantDrafts.map((draft) => (
															<CreateVariantRow
																key={draft.key}
																draft={draft}
																onUpdate={patch => setVariantDrafts(prev =>
																	prev.map(d => d.key === draft.key ? { ...d, ...patch } : d)
																)}
																onRemove={() => setVariantDrafts(prev =>
																	prev.filter(d => d.key !== draft.key)
																)}
																canRemove={variantDrafts.length > 1}
																disabled={formBusy}
															/>
														))}
													</div>
												)}
											</div>
											{fieldErrors['pf-price'] ? (
												<p className='text-destructive text-xs'>{fieldErrors['pf-price']}</p>
											) : null}
										</div>
									)}

									<div className='grid gap-4 lg:grid-cols-1'>
										<Field>
											<FieldLabel htmlFor='pf-custom'>
												Sản phẩm custom
											</FieldLabel>
											<div className='flex items-center gap-3'>
												<button
													id='pf-custom'
													type='button'
													role='switch'
													aria-checked={formCustom}
													onClick={() => {
														const next = !formCustom;
														setFormCustom(next);
														if (!next) stripFieldError(setFieldErrors, 'pf-materials');
													}}
													disabled={formBusy}
													className={cn(
														'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
														formCustom ? 'bg-primary' : 'bg-input'
													)}
													aria-label='Bật/tắt chế độ custom'
												>
													<span
														className={cn(
															'pointer-events-none block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out',
															formCustom ? 'translate-x-5' : 'translate-x-0'
														)}
													/>
												</button>
												<span className='text-sm text-muted-foreground'>
													{formCustom
														? 'Bật - shop tạo mẫu, khách có thể yêu cầu thiết kế riêng'
														: 'Tắt - sản phẩm bán sẵn'
													}
												</span>
											</div>
											<p className='mt-1 text-[11px] text-muted-foreground'>
												Bật: shop tạo sản phẩm mẫu - khách mua sẵn hoặc yêu cầu thiết kế riêng theo ý thích. Kết hợp mục "Hạt" để chọn chất liệu.
											</p>
										</Field>
									</div>
								</section>

								<section
									id='sec-content'
									className='scroll-mt-4 space-y-4 py-8'
								>
									<SectionHeader index={4} title='Nội dung & chăm sóc' hint='Mô tả ngắn hiển thị ở trang chi tiết, mẹo chăm sóc xuất hiện dưới ảnh.' />
									<Field>
										<FieldLabel htmlFor='pf-detail'>Tiêu đề chi tiết</FieldLabel>
										<Input
											id='pf-detail'
											value={formDetailTitle}
											onChange={e => setFormDetailTitle(e.target.value)}
											disabled={formBusy}
											placeholder='Ví dụ: Vòng tay thanh tẩy năng lượng'
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pf-desc'>Mô tả</FieldLabel>
										<Textarea
											id='pf-desc'
											value={formDescription}
											onChange={e => setFormDescription(e.target.value)}
											disabled={formBusy}
											rows={5}
											className='block min-h-28 w-full resize-y'
											placeholder='Vài câu giới thiệu nguồn gốc, ý nghĩa hoặc cảm hứng'
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='pf-care'>Mẹo chăm sóc (mỗi dòng một mẹo)</FieldLabel>
										<Textarea
											id='pf-care'
											value={formCareTips}
											onChange={e => setFormCareTips(e.target.value)}
											disabled={formBusy}
											rows={4}
											className='block min-h-24 w-full resize-y'
											placeholder={'Ví dụ:\nKhông để gần nước hoa\nLau bằng khăn mềm khô'}
										/>
									</Field>
								</section>

								{formCustom ? (
									<section
										id='sec-variants'
										className='scroll-mt-4 space-y-4 py-8'
									>
										<SectionHeader
											index={5}
											title={`Hạt cho sản phẩm custom`}
											hint={`Chọn ít nhất ${MIN_BEAD_COUNT} hạt để ảnh các hạt sẽ tự động thêm vào ảnh sản phẩm.`}
										/>
										<MaterialPickerSummary
											materials={materialRows}
											selectedIds={selectedMaterialIds}
											onOpenPicker={() => setBeadPickerOpen(true)}
											onClear={() => {
												setSelectedMaterialIds([]);
												stripFieldError(setFieldErrors, 'pf-materials');
											}}
											onRemoveOne={id => {
												setSelectedMaterialIds(prev => prev.filter(x => x !== id));
											}}
											disabled={formBusy}
											min={MIN_BEAD_COUNT}
											hasError={Boolean(fieldErrors['pf-materials'])}
										/>
										{fieldErrors['pf-materials'] ? (
											<p className='text-destructive text-xs'>{fieldErrors['pf-materials']}</p>
										) : null}
									</section>
								) : null}

								<section
									id='sec-advanced'
									className='scroll-mt-4 space-y-3 pt-8'
								>
									<button
										type='button'
										onClick={() => setAdvancedOpen(prev => !prev)}
										className='-ml-2 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-muted/40'
										aria-expanded={advancedOpen}
									>
										<ChevronDownIcon
											className={cn(
												'size-4 text-muted-foreground transition-transform',
												advancedOpen && 'rotate-180'
											)}
											aria-hidden
										/>
										<span className='font-medium tracking-tight'>Cài đặt nâng cao</span>
										<span className='text-[11px] text-muted-foreground'>Slug, accent, thứ tự, trạng thái</span>
									</button>
									{advancedOpen ? (
										<div className='space-y-4 pt-2'>
											<div className='grid gap-4 lg:grid-cols-2'>
												<Field>
													<FieldLabel htmlFor='pf-slug'>Slug (URL)</FieldLabel>
													<Input
														id='pf-slug'
														value={formSlug}
														onChange={e => setFormSlug(e.target.value)}
														disabled={formBusy}
														autoComplete='off'
														placeholder={slugifyVi(formName) || 'tu-sinh-tu-ten'}
														className='font-mono'
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor='pf-accent'>điểm nhấn (accent)</FieldLabel>
													<Input
														id='pf-accent'
														value={formAccent}
														onChange={e => setFormAccent(e.target.value)}
														disabled={formBusy}
														placeholder='Câu nhấn ngắn ở thẻ sản phẩm'
														aria-invalid={Boolean(fieldErrors['pf-accent'])}
														className={cn(fieldErrors['pf-accent'] && 'border-destructive')}
													/>
													{fieldErrors['pf-accent'] ? (
														<p className='text-destructive mt-1 text-sm'>{fieldErrors['pf-accent']}</p>
													) : null}
												</Field>
											</div>
											<div className='grid gap-4 lg:grid-cols-2'>
												<Field>
													<FieldLabel htmlFor='pf-status'>Trạng thái khi tạo</FieldLabel>
													<Select
														value={formStatus}
														onValueChange={v => setFormStatus(v as AdminProductRow['status'])}
														disabled={formBusy}
													>
														<SelectTrigger id='pf-status'>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='DRAFT'>Nháp để chưa hiển thị trên web</SelectItem>
															<SelectItem value='ACTIVE'>Đang bán</SelectItem>
															<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
														</SelectContent>
													</Select>
												</Field>
												<Field>
													<FieldLabel htmlFor='pf-sort'>Thứ tự hiển thị</FieldLabel>
													<Input
														id='pf-sort'
														inputMode='numeric'
														pattern='[0-9]*'
														className={cn(fieldErrors['pf-sort'] && 'border-destructive')}
														value={formSortOrder}
														onChange={e => {
															setFormSortOrder(digitsOnly(e.target.value));
															stripFieldError(setFieldErrors, 'pf-sort');
														}}
														disabled={formBusy}
														aria-invalid={Boolean(fieldErrors['pf-sort'])}
														placeholder='0'
													/>
													{fieldErrors['pf-sort'] ? (
														<p className='text-destructive mt-1 text-xs'>{fieldErrors['pf-sort']}</p>
													) : (
														<p className='mt-1 text-[11px] text-muted-foreground'>
															Số nhỏ hơn hiển thị trước trong danh mục.
														</p>
													)}
												</Field>
											</div>
										</div>
									) : null}
								</section>
							</FieldGroup>
						</div>
					</div>

					<DrawerFooter className='mt-auto shrink-0 border-t px-0 py-0'>
						<div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-3 sm:flex-row sm:items-center sm:justify-between'>
							<div className='flex items-center gap-2 text-xs text-muted-foreground'>
								<span>Trạng thái khi tạo:</span>
								<Badge variant={CONTENT_STATUS_BADGE[formStatus]} className='text-[11px]'>
									{STATUS_LABEL[formStatus]}
								</Badge>
								{missingCount > 0 ? (
									<span className='hidden sm:inline'>còn {missingCount} bước chưa hoàn thành</span>
								) : null}
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

			<MaterialPickerDialog
				open={beadPickerOpen}
				onOpenChange={setBeadPickerOpen}
				materials={materialRows}
				initialSelectedIds={selectedMaterialIds}
				minSelected={MIN_BEAD_COUNT}
				onConfirm={ids => {
					setSelectedMaterialIds(ids);
					stripFieldError(setFieldErrors, 'pf-materials');
				}}
			/>

			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Sản phẩm{' '}
							<span className='font-medium text-foreground'>{deleteTarget?.name}</span> số b? xóa vẢnh
							vi?n.
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

function SectionHeader({
	index,
	title,
	hint,
}: {
	index?: number;
	title: string;
	hint?: string;
}) {
	return (
		<div className='flex items-baseline gap-2'>
			{index != null ? (
				<span
					aria-hidden
					className='text-[11px] font-semibold tabular-nums text-muted-foreground/70'
				>
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
				<span
					className={cn(
						'transition-all duration-300',
						completed ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
					)}
				>
					{index}
				</span>
				<CheckIcon
					className={cn(
						'absolute size-3 transition-all duration-300',
						completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
					)}
				/>
			</span>
			<span className='text-xs font-medium tracking-tight'>{label}</span>
			{optional ? (
				<span className='text-[10px] font-normal text-muted-foreground/60'>đ Tùy chọn</span>
			) : null}
		</a>
	);
}

function SectionDivider({ done }: { done: boolean }) {
	return (
		<span
			aria-hidden
			className={cn(
				'mx-1 h-px w-4 shrink-0 transition-colors duration-300 sm:w-6',
				done ? 'bg-emerald-500/60' : 'bg-border'
			)}
		/>
	);
}

function CreateVariantRow({
	draft,
	onUpdate,
	onRemove,
	canRemove,
	disabled,
}: {
	draft: CreateVariantDraft;
	onUpdate: (patch: Partial<CreateVariantDraft>) => void;
	onRemove: () => void;
	canRemove: boolean;
	disabled?: boolean;
}) {
	const [uploading, setUploading] = React.useState(false);
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const { url } = await uploadProductImage(file);
			onUpdate({ image: url });
		} catch {
			toast.error('Upload anh that bai');
		} finally {
			setUploading(false);
			if (inputRef.current) inputRef.current.value = '';
		}
	}

	return (
		<div className='flex flex-wrap items-end gap-2 px-3 py-2 sm:flex-nowrap'>
			<div className='shrink-0'>
				<button type='button' onClick={() => inputRef.current?.click()} disabled={disabled || uploading} className='flex size-10 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/30 hover:bg-muted/60 disabled:opacity-50'>
					{uploading ? (
						<span className='size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent' />
					) : draft.image ? (
						<img src={draft.image} alt='' className='size-full object-cover' loading='lazy' />
					) : (
						<ImageIcon className='size-4 text-muted-foreground' />
					)}
				</button>
				<input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={handleFilePick} />
			</div>
			<Input placeholder='Ten (VD: Size M)' value={draft.name} onChange={e => onUpdate({ name: e.target.value })} disabled={disabled} className='h-9 min-w-0 flex-1 text-xs' />
			<Input placeholder='Mau (VD: Hong)' value={draft.color} onChange={e => onUpdate({ color: e.target.value })} disabled={disabled} className='h-9 min-w-0 flex-1 text-xs' />
			<div className='flex items-center gap-1'>
				<Input placeholder='#hex' value={draft.colorHex} onChange={e => onUpdate({ colorHex: e.target.value })} disabled={disabled} className='h-9 w-24 font-mono text-xs' />
				{draft.colorHex && /^#[0-9a-f]{6}$/i.test(draft.colorHex) && (
					<span className='inline-block size-5 shrink-0 rounded border' style={{ backgroundColor: draft.colorHex }} />
				)}
			</div>
			<Input placeholder='Gia VND' inputMode='numeric' pattern='[0-9]*' value={draft.priceVnd} onChange={e => onUpdate({ priceVnd: digitsOnly(e.target.value) })} disabled={disabled} className='h-9 w-28 text-xs' />
			<Input placeholder='Ton kho' inputMode='numeric' pattern='[0-9]*' value={draft.stockQuantity} onChange={e => onUpdate({ stockQuantity: digitsOnly(e.target.value) })} disabled={disabled} className='h-9 w-20 text-xs' />
			<Button type='button' variant='ghost' size='icon' className='size-9 shrink-0' onClick={onRemove} disabled={disabled || !canRemove}>
				<Trash2 className='size-4 text-destructive' />
			</Button>
		</div>
	);
}

function MaterialPickerSummary({
	materials,
	selectedIds,
	onOpenPicker,
	onClear,
	onRemoveOne,
	disabled,
	min,
	hasError,
}: {
	materials: AdminProductMaterialRow[];
	selectedIds: string[];
	onOpenPicker: () => void;
	onClear: () => void;
	onRemoveOne: (id: string) => void;
	disabled?: boolean;
	min: number;
	hasError?: boolean;
}) {
	const selected = selectedIds
		.map(id => materials.find(m => m.id === id))
		.filter((m): m is AdminProductMaterialRow => Boolean(m));
	const totalVnd = selected.reduce((sum, m) => sum + m.priceVnd, 0);

	return (
		<div
			id='pf-materials'
			className={cn(
				'rounded-md border bg-background',
				hasError ? 'border-destructive' : 'border-border/60'
			)}
			aria-invalid={hasError}
		>
			<div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-3 py-2'>
				<div className='flex items-center gap-2 text-xs'>
					<Badge
						variant={selected.length >= min ? 'success' : 'outline'}
						className='tabular-nums'
					>
						{selected.length}/{min}
					</Badge>
					{selected.length > 0 ? (
						<span className='text-muted-foreground tabular-nums'>
							Tổng: <span className='font-medium text-foreground'>{totalVnd.toLocaleString('vi-VN')}đ</span>
						</span>
					) : (
						<span className='text-muted-foreground'>Chưa chọn hạt nào</span>
					)}
				</div>
				<div className='flex items-center gap-1.5'>
					{selected.length > 0 ? (
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='h-7 px-2 text-xs'
							onClick={onClear}
							disabled={disabled}
						>
							Bỏ chọn tất cả
						</Button>
					) : null}
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='h-7 gap-1 px-2 text-xs'
						onClick={onOpenPicker}
						disabled={disabled}
					>
						<PlusIcon className='size-3.5' />
						{selected.length > 0 ? 'Chỉnh sửa' : 'Mở danh sách hạt'}
					</Button>
				</div>
			</div>

			{selected.length === 0 ? (
				<button
					type='button'
					onClick={onOpenPicker}
					disabled={disabled}
					className='flex w-full items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60'
				>
					<PlusIcon className='size-4' />
					Mở danh sách hạt đã chọn
				</button>
			) : (
				<ul className='grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4'>
					{selected.map((m, idx) => (
						<li
							key={m.id}
							className='group relative flex items-center gap-2.5 rounded-md border border-border/60 bg-background px-2 py-1.5 transition-colors hover:border-foreground/40 hover:bg-muted/30'
						>
							<span className='inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold tabular-nums text-background'>
								{idx + 1}
							</span>
							<img
								src={publicAssetUrl(m.image || '/images/logo.png')}
								alt=''
								className='size-9 shrink-0 rounded object-cover'
								loading='lazy'
							/>
							<div className='min-w-0 flex-1'>
								<p className='line-clamp-1 text-[13px] font-medium leading-snug tracking-tight'>
									{m.name}
								</p>
								<p className='text-[11px] tabular-nums text-muted-foreground'>
									{m.priceVnd.toLocaleString('vi-VN')}đ
								</p>
							</div>
							<button
								type='button'
								onClick={() => onRemoveOne(m.id)}
								disabled={disabled}
								aria-label={`Xóa hạt ${m.name}`}
								className={cn(
									'absolute -right-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all duration-200',
									'opacity-0 group-hover:opacity-100 hover:scale-110 hover:border-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100',
									'disabled:pointer-events-none disabled:opacity-0'
								)}
							>
								<XIcon className='size-3' />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

