import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	HashIcon,
	ImageIcon,
	ListOrderedIcon,
	PercentIcon,
	RocketIcon,
	SettingsIcon,
	TagIcon,
	TextIcon,
	Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archivePromotionDiscount,
	deletePromotionDiscount,
	fetchPromotionDiscountById,
	publishPromotionDiscount,
	updatePromotionDiscount,
	type AdminPromotionDiscountRow,
} from '@/api/admin-promotion-discounts';
import { fetchAllProductCategories } from '@/api/admin-product-categories';
import { fetchCampaigns } from '@/api/admin-campaigns';
import { fetchProducts, uploadProductImage } from '@/api/admin-products';
import { AuthApiError } from '@/auth/auth-api';
import { EditableField } from '@/components/common/editable-field';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
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
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { MultiSelectCombobox, type ComboboxOption } from '@/components/ui/multi-select-combobox';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityCrud } from '@/hooks/use-permission';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';

const STATUS_LABEL: Record<AdminPromotionDiscountRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Hoạt động',
	ARCHIVED: 'Lưu trữ',
};

const STATUS_OPTIONS = [
	{ value: 'DRAFT', label: 'Nháp' },
	{ value: 'ACTIVE', label: 'Hoạt động' },
	{ value: 'ARCHIVED', label: 'Lưu trữ' },
];

const TYPE_OPTIONS = [
	{ value: 'PERCENT', label: 'Phần trăm (%)' },
	{ value: 'FIXED_AMOUNT', label: 'Số tiền cố định (₫)' },
];

const APPLIES_TO_OPTIONS = [
	{ value: 'ALL_PRODUCTS', label: 'Tất cả sản phẩm' },
	{ value: 'PRODUCTS', label: 'Sản phẩm cụ thể' },
	{ value: 'CATEGORIES', label: 'Danh mục cụ thể' },
];

const APPLIES_TO_LABEL: Record<AdminPromotionDiscountRow['appliesTo'], string> = {
	ALL_PRODUCTS: 'Tất cả sản phẩm',
	PRODUCTS: 'Sản phẩm cụ thể',
	CATEGORIES: 'Danh mục cụ thể',
};

function formatDateTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	return new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(iso));
}

function formatVnd(value: number): string {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

async function copyToClipboard(value: string, message: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(message);
	} catch {
		toast.error('Không sao chép được');
	}
}

export function PromotionDiscountDetailPanel() {
	const params = useParams<{ promotionId: string }>();
	const promotionId = params.promotionId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-promotion-discount', promotionId],
		queryFn: () => fetchPromotionDiscountById(promotionId),
		enabled: promotionId.length > 0,
	});

	if (!promotionId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được khuyến mãi'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/promotions'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent promotion={data} onChanged={() => void refetch()} />;
}

function DetailContent({ promotion, onChanged }: { promotion: AdminPromotionDiscountRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('promotions');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);
	const [advancedOpen, setAdvancedOpen] = React.useState(false);
	const [campaignOptions, setCampaignOptions] = React.useState<ComboboxOption[]>([]);

	React.useEffect(() => {
		void fetchCampaigns({ limit: 100, offset: 0, status: 'all', sortBy: 'createdAt', sortOrder: 'desc' }).then(
			res => {
				setCampaignOptions(res.items.map(c => ({ value: c.id, label: c.title })));
			}
		);
	}, []);

	async function patch(body: Parameters<typeof updatePromotionDiscount>[1]) {
		if (!crud.canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		await updatePromotionDiscount(promotion.id, body);
		onChanged();
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishPromotionDiscount(promotion.id);
			toast.success('đã xuất bản');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xuất bản được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onArchive() {
		setActionBusy('archive');
		try {
			await archivePromotionDiscount(promotion.id);
			toast.success('đã lưu trữ');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không lưu trữ được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onDelete() {
		setActionBusy('delete');
		try {
			await deletePromotionDiscount(promotion.id);
			toast.success('đã xoá khuyến mãi');
			navigate('/promotions');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xoá được');
			setActionBusy(null);
		}
	}

	return (
		<div className='dashboard-fade-in space-y-4'>
			<header className='rounded-xl bg-card p-4 sm:p-5 lg:p-6 ring-1 ring-foreground/10'>
				<div className='flex items-start justify-between gap-4'>
					<div className='min-w-0 flex-1'>
						<p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
							Khuyến mãi
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h1 className='truncate text-lg font-semibold tracking-tight'>{promotion.title}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(promotion.code, 'đã sao chép mã')}
								aria-label='Sao chép mã'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{promotion.code}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(promotion.createdAt)}
							</span>
							{promotion.updatedAt !== promotion.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {formatDateTime(promotion.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[promotion.status]}>{STATUS_LABEL[promotion.status]}</Badge>
						<Badge variant='outline'>{APPLIES_TO_LABEL[promotion.appliesTo]}</Badge>
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<BannerSection promotion={promotion} canUpdate={crud.canUpdate} onChanged={onChanged} />

					<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tiêu đề'
								type='text'
								value={promotion.title}
								disabled={!crud.canUpdate}
								onSave={v => patch({ title: v })}
								validate={v => (v.trim() ? null : 'Tiêu đề không được trống')}
							/>
							<EditableField
								label='Mã giảm giá'
								type='text'
								value={promotion.code}
								disabled={!crud.canUpdate}
								onSave={v => patch({ code: v.toUpperCase() })}
								validate={v => (v.trim() ? null : 'Mã không được trống')}
								displayClassName='font-mono text-sm'
							/>
							<EditableField
								label='Mô tả'
								type='textarea'
								value={promotion.description ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ description: v.trim() || undefined })}
								emptyHint='Chưa có mô tả'
								rows={3}
							/>
							<EditableField
								label='Chiến dịch'
								type='select'
								value={promotion.campaignId ?? ''}
								options={[{ value: '', label: 'Không thuộc chiến dịch' }, ...campaignOptions]}
								disabled={!crud.canUpdate}
								onSave={v => patch({ campaignId: v || null })}
								emptyHint='Không thuộc chiến dịch'
							/>
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={PercentIcon} title='Giá trị giảm giá' />
						<div className='mt-3 grid gap-1 sm:grid-cols-2'>
							<EditableField
								label='Loại'
								type='select'
								value={promotion.type}
								options={TYPE_OPTIONS}
								disabled={!crud.canUpdate}
								onSave={v => patch({ type: v as AdminPromotionDiscountRow['type'] })}
							/>
							<EditableField
								label={promotion.type === 'PERCENT' ? 'Giá trị (%)' : 'Giá trị (₫)'}
								type='number'
								value={promotion.value}
								disabled={!crud.canUpdate}
								onSave={v => patch({ value: v ?? 0 })}
								min={1}
								max={promotion.type === 'PERCENT' ? 100 : undefined}
								validate={v => {
									if (v == null || v <= 0) return 'Phải > 0';
									if (promotion.type === 'PERCENT' && v > 100) return 'Tối đa 100';
									return null;
								}}
								suffix={promotion.type === 'PERCENT' ? '%' : '₫'}
							/>
							<EditableField
								label='Đơn tối thiểu (₫)'
								type='number'
								value={promotion.minOrderVnd ?? null}
								disabled={!crud.canUpdate}
								onSave={v => patch({ minOrderVnd: v })}
								min={0}
								emptyHint='Không yêu cầu'
								suffix='₫'
							/>
							<EditableField
								label='Giảm tối đa (₫)'
								type='number'
								value={promotion.maxDiscountVnd ?? null}
								disabled={!crud.canUpdate}
								onSave={v => patch({ maxDiscountVnd: v })}
								min={0}
								emptyHint='Không giới hạn'
								suffix='₫'
							/>
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={ListOrderedIcon} title='Giới hạn sử dụng' />
						<div className='mt-3 grid gap-1 sm:grid-cols-2'>
							<EditableField
								label='Lượt dùng tối đa'
								type='number'
								value={promotion.usageLimit ?? null}
								disabled={!crud.canUpdate}
								onSave={v => patch({ usageLimit: v })}
								min={0}
								emptyHint='Không giới hạn'
							/>
							<EditableField
								label='Mỗi user dùng được'
								type='number'
								value={promotion.perUserLimit ?? 1}
								disabled={!crud.canUpdate}
								onSave={v => patch({ perUserLimit: v })}
								min={1}
								emptyHint='1 lần'
							/>
						</div>
						<div className='mt-3 rounded-md bg-muted/30 px-3 py-2 text-sm tabular-nums'>
							đã sử dụng: <span className='font-semibold'>{promotion.usedCount}</span>
							{promotion.usageLimit ? ` / ${promotion.usageLimit}` : ''}
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading
							icon={SettingsIcon}
							title='Áp dụng cho'
							action={
								crud.canUpdate ? (
									<Button
										type='button'
										variant='outline'
										size='sm'
										onClick={() => setAdvancedOpen(true)}
									>
										<SettingsIcon className='mr-1 size-3.5' />
										Cấu hình
									</Button>
								) : undefined
							}
						/>
						<div className='mt-3 space-y-2 text-sm'>
							<div className='flex items-center justify-between'>
								<span className='text-muted-foreground'>Phạm vi</span>
								<Badge variant='outline'>{APPLIES_TO_LABEL[promotion.appliesTo]}</Badge>
							</div>
							{promotion.appliesTo === 'PRODUCTS' ? (
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Sản phẩm</span>
									<span className='font-semibold tabular-nums'>{promotion.productIds.length}</span>
								</div>
							) : null}
							{promotion.appliesTo === 'CATEGORIES' ? (
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Danh mục</span>
									<span className='font-semibold tabular-nums'>{promotion.categoryIds.length}</span>
								</div>
							) : null}
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-5 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={CalendarClockIcon} title='Hiển thị & lịch trình' />
						<div className='mt-3 grid gap-1 sm:grid-cols-2'>
							<EditableField
								label='Bắt đầu (YYYY-MM-DD)'
								type='text'
								value={promotion.startsAt ? promotion.startsAt.slice(0, 10) : ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ startsAt: v.trim() ? new Date(v).toISOString() : null })}
								emptyHint='Không đặt'
								validate={v => {
									if (!v.trim()) return null;
									return /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? null : 'định dạng YYYY-MM-DD';
								}}
							/>
							<EditableField
								label='Kết thúc (YYYY-MM-DD)'
								type='text'
								value={promotion.endsAt ? promotion.endsAt.slice(0, 10) : ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ endsAt: v.trim() ? new Date(v).toISOString() : null })}
								emptyHint='Không đặt'
								validate={v => {
									if (!v.trim()) return null;
									return /^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? null : 'định dạng YYYY-MM-DD';
								}}
							/>
							<EditableField
								label='Thứ tự hiển thị'
								type='number'
								value={promotion.sortOrder}
								disabled={!crud.canUpdate}
								onSave={v => patch({ sortOrder: v ?? 0 })}
								min={0}
							/>
							<EditableField
								label='Nhãn CTA'
								type='text'
								value={promotion.ctaLabel ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ ctaLabel: v.trim() || undefined })}
								emptyHint='Ví dụ: Săn deal'
							/>
							<EditableField
								label='URL CTA'
								type='text'
								value={promotion.ctaUrl ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ ctaUrl: v.trim() || undefined })}
								emptyHint='Liên kết đích'
								containerClassName='sm:col-span-2'
							/>
						</div>
					</section>
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái</span>
									<Badge variant={CONTENT_STATUS_BADGE[promotion.status]}>
										{STATUS_LABEL[promotion.status]}
									</Badge>
								</div>
								{crud.canUpdate && promotion.status !== 'ACTIVE' ? (
									<Button
										type='button'
										onClick={() => void onPublish()}
										disabled={actionBusy !== null}
										className='justify-start'
									>
										<RocketIcon className='mr-1.5 size-4' />
										Xuất bản
									</Button>
								) : null}
								{crud.canUpdate && promotion.status !== 'ARCHIVED' ? (
									<Button
										type='button'
										variant='outline'
										onClick={() => void onArchive()}
										disabled={actionBusy !== null}
										className='justify-start'
									>
										<ArchiveIcon className='mr-1.5 size-4' />
										Lưu trữ
									</Button>
								) : null}
								{crud.canDelete ? (
									<Button
										type='button'
										variant='ghost'
										className='justify-start text-destructive hover:bg-destructive/10 hover:text-destructive'
										onClick={() => setConfirmDelete(true)}
										disabled={actionBusy !== null}
									>
										<Trash2Icon className='mr-1.5 size-4' />
										Xoá vĩnh viễn
									</Button>
								) : null}
							</div>
						</section>

						<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={ListOrderedIcon} title='Trạng thái' />
							<div className='mt-3'>
								<EditableField
									label='Trạng thái'
									type='select'
									value={promotion.status}
									options={STATUS_OPTIONS}
									disabled={!crud.canUpdate}
									onSave={v => patch({ status: v as AdminPromotionDiscountRow['status'] })}
								/>
							</div>
						</section>

						<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={TagIcon} title='Tóm tắt' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between'>
									<dt className='text-muted-foreground'>Loại</dt>
									<dd className='font-semibold'>
										{promotion.type === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
									</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='text-muted-foreground'>Giá trị</dt>
									<dd className='font-semibold tabular-nums'>
										{promotion.type === 'PERCENT'
											? `${promotion.value}%`
											: formatVnd(promotion.value)}
									</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='text-muted-foreground'>đã dùng</dt>
									<dd className='font-semibold tabular-nums'>{promotion.usedCount}</dd>
								</div>
							</dl>
						</section>
					</div>
				</aside>
			</div>

			<AdvancedSheet
				open={advancedOpen}
				onOpenChange={setAdvancedOpen}
				promotion={promotion}
				onChanged={onChanged}
				disabled={!crud.canUpdate}
			/>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá khuyến mãi này?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{promotion.title}</span> sẽ bị xoá vĩnh viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={actionBusy === 'delete'}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => void onDelete()}
							disabled={actionBusy === 'delete'}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							{actionBusy === 'delete' ? 'Đang xoá…' : 'Xoá'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function BannerSection({
	promotion,
	canUpdate,
	onChanged,
}: {
	promotion: AdminPromotionDiscountRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function setImage(url: string) {
		setBusy(true);
		try {
			await updatePromotionDiscount(promotion.id, { bannerImageUrl: url });
			toast.success('đã cập nhật banner');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={ImageIcon} title='Banner khuyến mãi' />
			<div className='mt-3'>
				<SingleImageUrlDropzone
					label={
						promotion.bannerImageUrl ? 'Kéo thả hoặc bấm để thay banner' : 'Kéo thả hoặc bấm để chọn banner'
					}
					hint='JPEG, PNG, WebP'
					url={promotion.bannerImageUrl ?? ''}
					disabled={busy || !canUpdate}
					uploadBusy={uploadBusy}
					onUploadFile={async file => {
						setUploadBusy(true);
						try {
							const { url } = await uploadProductImage(file);
							await setImage(url);
						} catch (e) {
							toast.error(e instanceof AuthApiError ? e.message : 'Tải ảnh thất bại');
						} finally {
							setUploadBusy(false);
						}
					}}
				/>
			</div>
		</section>
	);
}

function AdvancedSheet({
	open,
	onOpenChange,
	promotion,
	onChanged,
	disabled,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	promotion: AdminPromotionDiscountRow;
	onChanged: () => void;
	disabled: boolean;
}) {
	const [appliesTo, setAppliesTo] = React.useState(promotion.appliesTo);
	const [productIds, setProductIds] = React.useState<string[]>(promotion.productIds);
	const [categoryIds, setCategoryIds] = React.useState<string[]>(promotion.categoryIds);
	const [productOptions, setProductOptions] = React.useState<ComboboxOption[]>([]);
	const [categoryOptions, setCategoryOptions] = React.useState<ComboboxOption[]>([]);
	const [busy, setBusy] = React.useState(false);

	React.useEffect(() => {
		if (!open) return;
		setAppliesTo(promotion.appliesTo);
		setProductIds(promotion.productIds);
		setCategoryIds(promotion.categoryIds);
		void fetchProducts({ limit: 100, offset: 0 }).then(res => {
			setProductOptions(res.items.map(p => ({ value: p.id, label: p.name })));
		});
		void fetchAllProductCategories({ status: 'all', sortBy: 'name', sortOrder: 'asc' }).then(res => {
			setCategoryOptions(res.map(c => ({ value: c.id, label: c.name })));
		});
	}, [open, promotion]);

	async function submit() {
		setBusy(true);
		try {
			await updatePromotionDiscount(promotion.id, {
				appliesTo,
				productIds: appliesTo === 'PRODUCTS' ? productIds : [],
				categoryIds: appliesTo === 'CATEGORIES' ? categoryIds : [],
			});
			toast.success('đã cập nhật phạm vi áp dụng');
			onChanged();
			onOpenChange(false);
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className='flex flex-col gap-0 p-0 sm:max-w-137'>
				<SheetHeader className='border-b px-6 py-5 pr-16'>
					<SheetTitle>Cấu hình phạm vi áp dụng</SheetTitle>
					<SheetDescription>Chọn sản phẩm hoặc danh mục mà mã giảm giá này áp dụng.</SheetDescription>
				</SheetHeader>
				<FieldGroup className='flex-1 overflow-y-auto px-6 py-5'>
					<Field>
						<FieldLabel>Phạm vi</FieldLabel>
						<div className='flex flex-wrap gap-2'>
							{APPLIES_TO_OPTIONS.map(opt => (
								<Button
									key={opt.value}
									type='button'
									variant={appliesTo === opt.value ? 'default' : 'outline'}
									size='sm'
									disabled={disabled || busy}
									onClick={() => setAppliesTo(opt.value as AdminPromotionDiscountRow['appliesTo'])}
								>
									{opt.label}
								</Button>
							))}
						</div>
					</Field>
					{appliesTo === 'PRODUCTS' ? (
						<Field>
							<FieldLabel>Sản phẩm áp dụng</FieldLabel>
							<MultiSelectCombobox
								options={productOptions}
								selectedValues={productIds}
								onSelectedChange={setProductIds}
								placeholder='Chọn sản phẩm…'
								disabled={disabled || busy}
							/>
						</Field>
					) : null}
					{appliesTo === 'CATEGORIES' ? (
						<Field>
							<FieldLabel>Danh mục áp dụng</FieldLabel>
							<MultiSelectCombobox
								options={categoryOptions}
								selectedValues={categoryIds}
								onSelectedChange={setCategoryIds}
								placeholder='Chọn danh mục…'
								disabled={disabled || busy}
							/>
						</Field>
					) : null}
				</FieldGroup>
				<SheetFooter className='gap-2 border-t px-6 py-4 sm:justify-end'>
					<Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>
						Hủy
					</Button>
					<Button type='button' onClick={() => void submit()} disabled={busy || disabled}>
						{busy ? 'Đang lưu…' : 'Lưu cấu hình'}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

function SectionHeading({
	icon: Icon,
	title,
	hint,
	action,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	hint?: string;
	action?: React.ReactNode;
}) {
	return (
		<div className='flex items-start justify-between gap-3'>
			<div className='flex items-start gap-2'>
				<Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' aria-hidden />
				<div>
					<h3 className='text-sm font-semibold tracking-tight'>{title}</h3>
					{hint ? <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p> : null}
				</div>
			</div>
			{action ? <div className='shrink-0'>{action}</div> : null}
		</div>
	);
}

function NotFoundState() {
	return (
		<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-10 text-center'>
			<p className='text-sm font-medium'>Không tìm thấy khuyến mãi</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/promotions'>
					<ArrowLeftIcon className='mr-1 size-4' />
					Về danh sách
				</Link>
			</Button>
		</div>
	);
}

function DetailSkeleton() {
	return (
		<div className='dashboard-fade-in space-y-4'>
			<div className='flex items-center gap-3 border-b border-border/60 pb-4'>
				<Skeleton className='size-9 rounded-md' />
				<div className='space-y-2'>
					<Skeleton className='h-3 w-24' />
					<Skeleton className='h-5 w-48' />
				</div>
			</div>
			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
				<div className='space-y-4'>
					<Skeleton className='h-40 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
					<Skeleton className='h-48 w-full rounded-xl' />
				</div>
				<div className='space-y-4'>
					<Skeleton className='h-48 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
}
