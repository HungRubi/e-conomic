import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	ArrowLeftIcon,
	CalendarClockIcon,
	CopyIcon,
	HashIcon,
	KeyRoundIcon,
	MailIcon,
	PhoneIcon,
	Trash2Icon,
	UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { deleteUser, fetchUserById, updateUser, type AdminUserRow } from '@/api/admin-users';
import { AuthApiError } from '@/auth/auth-api';
import { EditableField } from '@/components/common/editable-field';
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
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { fmtUserDate } from '@/components/users/user-table-shared';
import { useEntityCrud } from '@/hooks/use-permission';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';
import { cn } from '@/lib/utils';

function isValidEmail(raw: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

async function copyToClipboard(value: string, message: string) {
	try {
		await navigator.clipboard.writeText(value);
		toast.success(message);
	} catch {
		toast.error('Không sao chép được');
	}
}

export function CustomerDetailPanel() {
	const params = useParams<{ customerId: string }>();
	const customerId = params.customerId ?? '';

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['admin-customer', customerId],
		queryFn: () => fetchUserById(customerId),
		enabled: customerId.length > 0,
	});

	if (!customerId) return <NotFoundState />;
	if (isLoading) return <DetailSkeleton />;
	if (error) {
		return (
			<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-10 text-center'>
				<p className='text-sm font-medium text-destructive'>
					{error instanceof Error ? error.message : 'Không tải được khách hàng'}
				</p>
				<Button asChild type='button' variant='ghost'>
					<Link to='/customers'>
						<ArrowLeftIcon className='mr-1 size-4' />
						Về danh sách
					</Link>
				</Button>
			</div>
		);
	}
	if (!data) return <NotFoundState />;

	return <DetailContent customer={data} onChanged={() => void refetch()} />;
}

function DetailContent({ customer, onChanged }: { customer: AdminUserRow; onChanged: () => void }) {
	const navigate = useNavigate();
	const crud = useEntityCrud('customers');

	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [actionBusy, setActionBusy] = React.useState<'delete' | null>(null);
	const [passwordOpen, setPasswordOpen] = React.useState(false);

	async function patch(body: Parameters<typeof updateUser>[1]) {
		if (!crud.canUpdate) throw new Error('Bạn không có quyền chỉnh sửa');
		await updateUser(customer.id, body);
		onChanged();
	}

	async function onDelete() {
		setActionBusy('delete');
		try {
			await deleteUser(customer.id);
			toast.success('đã xoá khách hàng');
			navigate('/customers');
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
						onClick={() => navigate('/customers')}
						aria-label='Quay lại danh sách'
					>
						<ArrowLeftIcon className='size-4' />
					</Button>
					<div className='min-w-0'>
						<p className='text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground'>
							Khách hàng
						</p>
						<div className='mt-1 flex items-center gap-2'>
							<h1 className='truncate text-lg font-semibold tracking-tight'>
								{customer.name ?? customer.email}
							</h1>
							<Button
								type='button'
								variant='ghost'
								size='icon'
								className='size-7 text-muted-foreground'
								onClick={() => copyToClipboard(customer.id, 'đã sao chép ID')}
								aria-label='Sao chép ID'
							>
								<CopyIcon className='size-3.5' />
							</Button>
						</div>
						<div className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground tabular-nums'>
							<span className='inline-flex items-center gap-1 font-mono' translate='no'>
								<HashIcon className='size-3' aria-hidden />
								{customer.id.slice(0, 8)}…
							</span>
							<span aria-hidden>·</span>
							<span className='inline-flex items-center gap-1'>
								<CalendarClockIcon className='size-3.5' aria-hidden />
								Tạo {fmtUserDate(customer.createdAt)}
							</span>
							{customer.updatedAt !== customer.createdAt ? (
								<>
									<span aria-hidden>·</span>
									<span>Cập nhật {fmtUserDate(customer.updatedAt)}</span>
								</>
							) : null}
						</div>
					</div>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<Badge variant='outline'>Khách hàng</Badge>
				</div>
			</header>

			<div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]'>
				<div className='min-w-0 space-y-4'>
					<section className='dashboard-slide-up rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
						<SectionHeading icon={UserIcon} title='Thông tin khách hàng' />
						<div className='mt-3 space-y-1'>
							<EditableField
								label='Email'
								type='text'
								value={customer.email}
								disabled={!crud.canUpdate}
								onSave={v => patch({ email: v })}
								validate={v => (isValidEmail(v) ? null : 'Email không hợp lệ')}
							/>
							<EditableField
								label='Tên hiển thị'
								type='text'
								value={customer.name ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ name: v.trim() ? v : null })}
								emptyHint='Chưa đặt tên'
							/>
							<EditableField
								label='Số điện thoại'
								type='text'
								value={customer.phone ?? ''}
								disabled={!crud.canUpdate}
								onSave={v => patch({ phone: v.trim() ? v : null })}
								emptyHint='Chưa có'
							/>
						</div>
					</section>
				</div>

				<aside className='lg:sticky lg:top-4 lg:self-start'>
					<div className='space-y-4'>
						<section className='dashboard-slide-up overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10'>
							<div className='border-b border-border/60 p-4'>
								<SectionHeading icon={KeyRoundIcon} title='Bảo mật' />
							</div>
							<div className='flex flex-col gap-2 p-4'>
								{crud.canUpdate ? (
									<Button
										type='button'
										variant='outline'
										onClick={() => setPasswordOpen(true)}
										className='justify-start'
									>
										<KeyRoundIcon className='mr-1.5 size-4' />
										Đổi mật khẩu
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
										Xoá khách hàng
									</Button>
								) : null}
							</div>
						</section>

						<section className='dashboard-slide-up dashboard-stagger-1 rounded-xl bg-card p-4 ring-1 ring-foreground/10'>
							<SectionHeading icon={MailIcon} title='Liên hệ' />
							<dl className='mt-2 space-y-2 text-sm'>
								<div className='flex items-center justify-between gap-2'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<MailIcon className='size-3.5' aria-hidden />
										Email
									</dt>
									<dd className='truncate font-medium'>{customer.email}</dd>
								</div>
								<div className='flex items-center justify-between gap-2'>
									<dt className='inline-flex items-center gap-1.5 text-muted-foreground'>
										<PhoneIcon className='size-3.5' aria-hidden />
										Điện thoại
									</dt>
									<dd className='font-medium'>{customer.phone ?? '—'}</dd>
								</div>
							</dl>
						</section>
					</div>
				</aside>
			</div>

			<PasswordSheet
				open={passwordOpen}
				onOpenChange={setPasswordOpen}
				userEmail={customer.email}
				onSubmit={async newPassword => {
					await patch({ password: newPassword });
					toast.success('đã đổi mật khẩu');
				}}
			/>

			<AlertDialog open={confirmDelete} onOpenChange={open => !actionBusy && setConfirmDelete(open)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xoá khách hàng này?</AlertDialogTitle>
						<AlertDialogDescription>
							<span className='font-medium text-foreground'>{customer.email}</span> sẽ bị xoá vĩnh viễn.
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

function PasswordSheet({
	open,
	onOpenChange,
	userEmail,
	onSubmit,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	userEmail: string;
	onSubmit: (password: string) => Promise<void>;
}) {
	const [password, setPassword] = React.useState('');
	const [busy, setBusy] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (!open) {
			setPassword('');
			setError(null);
		}
	}, [open]);

	async function submit() {
		if (password.length < PASSWORD_MIN_LENGTH) {
			setError(`Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`);
			return;
		}
		setBusy(true);
		setError(null);
		try {
			await onSubmit(password);
			onOpenChange(false);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Không đổi được mật khẩu';
			setError(msg);
			toast.error(msg);
		} finally {
			setBusy(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className='flex flex-col gap-0 p-0 sm:max-w-110'>
				<SheetHeader className='border-b px-6 py-5 pr-16'>
					<SheetTitle>Đổi mật khẩu</SheetTitle>
					<SheetDescription>
						đặt mật khẩu mới cho <span className='font-medium text-foreground'>{userEmail}</span>. Tối thiểu{' '}
						{PASSWORD_MIN_LENGTH} ký tự.
					</SheetDescription>
				</SheetHeader>
				<FieldGroup className='flex-1 overflow-y-auto px-6 py-5'>
					{error ? (
						<p className='text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm'>{error}</p>
					) : null}
					<Field>
						<FieldLabel htmlFor='customer-detail-pw'>Mật khẩu mới</FieldLabel>
						<Input
							id='customer-detail-pw'
							type='password'
							autoComplete='new-password'
							value={password}
							onChange={e => {
								setPassword(e.target.value);
								if (error) setError(null);
							}}
							disabled={busy}
							className={cn(error && 'border-destructive')}
						/>
					</Field>
				</FieldGroup>
				<SheetFooter className='gap-2 border-t px-6 py-4 sm:justify-end'>
					<Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={busy}>
						Hủy
					</Button>
					<Button type='button' onClick={() => void submit()} disabled={busy}>
						{busy ? 'Đang lưu…' : 'Lưu mật khẩu'}
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
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	hint?: string;
}) {
	return (
		<div className='flex items-start gap-2'>
			<Icon className='mt-0.5 size-4 shrink-0 text-muted-foreground' aria-hidden />
			<div>
				<h3 className='text-sm font-semibold tracking-tight'>{title}</h3>
				{hint ? <p className='mt-0.5 text-xs text-muted-foreground'>{hint}</p> : null}
			</div>
		</div>
	);
}

function NotFoundState() {
	return (
		<div className='dashboard-fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-10 text-center'>
			<p className='text-sm font-medium'>Không tìm thấy khách hàng</p>
			<Button asChild type='button' variant='outline'>
				<Link to='/customers'>
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
				</div>
				<div className='space-y-4'>
					<Skeleton className='h-40 w-full rounded-xl' />
					<Skeleton className='h-32 w-full rounded-xl' />
				</div>
			</div>
		</div>
	);
}
