import * as React from 'react';
import {
	createCampaign,
	deleteCampaign,
	fetchCampaigns,
	type AdminCampaignRow,
} from '@/api/admin-campaigns';
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
	usePaginatedCampaignList,
	type CampaignListSortKey,
} from '@/hooks/use-paginated-campaign-list';
import { useEntityCrud } from '@/hooks/use-permission';
import { CampaignTable } from '@/components/campaigns/campaign-table';
import { CampaignFormDrawer } from '@/components/campaigns/campaign-form-drawer';
import { type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const listCampaigns = (params: Parameters<typeof fetchCampaigns>[0]) =>
	fetchCampaigns(params);

const FORM_SCROLL_ORDER = [
	'camp-title',
	'camp-slug',
] as const;

function parseOptionalInt(raw: string): number | null {
	const t = raw.trim();
	if (!t) return null;
	const n = Number(t);
	return Number.isFinite(n) ? Math.trunc(n) : null;
}

export function CampaignsAdminPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('campaigns');

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<CampaignListSortKey>('sortOrder');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
	const [pageSize, setPageSize] = React.useState(10);
	const [statusFilter, setStatusFilter] = React.useState<'all' | AdminCampaignRow['status']>('all');

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } =
		usePaginatedCampaignList(
			listCampaigns,
			qInput,
			sortBy,
			sortOrder,
			pageSize,
			statusFilter
		);

	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [formTitle, setFormTitle] = React.useState('');
	const [formSlug, setFormSlug] = React.useState('');
	const [formDescription, setFormDescription] = React.useState('');
	const [formBannerImageUrl, setFormBannerImageUrl] = React.useState('');
	const [formStartsAt, setFormStartsAt] = React.useState('');
	const [formEndsAt, setFormEndsAt] = React.useState('');
	const [formSortOrder, setFormSortOrder] = React.useState('0');
	const [formStatus, setFormStatus] = React.useState<AdminCampaignRow['status']>('DRAFT');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});

	const [deleteTarget, setDeleteTarget] = React.useState<AdminCampaignRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	function openCreate() {
		setFormTitle('');
		setFormSlug('');
		setFormDescription('');
		setFormBannerImageUrl('');
		setFormStartsAt('');
		setFormEndsAt('');
		setFormSortOrder('0');
		setFormStatus('DRAFT');
		setFormError(null);
		setFieldErrors({});
		setDrawerOpen(true);
	}

	function openDetail(row: AdminCampaignRow) {
		navigate(`/campaigns/${row.id}`);
	}

	async function submitForm() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};

		if (!formTitle.trim()) err['camp-title'] = 'Nhập tên chiến dịch';

		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});

		const sortOrder = parseOptionalInt(formSortOrder) ?? 0;

		const startsAt = formStartsAt.trim() ? new Date(formStartsAt).toISOString() : null;
		const endsAt = formEndsAt.trim() ? new Date(formEndsAt).toISOString() : null;

		try {
			const created = await createCampaign({
				title: formTitle.trim(),
				slug: formSlug.trim() || undefined,
				description: formDescription.trim() || undefined,
				bannerImageUrl: formBannerImageUrl.trim(),
				startsAt,
				endsAt,
				sortOrder,
				status: formStatus,
			});
			toast.success('Tạo chiến dịch thành công');
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

			await toast.promise(deleteCampaign(deletedId), {
				loading: 'Đang xóa chiến dịch...',
				success: 'Xóa chiến dịch thành công',
				error: 'Xóa chiến dịch thất bại',
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
					<h1 className='text-lg font-semibold tracking-tight'>Chiến dịch</h1>
					<p className='text-muted-foreground text-sm'>
						Quản lý các chiến dịch khuyến mãi. Mỗi chiến dịch có thể chứa nhiều mã giảm giá.
					</p>
				</div>
				{crud.canCreate ? (
					<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
						<PlusIcon className='size-4' />
						Thêm chiến dịch
					</Button>
				) : null}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='camp-q'
						name='campaign-search'
						placeholder='Tên chiến dịch, slug…'
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
						<Select value={sortBy} onValueChange={v => setSortBy(v as CampaignListSortKey)}>
							<SelectTrigger className='w-40'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='sortOrder'>Thứ tự</SelectItem>
									<SelectItem value='createdAt'>Ngày tạo</SelectItem>
									<SelectItem value='title'>Tiêu đề</SelectItem>
									<SelectItem value='slug'>Slug</SelectItem>
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

			<CampaignTable
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

			<CampaignFormDrawer
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				formBusy={formBusy}
				formError={formError}
				fieldErrors={fieldErrors}
				formTitle={formTitle}
				formSlug={formSlug}
				formDescription={formDescription}
				formBannerImageUrl={formBannerImageUrl}
				formStartsAt={formStartsAt}
				formEndsAt={formEndsAt}
				formSortOrder={formSortOrder}
				formStatus={formStatus}
				onFormTitleChange={setFormTitle}
				onFormSlugChange={setFormSlug}
				onFormDescriptionChange={setFormDescription}
				onFormBannerImageUrlChange={setFormBannerImageUrl}
				onFormStartsAtChange={setFormStartsAt}
				onFormEndsAtChange={setFormEndsAt}
				onFormSortOrderChange={setFormSortOrder}
				onFormStatusChange={setFormStatus}
				onSubmit={() => void submitForm()}
				onFieldErrorStrip={field => stripFieldError(setFieldErrors, field)}
			/>

			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa chiến dịch?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Chiến dịch{' '}
							<span className='font-medium text-foreground'>{deleteTarget?.title}</span> sẽ bị xóa vĩnh viễn.
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
