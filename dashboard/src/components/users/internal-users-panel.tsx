import * as React from 'react';

import { createInternalUser, deleteUser, fetchInternalUsers, type AdminUserRow } from '@/api/admin-users';
import { AuthApiError } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { TableEmptyStateRow } from '@/components/table-empty-state-row';
import { TableErrorStateRow } from '@/components/table-error-state-row';
import { TableRowsSkeleton } from '@/components/list-skeletons';
import { fmtUserDate, ROLE_LABEL } from '@/components/users/user-table-shared';
import { USER_ROLE_BADGE } from '@/lib/status-styles';
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePaginatedUserList } from '@/hooks/use-paginated-user-list';
import { useEntityCrud } from '@/hooks/use-permission';
import { type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';
import { cn } from '@/lib/utils';
import { GripVerticalIcon, ArrowUpRight, ChevronLeftIcon, ChevronRightIcon, EllipsisVerticalIcon, PlusIcon, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const listInternal = (params: Parameters<typeof fetchInternalUsers>[0]) => fetchInternalUsers(params);

const INTERNAL_USER_FORM_SCROLL_ORDER = ['int-uf-email', 'int-uf-pass'] as const;

function isValidEmail(raw: string): boolean {
	const t = raw.trim();
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function InternalUsersPanel() {
	const { user: currentUser } = useAuth();
	const navigate = useNavigate();
	const crud = useEntityCrud('internalUsers');

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<'createdAt' | 'email' | 'name' | 'role'>('createdAt');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
	const [pageSize, setPageSize] = React.useState(10);

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } = usePaginatedUserList(
		listInternal,
		qInput,
		sortBy,
		sortOrder,
		pageSize
	);

	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [formEmail, setFormEmail] = React.useState('');
	const [formName, setFormName] = React.useState('');
	const [formPassword, setFormPassword] = React.useState('');
	const [formRole, setFormRole] = React.useState<'ADMIN' | 'STAFF'>('STAFF');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});
	const [deleteTarget, setDeleteTarget] = React.useState<AdminUserRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);

	function openCreate() {
		setFormEmail('');
		setFormName('');
		setFormPassword('');
		setFormRole('STAFF');
		setFormError(null);
		setFieldErrors({});
		setSheetOpen(true);
	}

	function openDetail(row: AdminUserRow) {
		navigate(`/internal-users/${row.id}`);
	}

	async function submitForm() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};
		const emailTrim = formEmail.trim();
		if (!emailTrim) err['int-uf-email'] = 'Nhập email';
		else if (!isValidEmail(emailTrim)) err['int-uf-email'] = 'Email không hợp lệ';
		if (formPassword.length < PASSWORD_MIN_LENGTH) {
			err['int-uf-pass'] = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`;
		}
		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(INTERNAL_USER_FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});
		try {
			const created = await createInternalUser({
				email: emailTrim,
				password: formPassword,
				name: formName.trim() || undefined,
				role: formRole,
			});
			toast.success('Tạo tài khoản thành công');
			upsertRow(created, { prependOnInsert: page === 0 });
			setSheetOpen(false);
			if (page !== 0) {
				await refetch({ page: 0, silent: true });
			} else {
				void refetch({ silent: true });
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
			await toast.promise(deleteUser(deleteTarget.id), {
				loading: 'Đang xóa tài khoản...',
				success: 'Xóa tài khoản thành công',
				error: 'Xóa tài khoản thất bại',
			});
			removeRow(deleteTarget.id);
			void refetch({ silent: true });
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
					<h1 className='text-lg font-semibold tracking-tight'>Tài khoản nội bộ</h1>
					<p className='text-muted-foreground text-sm'>
						Click một dòng để mở chi tiết và chỉnh sửa.
					</p>
				</div>
				{crud.canCreate ? (
					<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
						<PlusIcon className='size-4' />
						Thêm tài khoản
					</Button>
				) : null}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='internal-user-q'
						name='internal-user-search'
						placeholder='Email hoặc tên…'
						value={qInput}
						onChange={e => setQInput(e.target.value)}
						autoComplete='off'
						autoCapitalize='none'
						autoCorrect='off'
						spellCheck={false}
					/>
				</div>
				<div className='flex flex-wrap gap-2'>
					<div>
						<Select value={sortBy} onValueChange={v => setSortBy(v as typeof sortBy)}>
							<SelectTrigger className='w-42'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value='createdAt'>Ngày tạo</SelectItem>
									<SelectItem value='email'>Email</SelectItem>
									<SelectItem value='name'>Tên</SelectItem>
									<SelectItem value='role'>Vai trò</SelectItem>
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
									<SelectItem value='desc'>Giảm dần</SelectItem>
									<SelectItem value='asc'>Tăng dần</SelectItem>
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
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-10'>
								<div className='flex items-center justify-center'>
									<GripVerticalIcon className='text-muted-foreground size-4' />
								</div>
							</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Tên</TableHead>
							<TableHead>Vai trò</TableHead>
							<TableHead>Ngày tạo</TableHead>
							<TableHead className='w-16 text-right'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRowsSkeleton rows={5} columns={6} />
						) : error ? (
							<TableErrorStateRow colSpan={6} message={error} onRetry={() => void refetch()} />
						) : rows.length === 0 ? (
							<TableEmptyStateRow colSpan={6} />
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
										<div className='flex items-center justify-center'>
											<GripVerticalIcon className='text-muted-foreground size-4' />
										</div>
									</TableCell>
									<TableCell className='font-medium'>{row.email}</TableCell>
									<TableCell>{row.name ?? '—'}</TableCell>
									<TableCell>
										<Badge variant={USER_ROLE_BADGE[row.role]}>{ROLE_LABEL[row.role]}</Badge>
									</TableCell>
									<TableCell className='text-muted-foreground text-sm'>
										{fmtUserDate(row.createdAt)}
									</TableCell>
									<TableCell className='text-right'>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													type='button'
													variant='ghost'
													size='icon'
													className='ml-auto size-8 text-muted-foreground data-[state=open]:bg-muted'
													aria-label='Mở thao tác tài khoản'
													onClick={e => e.stopPropagation()}
												>
													<EllipsisVerticalIcon className='size-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='end'
												className='w-44'
												onClick={e => e.stopPropagation()}
											>
												<DropdownMenuItem onClick={() => openDetail(row)}>
													<ArrowUpRight className='size-4' />
													Mở chi tiết
												</DropdownMenuItem>
												{crud.canDelete ? (
													<>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant='destructive'
															disabled={row.id === currentUser?.id}
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

			<Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
				<SheetContent className='flex flex-col gap-0 p-0 sm:max-w-137'>
					<SheetHeader className='border-b px-6 py-5 pr-16'>
						<SheetTitle>Tài khoản mới</SheetTitle>
						<SheetDescription>
							Mật khẩu tối thiểu {PASSWORD_MIN_LENGTH} ký tự (theo API).
						</SheetDescription>
					</SheetHeader>
					<FieldGroup className='flex-1 overflow-y-auto px-6 py-5'>
						{formError ? (
							<p className='text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm'>
								{formError}
							</p>
						) : null}
						<Field>
							<FieldLabel htmlFor='int-uf-email'>Email</FieldLabel>
							<Input
								id='int-uf-email'
								name='internal-user-editor-email'
								type='email'
								autoComplete='new-password'
								inputMode='email'
								autoCapitalize='none'
								autoCorrect='off'
								spellCheck={false}
								className={cn(fieldErrors['int-uf-email'] && 'border-destructive')}
								value={formEmail}
								onChange={e => {
									setFormEmail(e.target.value);
									stripFieldError(setFieldErrors, 'int-uf-email');
								}}
								disabled={formBusy}
								aria-invalid={Boolean(fieldErrors['int-uf-email'])}
							/>
							{fieldErrors['int-uf-email'] ? (
								<p className='text-destructive mt-1 text-sm'>{fieldErrors['int-uf-email']}</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel htmlFor='int-uf-name'>Tên</FieldLabel>
							<Input
								id='int-uf-name'
								value={formName}
								onChange={e => setFormName(e.target.value)}
								disabled={formBusy}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='int-uf-pass'>Mật khẩu</FieldLabel>
							<Input
								id='int-uf-pass'
								type='password'
								autoComplete='new-password'
								className={cn(fieldErrors['int-uf-pass'] && 'border-destructive')}
								value={formPassword}
								onChange={e => {
									setFormPassword(e.target.value);
									stripFieldError(setFieldErrors, 'int-uf-pass');
								}}
								disabled={formBusy}
								aria-invalid={Boolean(fieldErrors['int-uf-pass'])}
							/>
							{fieldErrors['int-uf-pass'] ? (
								<p className='text-destructive mt-1 text-sm'>{fieldErrors['int-uf-pass']}</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel>Vai trò</FieldLabel>
							<Select value={formRole} onValueChange={v => setFormRole(v as 'ADMIN' | 'STAFF')}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='ADMIN'>Quản trị</SelectItem>
										<SelectItem value='STAFF'>Nhân viên</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</Field>
					</FieldGroup>
					<SheetFooter className='gap-2 border-t px-6 py-4 sm:justify-end'>
						<Button type='button' variant='outline' onClick={() => setSheetOpen(false)} disabled={formBusy}>
							Hủy
						</Button>
						<Button type='button' onClick={() => void submitForm()} disabled={formBusy}>
							{formBusy ? 'Đang lưu…' : 'Tạo tài khoản'}
						</Button>
					</SheetFooter>
				</SheetContent>
			</Sheet>
			<AlertDialog
				open={Boolean(deleteTarget)}
				onOpenChange={open => !open && !deleteBusy && setDeleteTarget(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa tài khoản?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Tài khoản{' '}
							<span className='font-medium text-foreground'>{deleteTarget?.email}</span> sẽ bị xóa vĩnh
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
