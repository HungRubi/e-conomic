import * as React from 'react';
import {
	createPromotionDiscount,
	deletePromotionDiscount,
	fetchPromotionDiscounts,
	type AdminPromotionDiscountRow,
} from '@/api/admin-promotion-discounts';
import { fetchCampaigns } from '@/api/admin-campaigns';
import { fetchProducts } from '@/api/admin-products';
import { fetchAllProductCategories } from '@/api/admin-product-categories';
import { AuthApiError } from '@/auth/auth-api';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	usePaginatedPromotionDiscountList,
	type PromotionDiscountListSortKey,
} from '@/hooks/use-paginated-promotion-discount-list';
import { useEntityCrud } from '@/hooks/use-permission';
import { PromotionDiscountTable } from '@/components/promotion-discounts/promotion-discount-table';
import { PromotionDiscountFormDrawer } from '@/components/promotion-discounts/promotion-discount-form-drawer';
import { type ComboboxOption } from '@/components/ui/multi-select-combobox';
import { type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const listPromotionDiscounts = (params: Parameters<typeof fetchPromotionDiscounts>[0]) =>
	fetchPromotionDiscounts(params);

const FORM_SCROLL_ORDER = ['pd-title', 'pd-code', 'pd-banner', 'pd-type', 'pd-value', 'pd-applies-to'] as const;

function parseOptionalInt(raw: string): number | null {
	const t = raw.trim();
	if (!t) return null;
	const n = Number(t);
	return Number.isFinite(n) ? Math.trunc(n) : null;
}

export function PromotionDiscountsAdminPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('promotions');

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<PromotionDiscountListSortKey>('sortOrder');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [pageSize, setPageSize] = React.useState(10);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminPromotionDiscountRow['status']>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } =
		usePaginatedPromotionDiscountList(listPromotionDiscounts, qInput, sortBy, sortOrder, pageSize, statusFilter);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [formTitle, setFormTitle] = React.useState('');
	const [formCode, setFormCode] = React.useState('');
	const [formDescription, setFormDescription] = React.useState('');
	const [formBannerImageUrl, setFormBannerImageUrl] = React.useState('');
	const [formType, setFormType] = React.useState<'PERCENT' | 'FIXED_AMOUNT'>('PERCENT');
	const [formValue, setFormValue] = React.useState('');
	const [formMinOrderVnd, setFormMinOrderVnd] = React.useState('');
	const [formMaxDiscountVnd, setFormMaxDiscountVnd] = React.useState('');
	const [formUsageLimit, setFormUsageLimit] = React.useState('');
	const [formPerUserLimit, setFormPerUserLimit] = React.useState('');
	const [formAppliesTo, setFormAppliesTo] = React.useState<'ALL_PRODUCTS' | 'PRODUCTS' | 'CATEGORIES'>(
		'ALL_PRODUCTS'
	);
	const [formProductIds, setFormProductIds] = React.useState<string[]>([]);
	const [formCategoryIds, setFormCategoryIds] = React.useState<string[]>([]);
	const [formStartsAt, setFormStartsAt] = React.useState('');
	const [formEndsAt, setFormEndsAt] = React.useState('');
	const [formSortOrder, setFormSortOrder] = React.useState('0');
	const [formCtaLabel, setFormCtaLabel] = React.useState('');
	const [formCtaUrl, setFormCtaUrl] = React.useState('');
	const [formStatus, setFormStatus] = React.useState<AdminPromotionDiscountRow['status']>('DRAFT');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});
	const [formCampaignId, setFormCampaignId] = React.useState('');

	const [productOptions, setProductOptions] = React.useState<ComboboxOption[]>([]);
	const [categoryOptions, setCategoryOptions] = React.useState<ComboboxOption[]>([]);
	const [campaignOptions, setCampaignOptions] = React.useState<ComboboxOption[]>([]);

	const [deleteTarget, setDeleteTarget] = React.useState<AdminPromotionDiscountRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	React.useEffect(() => {
		void fetchProducts({ limit: 100, offset: 0 }).then(res => {
			setProductOptions(res.items.map(p => ({ value: p.id, label: p.name })));
		});
		void fetchAllProductCategories({ status: 'all', sortBy: 'name', sortOrder: 'asc' }).then(res => {
			setCategoryOptions(res.map(c => ({ value: c.id, label: c.name })));
		});
		void fetchCampaigns({ limit: 100, offset: 0, status: 'all', sortBy: 'createdAt', sortOrder: 'desc' }).then(
			res => {
				setCampaignOptions(res.items.map(c => ({ value: c.id, label: c.title })));
			}
		);
	}, []);

	function openCreate() {
		setFormTitle('');
		setFormCode('');
		setFormDescription('');
		setFormBannerImageUrl('');
		setFormType('PERCENT');
		setFormValue('');
		setFormMinOrderVnd('');
		setFormMaxDiscountVnd('');
		setFormUsageLimit('');
		setFormPerUserLimit('1');
		setFormAppliesTo('ALL_PRODUCTS');
		setFormProductIds([]);
		setFormCategoryIds([]);
		setFormStartsAt('');
		setFormEndsAt('');
		setFormSortOrder('0');
		setFormCtaLabel('');
		setFormCtaUrl('');
		setFormStatus('DRAFT');
		setFormCampaignId('');
		setFormError(null);
		setFieldErrors({});
		setDrawerOpen(true);
	}

	function openDetail(row: AdminPromotionDiscountRow) {
		navigate(`/promotions/${row.id}`);
	}

	async function submitForm() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};

		if (!formTitle.trim()) err['pd-title'] = 'Nhập tiêu đề';
		if (!formCode.trim()) err['pd-code'] = 'Nhập mã giảm giá';

		const value = parseOptionalInt(formValue);
		if (value == null || value <= 0) {
			err['pd-value'] = 'Nhập giá trị (số > 0)';
		}
		if (formType === 'PERCENT' && value != null && value > 100) {
			err['pd-value'] = 'Phần trăm không được vượt quá 100';
		}

		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});

		const minOrderVnd = parseOptionalInt(formMinOrderVnd);
		const maxDiscountVnd = parseOptionalInt(formMaxDiscountVnd);
		const usageLimit = parseOptionalInt(formUsageLimit);
		const perUserLimit = parseOptionalInt(formPerUserLimit) ?? 1;
		const sortOrder = parseOptionalInt(formSortOrder) ?? 0;

		const productIds = formAppliesTo === 'PRODUCTS' ? formProductIds : [];
		const categoryIds = formAppliesTo === 'CATEGORIES' ? formCategoryIds : [];

		const startsAt = formStartsAt.trim() ? new Date(formStartsAt).toISOString() : null;
		const endsAt = formEndsAt.trim() ? new Date(formEndsAt).toISOString() : null;

		try {
			const created = await createPromotionDiscount({
				title: formTitle.trim(),
				code: formCode.trim(),
				description: formDescription.trim() || undefined,
				bannerImageUrl: formBannerImageUrl.trim(),
				campaignId: formCampaignId || null,
				type: formType,
				value: value!,
				minOrderVnd,
				maxDiscountVnd,
				usageLimit,
				perUserLimit,
				appliesTo: formAppliesTo,
				productIds,
				categoryIds,
				startsAt,
				endsAt,
				sortOrder,
				ctaLabel: formCtaLabel.trim() || undefined,
				ctaUrl: formCtaUrl.trim() || undefined,
				status: formStatus,
			});
			toast.success('Tạo khuyến mãi thành công');
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
		if (!crud.canDelete || !deleteTarget) return;
		setDeleteBusy(true);
		try {
			const deletedId = deleteTarget.id;
			const isLastRowOnPage = rows.length === 1;
			const shouldGoPrevPage = isLastRowOnPage && page > 0;

			await toast.promise(deletePromotionDiscount(deletedId), {
				loading: 'Đang xóa khuyến mãi...',
				success: 'Xóa khuyến mãi thành công',
				error: 'Xóa khuyến mãi thất bại',
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
		<div className='dashboard-fade-in flex min-h-0 flex-1 flex-col gap-4'>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Khuyến mãi & Mã giảm giá</h1>
					<p className='text-muted-foreground text-sm'>Click một dòng để mở chi tiết và chỉnh sửa.</p>
				</div>
				{crud.canCreate ? (
					<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
						<PlusIcon className='size-4' />
						Thêm khuyến mãi
					</Button>
				) : null}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='pd-q'
						name='promotion-search'
						placeholder='Tiêu đề, mã, mô tả…'
						value={qInput}
						onChange={e => setQInput(e.target.value)}
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
									<SelectItem value='ACTIVE'>Hoạt động</SelectItem>
									<SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Select value={sortBy} onValueChange={v => setSortBy(v as PromotionDiscountListSortKey)}>
							<SelectTrigger className='w-44'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='sortOrder'>Thứ tự</SelectItem>
									<SelectItem value='createdAt'>Ngày tạo</SelectItem>
									<SelectItem value='title'>Tiêu đề</SelectItem>
									<SelectItem value='code'>Mã</SelectItem>
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

			<PromotionDiscountTable
				rows={rows}
				loading={loading}
				error={error}
				onOpenDetail={openDetail}
				onDelete={setDeleteTarget}
				onRetry={() => void refetch()}
				canDelete={crud.canDelete}
			/>

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

			<PromotionDiscountFormDrawer
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				editing={null}
				formBusy={formBusy}
				formError={formError}
				fieldErrors={fieldErrors}
				formTitle={formTitle}
				formCode={formCode}
				formDescription={formDescription}
				formBannerImageUrl={formBannerImageUrl}
				formType={formType}
				formValue={formValue}
				formMinOrderVnd={formMinOrderVnd}
				formMaxDiscountVnd={formMaxDiscountVnd}
				formUsageLimit={formUsageLimit}
				formPerUserLimit={formPerUserLimit}
				formAppliesTo={formAppliesTo}
				formProductIds={formProductIds}
				formCategoryIds={formCategoryIds}
				formStartsAt={formStartsAt}
				formEndsAt={formEndsAt}
				formSortOrder={formSortOrder}
				formCtaLabel={formCtaLabel}
				formCtaUrl={formCtaUrl}
				formStatus={formStatus}
				formCampaignId={formCampaignId}
				productOptions={productOptions}
				categoryOptions={categoryOptions}
				campaignOptions={campaignOptions}
				onFormTitleChange={setFormTitle}
				onFormCodeChange={setFormCode}
				onFormDescriptionChange={setFormDescription}
				onFormBannerImageUrlChange={setFormBannerImageUrl}
				onFormTypeChange={setFormType}
				onFormValueChange={setFormValue}
				onFormMinOrderVndChange={setFormMinOrderVnd}
				onFormMaxDiscountVndChange={setFormMaxDiscountVnd}
				onFormUsageLimitChange={setFormUsageLimit}
				onFormPerUserLimitChange={setFormPerUserLimit}
				onFormAppliesToChange={setFormAppliesTo}
				onFormProductIdsChange={setFormProductIds}
				onFormCategoryIdsChange={setFormCategoryIds}
				onFormStartsAtChange={setFormStartsAt}
				onFormEndsAtChange={setFormEndsAt}
				onFormSortOrderChange={setFormSortOrder}
				onFormCtaLabelChange={setFormCtaLabel}
				onFormCtaUrlChange={setFormCtaUrl}
				onFormStatusChange={setFormStatus}
				onFormCampaignIdChange={setFormCampaignId}
				onSubmit={() => void submitForm()}
				onFieldErrorStrip={field => stripFieldError(setFieldErrors, field)}
			/>

			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa khuyến mãi?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Khuyến mãi{' '}
							<span className='font-medium text-foreground'>{deleteTarget?.title}</span> sẽ bị xóa vĩnh
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
