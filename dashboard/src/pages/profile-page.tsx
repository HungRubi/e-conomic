import * as React from 'react';
import { toast } from 'sonner';
import { KeyRoundIcon, UserCircle2Icon } from 'lucide-react';

import { changeMyPassword, updateMyProfile } from '@/api/account';
import { AuthApiError } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TwoFactorSection } from '@/components/two-factor-section';
import { ROLE_LABEL } from '@/components/users/user-table-shared';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';
import { USER_ROLE_BADGE } from '@/lib/status-styles';

export default function ProfilePage() {
	const { user, refreshUser } = useAuth();

	const [name, setName] = React.useState(user?.name ?? '');
	const [savingName, setSavingName] = React.useState(false);

	const [currentPassword, setCurrentPassword] = React.useState('');
	const [newPassword, setNewPassword] = React.useState('');
	const [confirmPassword, setConfirmPassword] = React.useState('');
	const [savingPassword, setSavingPassword] = React.useState(false);
	const [pwError, setPwError] = React.useState<string | null>(null);

	if (!user) {
		return null;
	}

	const nameDirty = (user.name ?? '') !== name;

	async function saveName() {
		if (!user || !nameDirty) return;
		setSavingName(true);
		try {
			await updateMyProfile({ name: name.trim() || undefined });
			await refreshUser();
			toast.success('đã cập nhật tên hiển thị');
		} catch (e) {
			toast.error(e instanceof AuthApiError ? e.message : 'Cập nhật thất bại');
		} finally {
			setSavingName(false);
		}
	}

	async function savePassword() {
		if (!user) return;
		setPwError(null);
		if (newPassword.length < PASSWORD_MIN_LENGTH) {
			setPwError(`Mật khẩu mới tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`);
			return;
		}
		if (newPassword !== confirmPassword) {
			setPwError('Xác nhận mật khẩu chưa khớp');
			return;
		}
		if (currentPassword.length === 0) {
			setPwError('Nhập mật khẩu hiện tại');
			return;
		}
		setSavingPassword(true);
		try {
			await changeMyPassword(currentPassword, newPassword);
			toast.success('Đổi mật khẩu thành công');
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (e) {
			const message = e instanceof AuthApiError ? e.message : 'Đổi mật khẩu thất bại';
			setPwError(message);
			toast.error(message);
		} finally {
			setSavingPassword(false);
		}
	}

	return (
		<div className='mx-auto w-full max-w-3xl space-y-5'>
			<header className='border-b border-border/60 pb-3'>
				<h1 className='text-lg font-semibold tracking-tight'>Tài khoản của tôi</h1>
				<p className='text-xs text-muted-foreground'>Cập nhật thông tin cá nhân và mật khẩu đăng nhập.</p>
			</header>

			<Card className='gap-4 p-5'>
				<div className='flex items-start gap-3'>
					<UserCircle2Icon className='mt-0.5 size-5 text-muted-foreground' aria-hidden />
					<div className='flex-1'>
						<p className='text-sm font-semibold'>Hồ sơ</p>
						<p className='text-xs text-muted-foreground'>Email không thể thay đổi từ trang này.</p>
					</div>
					<Badge variant={USER_ROLE_BADGE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
				</div>

				<FieldGroup className='gap-4'>
					<Field>
						<FieldLabel htmlFor='profile-email'>Email</FieldLabel>
						<Input id='profile-email' value={user.email} readOnly disabled />
					</Field>
					<Field>
						<FieldLabel htmlFor='profile-name'>Tên hiển thị</FieldLabel>
						<Input
							id='profile-name'
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder='Họ và tên'
							disabled={savingName}
						/>
					</Field>
					<div className='flex justify-end'>
						<Button type='button' onClick={() => void saveName()} disabled={!nameDirty || savingName}>
							{savingName ? 'Đang lưu…' : 'Lưu thay đổi'}
						</Button>
					</div>
				</FieldGroup>
			</Card>

			<Card className='gap-4 p-5'>
				<div className='flex items-start gap-3'>
					<KeyRoundIcon className='mt-0.5 size-5 text-muted-foreground' aria-hidden />
					<div className='flex-1'>
						<p className='text-sm font-semibold'>Đổi mật khẩu</p>
						<p className='text-xs text-muted-foreground'>
							Mật khẩu mới tối thiểu {PASSWORD_MIN_LENGTH} ký tự.
						</p>
					</div>
				</div>
				<FieldGroup className='gap-4'>
					<Field>
						<FieldLabel htmlFor='profile-current-pass'>Mật khẩu hiện tại</FieldLabel>
						<Input
							id='profile-current-pass'
							type='password'
							autoComplete='current-password'
							value={currentPassword}
							onChange={e => setCurrentPassword(e.target.value)}
							disabled={savingPassword}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor='profile-new-pass'>Mật khẩu mới</FieldLabel>
						<Input
							id='profile-new-pass'
							type='password'
							autoComplete='new-password'
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							disabled={savingPassword}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor='profile-confirm-pass'>Xác nhận mật khẩu mới</FieldLabel>
						<Input
							id='profile-confirm-pass'
							type='password'
							autoComplete='new-password'
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							disabled={savingPassword}
						/>
					</Field>
					{pwError ? <p className='text-sm text-destructive'>{pwError}</p> : null}
					<div className='flex justify-end'>
						<Button type='button' onClick={() => void savePassword()} disabled={savingPassword}>
							{savingPassword ? 'Đang lưu…' : 'Đổi mật khẩu'}
						</Button>
					</div>
				</FieldGroup>
			</Card>

			<TwoFactorSection
				totpEnabled={Boolean(user.totpEnabled)}
				backupCodesRemaining={user.totpBackupCodesRemaining}
				onChanged={() => {
					void refreshUser();
				}}
			/>
		</div>
	);
}
