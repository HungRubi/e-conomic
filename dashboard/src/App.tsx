import { Route, Routes } from 'react-router-dom';
import * as React from 'react';
import { adminNestedRouteElements } from '@/admin-routes';
import AdminLayout from '@/layouts/admin-layout';
import LoginPage from '@/login-page';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageLoader } from '@/components/page-loader';
import { RequireAuth } from '@/components/require-auth';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const ForgotPasswordPage = React.lazy(() => import('@/pages/forgot-password-page'));
const ResetPasswordPage = React.lazy(() => import('@/pages/reset-password-page'));

function publicLazy(node: React.ReactNode) {
	return (
		<ErrorBoundary>
			<React.Suspense fallback={<PageLoader />}>{node}</React.Suspense>
		</ErrorBoundary>
	);
}

export default function App() {
	return (
		<TooltipProvider delayDuration={0}>
			<Routes>
				<Route path='/login' element={<LoginPage />} />
				<Route path='/forgot-password' element={publicLazy(<ForgotPasswordPage />)} />
				<Route path='/reset-password/:token' element={publicLazy(<ResetPasswordPage />)} />
				<Route element={<RequireAuth />}>
					<Route element={<AdminLayout />}>{adminNestedRouteElements}</Route>
				</Route>
			</Routes>
			<Toaster />
		</TooltipProvider>
	);
}
