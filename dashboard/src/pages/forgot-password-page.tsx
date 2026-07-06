import * as React from 'react';
import { Link } from 'react-router-dom';

import { requestForgotPassword } from '@/api/account';
import { AuthApiError } from '@/auth/auth-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPasswordPage() {
	const [email, setEmail] = React.useState('');
	const [pending, setPending] = React.useState(false);
	const [done, setDone] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [devToken, setDevToken] = React.useState<string | null>(null);
	const [cooldown, setCooldown] = React.useState(0);

	React.useEffect(() => {
		if (cooldown <= 0) return;
		const timer = window.setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1_000);
		return () => window.clearTimeout(timer);
	}, [cooldown]);

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);
		try {
			const res = await requestForgotPassword(email.trim());
			setDone(true);
			setCooldown(RESEND_COOLDOWN_SECONDS);
			if (res.token) setDevToken(res.token);
		} catch (err) {
			if (err instanceof AuthApiError && err.status === 429) {
				setError('Bạn gửi yêu cầu quá nhanh. Thử lại sau ít phút.');
			} else {
				setError(err instanceof AuthApiError ? err.message : 'Có lỗi xảy ra. Thử lại sau.');
			}
		} finally {
			setPending(false);
		}
	}

	async function onResend() {
		if (cooldown > 0) return;
		setError(null);
		setPending(true);
		try {
			const res = await requestForgotPassword(email.trim());
			setCooldown(RESEND_COOLDOWN_SECONDS);
			if (res.token) setDevToken(res.token);
		} catch (err) {
			setError(err instanceof AuthApiError ? err.message : 'Không gửi lại được, thử sau.');
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
							<p className='text-muted-foreground text-xs'>Quên mật khẩu</p>
						</div>
					</CardHeader>
					<CardContent>
						{done ? (
							<div className='space-y-3 text-sm'>
								<p>
									Nếu địa chỉ <strong>{email}</strong> tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt
									lại mật khẩu qua email.
								</p>
								<p className='text-xs text-muted-foreground'>
									Liên kết có hiệu lực 30 phút. Nếu không nhận được email, kiểm tra hộp thư rác hoặc thử lại sau.
								</p>
								{devToken ? (
									<div className='rounded-md border border-amber-300/50 bg-amber-50/50 p-2 text-xs dark:bg-amber-500/10'>
										<p className='font-medium text-amber-900 dark:text-amber-200'>Dev token (chỉ hiển thị ở môi trường non-production):</p>
										<code className='mt-1 block break-all'>{devToken}</code>
										<Link to={`/reset-password/${devToken}`} className='mt-1 inline-block text-amber-900 underline dark:text-amber-200'>
											Mở trang reset →
										</Link>
									</div>
								) : null}
								<div className='flex gap-2'>
									<Button
										type='button'
										variant='outline'
										className='flex-1'
										onClick={onResend}
										disabled={pending || cooldown > 0}
									>
										{cooldown > 0 ? `Gửi lại sau ${cooldown}s` : pending ? 'Đang gửi…' : 'Gửi lại'}
									</Button>
									<Button asChild type='button' className='flex-1'>
										<Link to='/login'>Về đăng nhập</Link>
									</Button>
								</div>
								{error ? <p className='text-destructive text-xs' role='alert'>{error}</p> : null}
							</div>
						) : (
							<form onSubmit={onSubmit}>
								<FieldGroup>
									<Field>
										<FieldLabel htmlFor='fp-email'>Email</FieldLabel>
										<Input
											id='fp-email'
											type='email'
											autoComplete='email'
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											disabled={pending}
										/>
									</Field>
									{error ? <p className='text-destructive text-xs' role='alert'>{error}</p> : null}
									<Field>
										<Button type='submit' className='w-full' disabled={pending}>
											{pending ? 'Đang xử lý…' : 'Gửi link đặt lại'}
										</Button>
									</Field>
									<p className='text-center text-xs text-muted-foreground'>
										<Link to='/login' className='underline'>Quay lại đăng nhập</Link>
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
