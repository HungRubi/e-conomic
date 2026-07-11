import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArchiveIcon,
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	GemIcon,
	HashIcon,
	ImageIcon,
	ListOrderedIcon,
	RocketIcon,
	RulerIcon,
	TagIcon,
	TextIcon,
	Trash2Icon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
	deleteProductMaterial,
	getProductMaterial,
	updateProductMaterial,
	type AdminProductMaterialRow,
} from '@/api/admin-product-materials';
import { uploadProductImage } from '@/api/admin-products';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useEntityCrud } from '@/hooks/use-permission';
import { CONTENT_STATUS_BADGE } from '@/lib/status-styles';

const STATUS_LABEL: Record<AdminProductMaterialRow['status'], string> = {
	DRAFT: 'Nháp',
	ACTIVE: 'Đang dùng',
	ARCHIVED: 'Lưu trữ',
};

const KIND_LABEL: Record<AdminProductMaterialRow['kind'], string> = {
	BEAD: 'Hạt đá',
	STONE: 'Đá thô',
	CHARM: 'Charm',
	ACCESSORY: 'Phụ kiện',
};

const KIND_OPTIONS = (Object.keys(KIND_LABEL) as AdminProductMaterialRow['kind'][]).map(k => ({
	value: k,
	label: KIND_LABEL[k],
}));

const STATUS_OPTIONS = [
	{ value: 'DRAFT', label: 'Nháp' },
	{ value: 'ACTIVE', label: 'Đang dùng' },
	{ value: 'ARCHIVED', label: 'Lưu trữ' },
];

function formatDateTime(iso: string | null): string {
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

export function ProductMaterialDetailPanel() {
	const params = useParams<{ materialId: string }>();
	const materialId = params.materialId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-product-material', materialId],
		queryFn: () => getProductMaterial(materialId),
		enabled: materialId.length > 0,
	});

	if (!materialId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được đá trang trí'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/products/decorative-stones'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent material={data} onChanged={() => void refetch()} />;
}

function DetailContent({ material, onChanged }: { material: AdminProductMaterialRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('productMaterials');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'archive' | 'activate' | 'delete' | null>(null);

	async function patch(body: Partial<AdminProductMaterialRow>) {
		if (!crud.canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		await updateProductMaterial(material.id, body);
		onChanged();
	}

	async function setStatus(status: AdminProductMaterialRow['status']) {
		const action = status === 'ACTIVE' ? 'activate' : 'archive';
		setActionBusy(action);
		try {
			await updateProductMaterial(material.id, { status });
			toast.success(status === 'ACTIVE' ? 'đã kích hoạt' : 'đã lưu trữ');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setActionBusy(null);
		}
	}

	async function onDelete() {
		setActionBusy('delete');
		try {
			await deleteProductMaterial(material.id);
			toast.success('đã xoá đá trang trí');
			navigate('/products/decorative-stones');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không xoá được');
			setActionBusy(null);
		}
	}

	return (
		<div className='dashboard-fade-in space-y-4'>
			<header className='flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='flex min-w-0 items-start gap-3'>
					<Button
						type='button'
						variant='ghost'
						size='icon'
						className='shrink-0'
						onClick={() => navigate('/products/decorative-stones')}
						aria-label='Quay lại danh sách'
					>
						<ArrowLeftIcon className='size-4' />
					</Button>
					<div className='min-w-0'>
						<p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
							Đá trang trí
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h1 className='truncate text-lg font-semibold tracking-tight'>{material.name}</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(material.slug, 'đã sao chép slug')}
								aria-label='Sao chép slug'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{material.slug}
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {formatDateTime(material.createdAt)}
							</span>
							{material.updatedAt !== material.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {formatDateTime(material.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<Badge variant={CONTENT_STATUS_BADGE[material.status]}>{STATUS_LABEL[material.status]}</Badge>
					<Badge variant='outline'>{KIND_LABEL[material.kind]}</Badge>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<ImageSection material={material} canUpdate={crud.canUpdate} onChanged={onChanged} />

					<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={TextIcon} title='Thông tin chính' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Tên'
								type='text'
								value={material.name}
								disabled={!crud.canUpdate}
								onSave={v => patch({ name: v })}
								validate={v => (v.trim() ? null : 'Tên không được trống')}
							/>
							<EditableField
								label='Slug (URL)'
								type='text'
								value={material.slug}
								disabled={!crud.canUpdate}
								onSave={v => patch({ slug: v })}
								validate={v =>
									/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim())
										? null
										: 'Slug chỉ gồm a-z, 0-9 và dấu -'
								}
								displayClassName='font-mono text-xs'
							/>
							<EditableField
								label='Loại'
								type='select'
								value={material.kind}
								options={KIND_OPTIONS}
								disabled={!crud.canUpdate}
								onSave={v => patch({ kind: v as AdminProductMaterialRow['kind'] })}
							/>
							<EditableField
								label='Giá (VND)'
								type='number'
								value={material.priceVnd}
								disabled={!crud.canUpdate}
								onSave={v => patch({ priceVnd: v ?? 0 })}
								min={0}
								validate={v => (v != null && v >= 0 ? null : 'Phải là số ≥ 0')}
								suffix={formatVnd(material.priceVnd)}
							/>
						</div>
					</section>

					<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={RulerIcon} title='Kích thước & thiết kế' />
						<div className='mt-3 grid gap-1 sm:grid-cols-2'>
							<EditableField
								label='Kích thước (mm)'
								type='number'
								value={material.sizeMm ?? null}
								disabled={!crud.canUpdate}
								onSave={v => patch({ sizeMm: v })}
								min={0}
								suffix='mm'
								emptyHint='Chưa đặt'
							/>
							<EditableField
								label='Nhãn kích thước'
								type='text'
								value={material.displaySize ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ displaySize: v.trim() ? v : null })}
								emptyHint='Ví dụ: 10mm tròn'
							/>
							<EditableField
								label='Mã thiết kế'
								type='text'
								value={material.designerCode ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ designerCode: v.trim() ? v : null })}
								emptyHint='Mã nội bộ designer'
								displayClassName='font-mono text-xs'
							/>
							<EditableField
								label='Nhóm thiết kế'
								type='text'
								value={material.designerCategory ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ designerCategory: v.trim() ? v : null })}
								emptyHint='Phân loại nội bộ'
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
									<Badge variant={CONTENT_STATUS_BADGE[material.status]}>
										{STATUS_LABEL[material.status]}
									</Badge>
								</div>
								{crud.canUpdate && material.status !== 'ACTIVE' ? (
									<Button
										type='button'
										onClick={() => void setStatus('ACTIVE')}
										disabled={actionBusy !== null}
										className='justify-start'
									>
										<RocketIcon className='mr-1.5 size-4' />
										Kích hoạt
									</Button>
								) : null}
								{crud.canUpdate && material.status !== 'ARCHIVED' ? (
									<Button
										type='button'
										variant='outline'
										onClick={() => void setStatus('ARCHIVED')}
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
							<div className='mt-3 space-y-1'>
								<EditableField
									label='Trạng thái'
									type='select'
									value={material.status}
									options={STATUS_OPTIONS}
									disabled={!crud.canUpdate}
									onSave={v => patch({ status: v as AdminProductMaterialRow['status'] })}
								/>
							</div>
						</section>

						<section className='dashboard-slide-up dashboard-stagger-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={TagIcon} title='Thẻ thông tin' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<GemIcon className='size-3.5' aria-hidden />
										Loại
									</dt>
									<dd className='font-semibold'>{KIND_LABEL[material.kind]}</dd>
								</div>
								<div className='flex items-center justify-between'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<TagIcon className='size-3.5' aria-hidden />
										Giá đơn vị
									</dt>
									<dd className='font-semibold tabular-nums'>{formatVnd(material.priceVnd)}</dd>
								</div>
							</dl>
						</section>
					</div>
				</aside>
			</div>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá đá trang trí này?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{material.name}</span> sẽ bị xoá vĩnh viễn.
							Các sản phẩm đang dùng sẽ mất tham chiếu.
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

function ImageSection({
	material,
	canUpdate,
	onChanged,
}: {
	material: AdminProductMaterialRow;
	canUpdate: boolean;
	onChanged: () => void;
}) {
	const [busy, setBusy] = React.useState(false);
	const [uploadBusy, setUploadBusy] = React.useState(false);

	async function setImage(url: string | null) {
		setBusy(true);
		try {
			await updateProductMaterial(material.id, { image: url });
			toast.success(url ? 'đã cập nhật ảnh' : 'đã gỡ ảnh');
			onChanged();
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Không cập nhật được');
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
			<SectionHeading icon={ImageIcon} title='Ảnh đại diện' hint='Hiển thị ở picker designer + danh sách.' />
			<div className='mt-3'>
				<SingleImageUrlDropzone
					label={material.image ? 'Kéo thả hoặc bấm để thay ảnh' : 'Kéo thả hoặc bấm để chọn ảnh'}
					hint='JPEG, PNG, WebP'
					url={material.image ?? ''}
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
				{material.image && canUpdate ? (
					<div className='mt-3 flex justify-end'>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							onClick={() => void setImage(null)}
							disabled={busy}
						>
							Gỡ ảnh
						</Button>
					</div>
				) : null}
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
			<p className='text-sm font-medium'>Không tìm thấy đá trang trí</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/products/decorative-stones'>
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
