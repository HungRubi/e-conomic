import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	HashIcon,
	ImageIcon,
	PercentIcon,
	RocketIcon,
	TextIcon,
	Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	archiveCampaign,
	deleteCampaign,
	fetchCampaignById,
	publishCampaign,
	updateCampaign,
	type AdminCampaignRow,
} from '@/api/admin-campaigns';
import { AuthApiError } from '@/auth/auth-api';
import { EditableField } from '@/components/common/editable-field';
import { SingleImageUrlDropzone } from '@/components/common/single-image-url-dropzone';
import { uploadProductImage } from '@/api/admin-products';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityCrud } from '@/hooks/use-permission';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';
import { CampaignPromotionsSection } from '@/components/campaigns/campaign-promotions-section';

const STATUS_LABEL: Record<AdminCampaignRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Hoạt động',
	ARCHIVED: 'Lưu trữ',
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

export function CampaignDetailPanel() {
	const params = useParams<{ campaignId: string }>();
	const campaignId = params.campaignId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-campaign', campaignId],
		queryFn: () => fetchCampaignById(campaignId),
		enabled: campaignId.length > 0,
	});

	if (!campaignId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được chiến dịch'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/campaigns'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent campaign={data} onChanged={() => void refetch()} />;
}

function DetailContent({ campaign, onChanged }: { campaign: AdminCampaignRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('campaigns');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'publish' | 'archive' | 'delete' | null>(null);

	async function patch(body: Parameters<typeof updateCampaign>[1]) {
		if (!crud.canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		await updateCampaign(campaign.id, body);
		onChanged();
	}

	async function onPublish() {
		setActionBusy('publish');
		try {
			await publishCampaign(campaign.id);
			toast.success('Đã xuất bản');
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
			await archiveCampaign(campaign.id);
			toast.success('Đã lưu trữ');
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
			await deleteCampaign(campaign.id);
			toast.success('Đã xoá chiến dịch');
			navigate('/campaigns');
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
						<div className='flex items-center gap-1'>
							<h1
								className='min-w-0 flex-1 truncate text-lg font-semibold tracking-tight'
								title={campaign.title}
							>
								{campaign.title}
							</h1>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{campaign.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(campaign.createdAt)}
							</span>
							{campaign.updatedAt !== campaign.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {formatDateTime(campaign.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
					<div className='flex shrink-0 flex-wrap items-center gap-2'>
						<Badge variant={CONTENT_STATUS_BADGE[campaign.status]}>{STATUS_LABEL[campaign.status]}</Badge>
					</div>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]'>
				<div className='min-w-0 space-y-4'>
					<BannerSection campaign={campaign} canUpdate={crud.canUpdate} onChanged={onChanged} />

					<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tên chiến dịch'
								type='text'
								value={campaign.title}
								disabled={!crud.canUpdate}
								onSave={v => patch({ title: v })}
								validate={v => (v.trim() ? null : 'Tên không được trống')}
							/>
							<EditableField
								label='Slug'
								type='text'
								value={campaign.slug}
								disabled={!crud.canUpdate}
								onSave={v => patch({ slug: v })}
								validate={v => (v.trim() ? null : 'Slug không được trống')}
								displayClassName='font-mono text-sm'
							/>
							<EditableField
								label='Mô tả'
								type='textarea'
								value={campaign.description ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ description: v.trim() || undefined })}
								emptyHint='Chưa có mô tả'
								rows={3}
							/>
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-3'>
						<CampaignPromotionsSection campaignId={campaign.id} />
					</section>
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={CalendarClockIcon} title='Lịch trình' />
							<div className='mt-3 space-y-1'>
								<EditableField
									label='Bắt đầu (YYYY-MM-DD)'
									type='text'
									value={campaign.startsAt ? campaign.startsAt.slice(0, 10) : ''}
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
									value={campaign.endsAt ? campaign.endsAt.slice(0, 10) : ''}
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
									value={campaign.sortOrder}
									disabled={!crud.canUpdate}
									onSave={v => patch({ sortOrder: v ?? 0 })}
									min={0}
								/>
							</div>
						</section>

						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={RocketIcon} title='Thao tác nhanh' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								<div className='flex items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm'>
									<span className='text-muted-foreground'>Trạng thái</span>
									<Badge variant={CONTENT_STATUS_BADGE[campaign.status]}>
										{STATUS_LABEL[campaign.status]}
									</Badge>
								</div>
								{crud.canUpdate && campaign.status !== 'ACTIVE' ? (
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
								{crud.canUpdate && campaign.status !== 'ARCHIVED' ? (
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
							<SectionHeading icon={PercentIcon} title='Tóm tắt' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between'>
									<dt className='text-muted-foreground'>Chiến dịch</dt>
									<dd className='font-semibold'>{campaign.title}</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='text-muted-foreground'>Slug</dt>
									<dd className='font-mono text-xs'>{campaign.slug}</dd>
								</div>
							</dl>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá chiến dịch này?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{campaign.title}</span> sẽ bị xoá vĩnh viễn.
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
	campaign,
	canUpdate,
	onChanged,
}: {
	campaign: AdminCampaignRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function setImage(url: string) {
		setBusy(true);
		try {
			await updateCampaign(campaign.id, { bannerImageUrl: url });
			toast.success('Đã cập nhật banner');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={ImageIcon} title='Banner chiến dịch' />
			<div className='mt-3'>
				<SingleImageUrlDropzone
					label={
						campaign.bannerImageUrl ? 'Kéo thả hoặc bấm để thay banner' : 'Kéo thả hoặc bấm để chọn banner'
					}
					hint='JPEG, PNG, WebP'
					url={campaign.bannerImageUrl ?? ''}
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
			<p className='text-sm font-medium'>Không tìm thấy chiến dịch</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/campaigns'>
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
