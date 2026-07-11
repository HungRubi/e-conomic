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

export function LoginForm({ className, ...props }: ComponentProps<'div'>) {
	const { login, ready } = useAuth();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setPending(true);
		try {
			await login(email.trim(), password);
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
						<p className='text-muted-foreground text-center text-xs'>Đăng nhập quản trị</p>
					</div>
				</CardHeader>
				<CardContent>
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
									onChange={e => setEmail(e.target.value)}
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
									onChange={e => setPassword(e.target.value)}
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
				</CardContent>
			</Card>
		</div>
	);
}
