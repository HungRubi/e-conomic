import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/auth-context';
import { LoginForm } from '@/components/login-form';
import { ThemeToggle } from '@/components/theme-toggle';

/** Khớp layout block login-01 (registry shadcn radix-nova). */
export default function LoginPage() {
	const { user, ready } = useAuth();
	const location = useLocation();
	const rawFrom = (location.state as { from?: string } | null)?.from;
	const from = rawFrom && rawFrom !== '/login' ? rawFrom : '/';

	if (ready && user) {
		return <Navigate to={from} replace />;
	}

	return (
		<div className='relative flex min-h-svh w-full items-center justify-center p-6 md:p-10'>
			<div className='absolute right-4 top-4'>
				<ThemeToggle />
			</div>
			<div className='w-full max-w-sm'>
				<LoginForm />
			</div>
		</div>
	);
}
