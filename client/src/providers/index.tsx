'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './query-provider';
import { AppThemeProvider } from './theme-provider';
import { ToastProvider } from '@/components/ui/Toast';
import { FlyingCartProvider } from '@/components/product/FlyingCartProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppThemeProvider>
        <FlyingCartProvider>
          <ToastProvider>{children}</ToastProvider>
        </FlyingCartProvider>
      </AppThemeProvider>
    </QueryProvider>
  );
}
