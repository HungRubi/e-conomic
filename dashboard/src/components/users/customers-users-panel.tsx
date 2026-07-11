import * as React from 'react';

import { createCustomer, deleteCustomersBulk, deleteUser, fetchCustomers, type AdminUserRow } from '@/api/admin-users';
import { AuthApiError } from '@/auth/auth-api';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { usePaginatedUserList, type UserListSortKey } from '@/hooks/use-paginated-user-list';
import { useEntityCrud } from '@/hooks/use-permission';
import { dateStampForFile, exportToCsv } from '@/lib/csv-export';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';
import { type FieldErrorMap, scrollToFirstFieldError, stripFieldError } from '@/lib/form-field-ui';
import { cn } from '@/lib/utils';
import {
	ArrowUpRight,
	ChevronLeftIcon,
	ChevronRightIcon,
	DownloadIcon,
	EllipsisVerticalIcon,
	PlusIcon,
	Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const listCustomers = (params: Parameters<typeof fetchCustomers>[0]) => fetchCustomers(params);

const CUSTOMER_USER_FORM_SCROLL_ORDER = ['cust-uf-email', 'cust-uf-pass'] as const;

function isValidEmail(raw: string): boolean {
	const t = raw.trim();
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function CustomersUsersPanel() {
	const navigate = useNavigate();
	const crud = useEntityCrud('customers');

	const [qInput, setQInput] = React.useState('');
	const [sortBy, setSortBy] = React.useState<'createdAt' | 'email' | 'name'>('createdAt');
	const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
	const [pageSize, setPageSize] = React.useState(10);

	const { rows, total, loading, error, page, setPage, refetch, upsertRow, removeRow } = usePaginatedUserList(
		listCustomers,
		qInput,
		sortBy as UserListSortKey,
		sortOrder,
		pageSize
	);

	const [sheetOpen, setSheetOpen] = React.useState(false);
	const [formEmail, setFormEmail] = React.useState('');
	const [formName, setFormName] = React.useState('');
	const [formPhone, setFormPhone] = React.useState('');
	const [formPassword, setFormPassword] = React.useState('');
	const [formBusy, setFormBusy] = React.useState(false);
	const [formError, setFormError] = React.useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = React.useState<FieldErrorMap>({});
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
	const [deleteTarget, setDeleteTarget] = React.useState<AdminUserRow | null>(null);
	const [deleteBusy, setDeleteBusy] = React.useState(false);
	const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
	const [bulkDeleteBusy, setBulkDeleteBusy] = React.useState(false);

	function openCreate() {
		setFormEmail('');
		setFormName('');
		setFormPhone('');
		setFormPassword('');
		setFormError(null);
		setFieldErrors({});
		setSheetOpen(true);
	}

	function openDetail(row: AdminUserRow) {
		navigate(`/customers/${row.id}`);
	}

	async function submitForm() {
		setFormBusy(true);
		setFormError(null);
		const err: FieldErrorMap = {};
		const emailTrim = formEmail.trim();
		if (!emailTrim) err['cust-uf-email'] = 'Nhập email';
		else if (!isValidEmail(emailTrim)) err['cust-uf-email'] = 'Email không hợp lệ';
		if (formPassword.length < PASSWORD_MIN_LENGTH) {
			err['cust-uf-pass'] = `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`;
		}
		if (Object.keys(err).length > 0) {
			setFieldErrors(err);
			setFormBusy(false);
			scrollToFirstFieldError(CUSTOMER_USER_FORM_SCROLL_ORDER, err);
			return;
		}
		setFieldErrors({});
		try {
			const created = await createCustomer({
				email: emailTrim,
				password: formPassword,
				name: formName.trim() || undefined,
				phone: formPhone.trim() || undefined,
			});
			toast.success('Tạo khách hàng thành công');
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
			const deletedId = deleteTarget.id;
			const isLastRowOnPage = rows.length === 1;
			const shouldGoPrevPage = isLastRowOnPage && page > 0;

			await toast.promise(deleteUser(deleteTarget.id), {
				loading: 'Đang xóa khách hàng...',
				success: 'Xóa khách hàng thành công',
				error: 'Xóa khách hàng thất bại',
			});

			removeRow(deletedId);
			setSelectedIds(prev => {
				if (!prev.has(deletedId)) return prev;
				const next = new Set(prev);
				next.delete(deletedId);
				return next;
			});

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

	async function confirmBulkDelete() {
		const ids = [...selectedIds];
		if (ids.length === 0) return;
		setBulkDeleteBusy(true);
		try {
			await toast.promise(deleteCustomersBulk(ids), {
				loading: `Đang xóa ${ids.length} khách hàng…`,
				success: `Đã xóa ${ids.length} khách hàng`,
				error: 'Xóa thất bại',
			});
			setSelectedIds(new Set());
			setBulkDeleteOpen(false);
			void refetch({ silent: true });
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Xóa thất bại');
		} finally {
			setBulkDeleteBusy(false);
		}
	}

	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const pageIds = rows.map(r => r.id);
	const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
	const somePageSelected = !allPageSelected && pageIds.some(id => selectedIds.has(id));

	function togglePageSelection(checked: boolean) {
		setSelectedIds(prev => {
			const next = new Set(prev);
			for (const id of pageIds) {
				if (checked) next.add(id);
				else next.delete(id);
			}
			return next;
		});
	}

	function toggleRowSelection(id: string, checked: boolean) {
		setSelectedIds(prev => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	return (
		<div className='dashboard-fade-in flex min-h-0 flex-1 flex-col gap-4'>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-lg font-semibold tracking-tight'>Khách hàng</h1>
					<p className='text-muted-foreground text-sm'>Click một dòng để mở chi tiết và chỉnh sửa.</p>
				</div>
				{crud.canCreate ? (
					<Button type='button' size='sm' className='gap-1.5' onClick={openCreate}>
						<PlusIcon className='size-4' />
						Thêm khách hàng
					</Button>
				) : null}
			</div>

			<div className='flex flex-wrap items-center gap-2'>
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='gap-1.5'
					onClick={() => {
						const target = rows.filter(r => selectedIds.has(r.id));
						const list = target.length > 0 ? target : rows;
						if (list.length === 0) {
							toast.info('Không có khách hàng nào để xuất');
							return;
						}
						exportToCsv(`customers-${dateStampForFile()}`, list, [
							{ header: 'Email', accessor: (r: AdminUserRow) => r.email },
							{ header: 'Tên', accessor: (r: AdminUserRow) => r.name ?? '' },
							{ header: 'Số điện thoại', accessor: (r: AdminUserRow) => r.phone ?? '' },
							{ header: 'Vai trò', accessor: (r: AdminUserRow) => r.role },
							{ header: 'Ngày tạo', accessor: (r: AdminUserRow) => r.createdAt },
						]);
						toast.success(`đã xuất ${list.length} khách hàng ra CSV`);
					}}
					disabled={loading || rows.length === 0}
				>
					<DownloadIcon className='size-4' />
					Xuất CSV {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
				</Button>
				{crud.canDelete && selectedIds.size > 0 ? (
					<Button
						type='button'
						variant='destructive'
						size='sm'
						className='gap-1.5'
						onClick={() => setBulkDeleteOpen(true)}
					>
						<Trash2 className='size-4' />
						Xoá ({selectedIds.size})
					</Button>
				) : null}
			</div>

			<div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end'>
				<div className='min-w-48 flex-1'>
					<Input
						id='cust-user-q'
						name='customer-search'
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
									<Checkbox
										checked={allPageSelected || (somePageSelected ? 'indeterminate' : false)}
										onCheckedChange={v => togglePageSelection(Boolean(v))}
										aria-label='Chọn tất cả khách hàng trang hiện tại'
									/>
								</div>
							</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Tên</TableHead>
							<TableHead>Số điện thoại</TableHead>
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
										<div
											className='flex items-center justify-center'
											onClick={e => e.stopPropagation()}
										>
											<Checkbox
												checked={selectedIds.has(row.id)}
												onCheckedChange={v => toggleRowSelection(row.id, Boolean(v))}
												aria-label={`Chọn khách hàng ${row.email}`}
											/>
										</div>
									</TableCell>
									<TableCell className='font-medium'>{row.email}</TableCell>
									<TableCell>{row.name ?? '—'}</TableCell>
									<TableCell>{row.phone ?? '—'}</TableCell>
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
													aria-label='Mở thao tác khách hàng'
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
						<SheetTitle>Khách hàng mới</SheetTitle>
						<SheetDescription>Mật khẩu tối thiểu {PASSWORD_MIN_LENGTH} ký tự (theo API).</SheetDescription>
					</SheetHeader>
					<FieldGroup className='flex-1 overflow-y-auto px-6 py-5'>
						{formError ? (
							<p className='text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm'>
								{formError}
							</p>
						) : null}
						<Field>
							<FieldLabel htmlFor='cust-uf-email'>Email</FieldLabel>
							<Input
								id='cust-uf-email'
								name='customer-editor-email'
								type='email'
								autoComplete='new-password'
								inputMode='email'
								autoCapitalize='none'
								autoCorrect='off'
								spellCheck={false}
								className={cn(fieldErrors['cust-uf-email'] && 'border-destructive')}
								value={formEmail}
								onChange={e => {
									setFormEmail(e.target.value);
									stripFieldError(setFieldErrors, 'cust-uf-email');
								}}
								disabled={formBusy}
								aria-invalid={Boolean(fieldErrors['cust-uf-email'])}
							/>
							{fieldErrors['cust-uf-email'] ? (
								<p className='text-destructive mt-1 text-sm'>{fieldErrors['cust-uf-email']}</p>
							) : null}
						</Field>
						<Field>
							<FieldLabel htmlFor='cust-uf-name'>Tên</FieldLabel>
							<Input
								id='cust-uf-name'
								value={formName}
								onChange={e => setFormName(e.target.value)}
								disabled={formBusy}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='cust-uf-phone'>Số điện thoại</FieldLabel>
							<Input
								id='cust-uf-phone'
								type='tel'
								inputMode='tel'
								autoComplete='tel'
								value={formPhone}
								onChange={e => setFormPhone(e.target.value)}
								disabled={formBusy}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor='cust-uf-pass'>Mật khẩu</FieldLabel>
							<Input
								id='cust-uf-pass'
								type='password'
								autoComplete='new-password'
								className={cn(fieldErrors['cust-uf-pass'] && 'border-destructive')}
								value={formPassword}
								onChange={e => {
									setFormPassword(e.target.value);
									stripFieldError(setFieldErrors, 'cust-uf-pass');
								}}
								disabled={formBusy}
								aria-invalid={Boolean(fieldErrors['cust-uf-pass'])}
							/>
							{fieldErrors['cust-uf-pass'] ? (
								<p className='text-destructive mt-1 text-sm'>{fieldErrors['cust-uf-pass']}</p>
							) : null}
						</Field>
					</FieldGroup>
					<SheetFooter className='gap-2 border-t px-6 py-4 sm:justify-end'>
						<Button type='button' variant='outline' onClick={() => setSheetOpen(false)} disabled={formBusy}>
							Hủy
						</Button>
						<Button type='button' onClick={() => void submitForm()} disabled={formBusy}>
							{formBusy ? 'Đang lưu…' : 'Tạo khách hàng'}
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
						<AlertDialogTitle>Xóa khách hàng?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Khách hàng{' '}
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
			<AlertDialog
				open={bulkDeleteOpen}
				onOpenChange={open => !open && !bulkDeleteBusy && setBulkDeleteOpen(false)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa nhiều khách hàng?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Bạn sắp xóa{' '}
							<span className='font-medium text-foreground'>{selectedIds.size} khách hàng</span> vĩnh
							viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={bulkDeleteBusy}>Hủy</AlertDialogCancel>
						<AlertDialogAction disabled={bulkDeleteBusy} onClick={() => void confirmBulkDelete()}>
							{bulkDeleteBusy ? 'Đang xóa…' : 'Xoá tất cả'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
