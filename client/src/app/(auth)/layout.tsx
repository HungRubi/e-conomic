import type { ReactNode } from 'react';
import BottomTabBar from '@/components/layout/BottomTabBar';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {children}
      </div>
      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </div>
  );
}
