import type { ComponentProps, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthApiError } from '@/auth/auth-api';
import { useAuth } from '@/auth/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type Step = 'credentials' | 'totp';

export function LoginForm({ className, ...props }: ComponentProps<'div'>) {
	const { login, completeTotpLogin, ready } = useAuth();
	const navigate = useNavigate();
	const [step, setStep] = useState<Step>('credentials');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [challengeToken, setChallengeToken] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);
		try {
			const result = await login(email.trim(), password);
			if (result.totpRequired && result.challengeToken) {
				setChallengeToken(result.challengeToken);
				setStep('totp');
				return;
			}
			navigate('/', { replace: true });
		} catch (err) {
			const message =
				err instanceof AuthApiError
					? err.message
					: 'Không thể đăng nhập. Kiểm tra kết nối tới server hoặc thử lại.';
			setError(message);
		} finally {
			setPending(false);
		}
	}

	async function onSubmitTotp(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!challengeToken) return;
		setError(null);
		setPending(true);
		try {
			await completeTotpLogin(challengeToken, code.trim());
			navigate('/', { replace: true });
		} catch (err) {
			const message = err instanceof AuthApiError ? err.message : 'Mã 2FA không đúng';
			setError(message);
		} finally {
			setPending(false);
		}
	}

	return (
		<div className={cn('flex flex-col gap-6', className)} {...props}>
			<Card>
				<CardHeader>
					<div className='flex flex-col items-center gap-3 pb-2'>
						<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100/90 ring-1 ring-zinc-200 dark:bg-zinc-800/70 dark:ring-zinc-700'>
							<img
								src='/images/logo.png'
								alt='Logo Miue.healing'
								width={20}
								height={20}
								className='size-5 shrink-0 rounded-full object-cover'
							/>
						</div>
						<span className='text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground sm:text-xs sm:tracking-[0.18em] md:text-sm md:tracking-[0.2em]'>
							MIUE HEALING
						</span>
						<p className='text-muted-foreground text-center text-xs'>
							{step === 'credentials' ? 'Đăng nhập quản trị' : 'Xác thực hai bước'}
						</p>
					</div>
				</CardHeader>
				<CardContent>
					{step === 'credentials' ? (
						<form onSubmit={onSubmit}>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor='email'>Email</FieldLabel>
									<Input
										id='email'
										type='email'
										autoComplete='email'
										placeholder='admin@example.com'
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={pending || !ready}
									/>
								</Field>
								<Field>
									<div className='flex items-center'>
										<FieldLabel htmlFor='password'>Mật khẩu</FieldLabel>
										<Link
											to='/forgot-password'
											className='text-muted-foreground hover:text-foreground ml-auto text-xs underline-offset-4 hover:underline'
										>
											Quên mật khẩu?
										</Link>
									</div>
									<Input
										id='password'
										type='password'
										autoComplete='current-password'
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={pending || !ready}
									/>
								</Field>
								{error ? (
									<p className='text-destructive text-xs' role='alert'>
										{error}
									</p>
								) : null}
								<Field>
									<Button type='submit' className='w-full' disabled={pending || !ready}>
										{pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
									</Button>
								</Field>
							</FieldGroup>
						</form>
					) : (
						<form onSubmit={onSubmitTotp}>
							<FieldGroup>
								<p className='text-muted-foreground text-xs'>
									Nhập mã 6 chữ số từ ứng dụng xác thực (Google Authenticator, 1Password, Authy…) cho tài khoản{' '}
									<strong>{email}</strong>.
								</p>
								<Field>
									<FieldLabel htmlFor='totp-code'>Mã 2FA</FieldLabel>
									<Input
										id='totp-code'
										inputMode='numeric'
										autoComplete='one-time-code'
										maxLength={6}
										pattern='\\d{6}'
										required
										value={code}
										onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
										disabled={pending}
									/>
								</Field>
								{error ? (
									<p className='text-destructive text-xs' role='alert'>
										{error}
									</p>
								) : null}
								<Field>
									<Button type='submit' className='w-full' disabled={pending || code.length !== 6}>
										{pending ? 'Đang xác thực…' : 'Xác thực'}
									</Button>
								</Field>
								<button
									type='button'
									className='text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline'
									onClick={() => {
										setStep('credentials');
										setCode('');
										setChallengeToken(null);
										setError(null);
									}}
								>
									Quay lại đăng nhập
								</button>
							</FieldGroup>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}