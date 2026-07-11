import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
	fetchPromotionDiscounts,
	createPromotionDiscount,
	updatePromotionDiscount,
	type AdminPromotionDiscountRow,
} from '@/api/admin-promotion-discounts';
import { fetchCampaigns } from '@/api/admin-campaigns';
import { fetchProducts } from '@/api/admin-products';
import { fetchAllProductCategories } from '@/api/admin-product-categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PromotionDiscountFormDrawer } from '@/components/promotion-discounts/promotion-discount-form-drawer';
import { type ComboboxOption } from '@/components/ui/multi-select-combobox';
import { type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { AuthApiError } from '@/auth/auth-api';
import { PercentIcon, PlusIcon, Trash2Icon, EllipsisVerticalIcon } from 'lucide-react';
import { toast } from 'sonner';

function formatValue(row: AdminPromotionDiscountRow): string {
	if (row.type === 'PERCENT') return `${row.value}%`;
	return `${row.value.toLocaleString('vi-VN')}đ`;
}

const STATUS_LABEL: Record<AdminPromotionDiscountRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Hoạt động',
	ARCHIVED: 'Lưu trữ',
};

const FORM_SCROLL_ORDER = ['pd-title', 'pd-code', 'pd-banner', 'pd-type', 'pd-value', 'pd-applies-to'] as const;

function parseOptionalInt(raw: string): number | null {
	const t = raw.trim();
	if (!t) return null;
	const n = Number(t);
	return Number.isFinite(n) ? Math.trunc(n) : null;
}

type CampaignPromotionsSectionProps = {
	campaignId: string;
};

export function CampaignPromotionsSection({ campaignId }: CampaignPromotionsSectionProps) {
	const navigate = useNavigate();
	const [promotions, setPromotions] = React.useState<AdminPromotionDiscountRow[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [availableOptions, setAvailableOptions] = React.useState<{ value: string; label: string }[]>([]);
	const [selectedId, setSelectedId] = React.useState('');
	const [addBusy, setAddBusy] = React.useState(false);

	// Create drawer state
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
	const [formStatus, setFormStatus] = React.useState<AdminPromotionDiscountRow['status']>('ACTIVE');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});

	const [productOptions, setProductOptions] = React.useState<ComboboxOption[]>([]);
	const [categoryOptions, setCategoryOptions] = React.useState<ComboboxOption[]>([]);
	const [campaignOptions, setCampaignOptions] = React.useState<ComboboxOption[]>([]);

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
		setFormStatus('ACTIVE');
		setFormError(null);
		setFieldErrors({});
		setDrawerOpen(true);
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

		try {
			await createPromotionDiscount({
				title: formTitle.trim(),
				code: formCode.trim(),
				description: formDescription.trim() || undefined,
				bannerImageUrl: formBannerImageUrl.trim(),
				campaignId,
				type: formType,
				value: value!,
				minOrderVnd: parseOptionalInt(formMinOrderVnd),
				maxDiscountVnd: parseOptionalInt(formMaxDiscountVnd),
				usageLimit: parseOptionalInt(formUsageLimit),
				perUserLimit: parseOptionalInt(formPerUserLimit) ?? 1,
				appliesTo: formAppliesTo,
				productIds: formAppliesTo === 'PRODUCTS' ? formProductIds : [],
				categoryIds: formAppliesTo === 'CATEGORIES' ? formCategoryIds : [],
				startsAt: formStartsAt.trim() ? new Date(formStartsAt).toISOString() : null,
				endsAt: formEndsAt.trim() ? new Date(formEndsAt).toISOString() : null,
				sortOrder: parseOptionalInt(formSortOrder) ?? 0,
				ctaLabel: formCtaLabel.trim() || undefined,
				ctaUrl: formCtaUrl.trim() || undefined,
				status: formStatus,
			});
			toast.success('Tạo khuyến mãi thành công');
			setDrawerOpen(false);
			void load();
		} catch (e) {
			const message = e instanceof AuthApiError ? e.message : 'Thao tác thất bại';
			setFormError(message);
			toast.error(message);
		} finally {
			setFormBusy(false);
		}
	}

	async function load() {
		setLoading(true);
		try {
			const res = await fetchPromotionDiscounts({
				limit: 100,
				offset: 0,
				sortBy: 'sortOrder',
				sortOrder: 'asc',
			});
			const campaignPromos = res.items.filter(p => p.campaignId === campaignId);
			setPromotions(campaignPromos);

			const linkedIds = new Set(res.items.filter(p => p.campaignId).map(p => p.id));
			const available = res.items.filter(p => p.status === 'ACTIVE' && !linkedIds.has(p.id));
			setAvailableOptions(available.map(p => ({ value: p.id, label: `${p.title} (${p.code})` })));
		} catch {
			setPromotions([]);
		} finally {
			setLoading(false);
		}
	}

	React.useEffect(() => {
		void load();
	}, [campaignId]);

	async function handleAdd() {
		if (!selectedId) return;
		setAddBusy(true);
		try {
			await updatePromotionDiscount(selectedId, { campaignId });
			toast.success('Đã thêm mã giảm giá vào chiến dịch');
			setSelectedId('');
			void load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Thêm thất bại');
		} finally {
			setAddBusy(false);
		}
	}

	async function handleRemove(id: string) {
		try {
			await updatePromotionDiscount(id, { campaignId: null });
			toast.success('Đã bỏ mã giảm giá khỏi chiến dịch');
			void load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Bỏ thất bại');
		}
	}

	return (
		<section className='rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex items-start gap-2'>
					<PercentIcon className='mt-0.5 size-4 shrink-0 text-muted-foreground' aria-hidden />
					<div>
						<h3 className='text-sm font-semibold tracking-tight'>Mã giảm giá trong chiến dịch</h3>
						<p className='mt-0.5 text-xs text-muted-foreground'>
							Chọn mã giảm giá đang hoạt động hoặc tạo mới.
						</p>
					</div>
				</div>
			</div>

			{/* Add promotion bar */}
			<div className='mt-3 flex flex-wrap items-center gap-2'>
				<Select value={selectedId} onValueChange={setSelectedId}>
					<SelectTrigger className='min-w-60 flex-1'>
						<SelectValue placeholder='Chọn mã giảm giá đang hoạt động...' />
					</SelectTrigger>
					<SelectContent>
						{availableOptions.length === 0 ? (
							<div className='px-2 py-4 text-center text-xs text-muted-foreground'>
								Không có mã giảm giá nào khả dụng
							</div>
						) : (
							<div className='max-h-60 overflow-y-auto'>
								{availableOptions.map(opt => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</div>
						)}
					</SelectContent>
				</Select>
				<Button size='sm' onClick={() => void handleAdd()} disabled={!selectedId || addBusy}>
					<PlusIcon className='mr-1 size-3.5' /> Thêm
				</Button>
				<Button size='sm' variant='outline' onClick={openCreate}>
					<PlusIcon className='mr-1 size-3.5' /> Tạo mã mới
				</Button>
			</div>

			{/* Existing promotions table */}
			<div className='mt-3'>
				{loading ? (
					<div className='space-y-2'>
						<Skeleton className='h-8 w-full' />
						<Skeleton className='h-8 w-full' />
					</div>
				) : promotions.length === 0 ? (
					<div className='flex flex-col items-center gap-2 rounded-md border border-dashed border-border/60 py-6 text-center'>
						<p className='text-sm text-muted-foreground'>Chưa có mã giảm giá nào trong chiến dịch này.</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tiêu đề</TableHead>
								<TableHead>Mã</TableHead>
								<TableHead>Giá trị</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead className='w-12' />
							</TableRow>
						</TableHeader>
						<TableBody>
							{promotions.map(row => (
								<TableRow
									key={row.id}
									className='cursor-pointer'
									onClick={() => navigate(`/promotions/${row.id}`)}
									role='button'
									tabIndex={0}
									onKeyDown={e => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											navigate(`/promotions/${row.id}`);
										}
									}}
								>
									<TableCell className='font-medium'>{row.title}</TableCell>
									<TableCell className='font-mono text-sm'>{row.code}</TableCell>
									<TableCell className='text-sm'>{formatValue(row)}</TableCell>
									<TableCell>
										<Badge
											variant={
												row.status === 'ACTIVE'
													? 'success'
													: row.status === 'DRAFT'
														? 'secondary'
														: 'muted'
											}
										>
											{STATUS_LABEL[row.status]}
										</Badge>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='ghost'
													size='icon'
													className='size-7'
													onClick={e => e.stopPropagation()}
												>
													<EllipsisVerticalIcon className='size-3.5' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem
													onClick={e => {
														e.stopPropagation();
														void handleRemove(row.id);
													}}
												>
													<Trash2Icon className='size-3.5 text-destructive' />
													Bỏ khỏi chiến dịch
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
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
				formCampaignId={campaignId}
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
				onSubmit={() => void submitForm()}
				onFieldErrorStrip={field => stripFieldError(setFieldErrors, field)}
			/>
		</section>
	);
}
