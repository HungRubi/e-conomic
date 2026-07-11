'use client';

import { type ReactNode } from 'react';
import { Toaster } from '@medusajs/ui';
import { QueryProvider } from './query-provider';
import { AppThemeProvider } from './theme-provider';
import { FlyingCartProvider } from '@/components/product/FlyingCartProvider';

export function Providers({ children }: { children: ReactNode }) {
	return (
		<QueryProvider>
			<AppThemeProvider>
				<FlyingCartProvider>
					{children}
					<Toaster />
				</FlyingCartProvider>
			</AppThemeProvider>
		</QueryProvider>
	);
}
