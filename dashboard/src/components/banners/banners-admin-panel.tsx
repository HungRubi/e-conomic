import * as React from 'react';

import { useNavigate } from 'react-router-dom';

import {
	deleteBanner,
	createBanner,
	fetchBanners,
	uploadBannerImage,
	type AdminBannerRow,
	type CreateBannerBody,
} from '@/api/admin-banners';
import { AuthApiError } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate } from '@/components/users/user-table-shared';
import { ProductImagesEditor, type ProductImageEntry } from '@/components/products/product-images-editor';
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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { digitsOnly, type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { cn } from '@/lib/utils';
import {
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	PlusIcon,
	Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

const TYPE_BADGE: Record<string, 'default' | 'secondary' | 'outline'> = {
	HERO: 'default',
	BANNER: 'secondary',
};

const TYPE_LABEL: Record<string, string> = {
	HERO: 'Hero',
	BANNER: 'Banner',
};

export function BannersAdminPanel() {
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();
	const isAdmin = currentUser?.role === 'ADMIN';

	const [rows, setRows] = React.useState<AdminBannerRow[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const load = React.useCallback(() => {
		setLoading(true);
		setError(null);
		fetchBanners()
			.then(setRows)
			.catch(e => setError(e instanceof Error ? e.message : 'Không tải được banner'))
			.finally(() => setLoading(false));
	}, []);

	React.useEffect(() => { load(); }, [load]);

	// Delete state
	const [deleteTarget, setDeleteTarget] = React.useState<AdminBannerRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleteBusy(true);
		try {
			await deleteBanner(deleteTarget.id);
			toast.success('Đã xóa banner');
			setDeleteTarget(null);
			load();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Không xóa được');
		} finally {
			setDeleteBusy(false);
		}
	}

	// ==============================
	// Create drawer
	// ==============================
	const [drawerOpen, setDrawerOpen] = React.useState(false);
	const [formImage, setFormImage] = React.useState<ProductImageEntry[]>([]);
	const [formUrl, setFormUrl] = React.useState('');
	const [formLink, setFormLink] = React.useState('');
	const [formAlt, setFormAlt] = React.useState('');
	const [formType, setFormType] = React.useState<'HERO' | 'BANNER'>('BANNER');
	const [formSortOrder, setFormSortOrder] = React.useState(0);
	const [formActive, setFormActive] = React.useState(true);
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});

	function resetForm() {
		setFormImage([]);
		setFormUrl('');
		setFormLink('');
		setFormAlt('');
		setFormType('BANNER');
		setFormSortOrder(rows.length);
		setFormActive(true);
		setFormError(null);
		setFieldErrors({});
	}

	async function handleCreate() {
		// Validate
		const imageUrl = formImage.length > 0 ? formImage[0].url.trim() : formUrl.trim();
		if (!imageUrl) {
			setFieldErrors({ image: 'Vui lòng thêm ảnh banner' });
			return;
		}
		setFieldErrors({});

		const body: CreateBannerBody = {
			imageUrl,
			linkUrl: formLink.trim() || null,
			altText: formAlt.trim() || null,
			type: formType,
			sortOrder: formSortOrder,
			active: formActive,
		};

		setFormBusy(true);
		setFormError(null);
		try {
			await createBanner(body);
			toast.success('Đã tạo banner');
			setDrawerOpen(false);
			resetForm();
			load();
		} catch (e) {
			setFormError(e instanceof Error ? e.message : 'Không tạo được');
		} finally {
			setFormBusy(false);
		}
	}

	return (
		<div className='space-y-4'>
			{/* Header */}
			<div className='flex items-center justify-between gap-3'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Banners</h1>
					<p className='mt-0.5 text-sm text-muted-foreground'>Quản lý banner hiển thị trên trang chủ</p>
				</div>
				<Button type='button' onClick={() => { resetForm(); setDrawerOpen(true); }}>
					<PlusIcon className='mr-1.5 size-4' />Tạo banner
				</Button>
			</div>

			{/* Table */}
			<div className='rounded-lg border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[120px]'>Ảnh</TableHead>
							<TableHead>Alt text</TableHead>
							<TableHead className='w-[100px]'>Loại</TableHead>
							<TableHead className='w-[80px]'>Thứ tự</TableHead>
							<TableHead className='w-[80px]'>Trạng thái</TableHead>
							<TableHead className='w-[160px]'>Tạo lúc</TableHead>
							<TableHead className='w-[60px]' />
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRowsSkeleton cols={7} />
						) : error ? (
							<TableErrorStateRow cols={7} error={error} onRetry={load} />
						) : rows.length === 0 ? (
							<TableEmptyStateRow cols={7} message='Chưa có banner nào' />
						) : (
							rows.map(row => (
								<TableRow
									key={row.id}
									className='cursor-pointer'
									onClick={() => navigate(`/content/banners/${row.id}`)}
								>
									<TableCell>
										<img
											src={publicAssetUrl(row.imageUrl)}
											alt=''
											className='h-12 w-20 rounded border object-cover'
										/>
									</TableCell>
									<TableCell className='max-w-[260px] truncate'>
										{row.altText || <span className='text-muted-foreground'>—</span>}
									</TableCell>
									<TableCell>
										<Badge variant={TYPE_BADGE[row.type] ?? 'outline'}>
											{TYPE_LABEL[row.type] ?? row.type}
										</Badge>
									</TableCell>
									<TableCell className='tabular-nums'>{row.sortOrder}</TableCell>
									<TableCell>
										{row.active ? (
											<Badge variant='success'>Đang hiển thị</Badge>
										) : (
											<Badge variant='secondary'>Ẩn</Badge>
										)}
									</TableCell>
									<TableCell className='text-sm text-muted-foreground'>
										{fmtUserDate(row.createdAt)}
									</TableCell>
									<TableCell>
										<Button
											type='button'
											variant='ghost'
											size='icon'
											className='size-7 text-muted-foreground hover:text-destructive'
											onClick={e => { e.stopPropagation(); setDeleteTarget(row); }}
											aria-label='Xóa'
										>
											<Trash2 className='size-3.5' />
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Create drawer */}
			<Drawer open={drawerOpen} onOpenChange={o => { if (!o) { setDrawerOpen(false); resetForm(); } }}>
				<DrawerPageContent>
					<DrawerHeader>
						<DrawerTitle>Tạo banner mới</DrawerTitle>
						<DrawerDescription>Banner sẽ hiển thị trên trang chủ theo thứ tự và loại.</DrawerDescription>
					</DrawerHeader>

					<div className='space-y-5 px-6 py-4'>
						{formError ? (
							<p className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>{formError}</p>
						) : null}

						<Field id='banner-image'>
							<FieldLabel>Ảnh banner</FieldLabel>
							<p className='text-xs text-muted-foreground mb-2'>
								{formType === 'HERO' ? 'Kích thước: 1920x640' : 'Kích thước: 1200x240'}
							</p>
							<ProductImagesEditor
								entries={formImage}
								onEntriesChange={setFormImage}
								fieldError={fieldErrors.image ?? null}
							/>
						</Field>

						<FieldGroup>
							<Field id='banner-url'>
								<FieldLabel>Hoặc nhập URL ảnh</FieldLabel>
								<Input
									value={formUrl}
									onChange={e => setFormUrl(e.target.value)}
									placeholder='https://images.unsplash.com/...'
								/>
							</Field>
						</FieldGroup>

						<FieldGroup className='grid grid-cols-2 gap-4'>
							<Field id='banner-type'>
								<FieldLabel>Loại banner</FieldLabel>
								<Select
									value={formType}
									onValueChange={v => setFormType(v as 'HERO' | 'BANNER')}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											<SelectItem value='HERO'>Hero (đầu trang)</SelectItem>
											<SelectItem value='BANNER'>Banner (trong trang)</SelectItem>
										</SelectGroup>
									</SelectContent>
								</Select>
							</Field>

							<Field id='banner-sort'>
								<FieldLabel>Thứ tự</FieldLabel>
								<Input
									inputMode='numeric'
									value={formSortOrder}
									onChange={e => setFormSortOrder(digitsOnly(e.target.value))}
								/>
							</Field>
						</FieldGroup>

						<Field id='banner-link'>
							<FieldLabel>Link (khi click)</FieldLabel>
							<Input
								value={formLink}
								onChange={e => setFormLink(e.target.value)}
								placeholder='https://... hoặc /thoi-trang'
							/>
						</Field>

						<Field id='banner-alt'>
							<FieldLabel>Alt text</FieldLabel>
							<Textarea
								value={formAlt}
								onChange={e => setFormAlt(e.target.value)}
								placeholder='Mô tả ngắn cho SEO và accessibility'
								rows={2}
							/>
						</Field>

						<div className='flex items-center gap-2'>
							<Switch checked={formActive} onCheckedChange={setFormActive} id='banner-active' />
							<label htmlFor='banner-active' className='text-sm'>Hiển thị ngay</label>
						</div>
					</div>

					<DrawerFooter>
						<Button type='button' onClick={() => setDrawerOpen(false)} variant='outline' disabled={formBusy}>
							Hủy
						</Button>
						<Button type='button' onClick={() => void handleCreate()} disabled={formBusy}>
							{formBusy ? 'Đang tạo...' : 'Tạo banner'}
						</Button>
					</DrawerFooter>
				</DrawerPageContent>
			</Drawer>

			{/* Delete dialog */}
			<AlertDialog open={deleteTarget !== null} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa banner này?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={() => void handleDelete()} disabled={deleteBusy}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
							{deleteBusy ? 'Đang xóa...' : 'Xóa'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
