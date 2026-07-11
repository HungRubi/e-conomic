import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { resetPassword } from '@/api/account';
import { AuthApiError } from '@/auth/auth-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';

export default function ResetPasswordPage() {
	const { token } = useParams<{ token: string }>();
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = React.useState('');
	const [confirm, setConfirm] = React.useState('');
	const [pending, setPending] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [done, setDone] = React.useState(false);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		if (!token) {
			setError('Thiếu token reset password');
			return;
		}
		if (newPassword.length < PASSWORD_MIN_LENGTH) {
			setError(`Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`);
			return;
		}
		if (newPassword !== confirm) {
			setError('Xác nhận mật khẩu chưa khớp');
			return;
		}
		setPending(true);
		try {
			await resetPassword(token, newPassword);
			setDone(true);
		} catch (err) {
			setError(err instanceof AuthApiError ? err.message : 'Token không hợp lệ hoặc đã hết hạn');
		} finally {
			setPending(false);
		}
	}

	return (
		<div className='flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='w-full max-w-sm'>
				<Card>
					<CardHeader>
						<div className='flex flex-col items-center gap-3 pb-2 text-center'>
							<span className='text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground sm:text-xs sm:tracking-[0.18em] md:text-sm md:tracking-[0.2em]'>
								MIUE HEALING
							</span>
							<p className='text-muted-foreground text-xs'>đặt lại mật khẩu</p>
						</div>
					</CardHeader>
					<CardContent>
						{done ? (
							<div className='space-y-3 text-sm'>
								<p>đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.</p>
								<Button
									type='button'
									className='w-full'
									onClick={() => navigate('/login', { replace: true })}
								>
									Về đăng nhập
								</Button>
							</div>
						) : (
							<form onSubmit={onSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor='rp-new'>Mật khẩu mới</FieldLabel>
										<Input
											id='rp-new'
											type='password'
											autoComplete='new-password'
											required
											value={newPassword}
											onChange={e => setNewPassword(e.target.value)}
											disabled={pending}
										/>
									</Field>
									<Field>
										<FieldLabel htmlFor='rp-confirm'>Xác nhận mật khẩu</FieldLabel>
										<Input
											id='rp-confirm'
											type='password'
											autoComplete='new-password'
											required
											value={confirm}
											onChange={e => setConfirm(e.target.value)}
											disabled={pending}
										/>
									</Field>
									{error ? (
										<p className='text-destructive text-xs' role='alert'>
											{error}
										</p>
									) : null}
									<Field>
										<Button type='submit' className='w-full' disabled={pending}>
											{pending ? 'Đang lưu…' : 'đặt lại mật khẩu'}
										</Button>
									</Field>
									<p className='text-center text-xs text-muted-foreground'>
										<Link to='/login' className='underline'>
											Quay lại đăng nhập
										</Link>
									</p>
								</FieldGroup>
							</form>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
