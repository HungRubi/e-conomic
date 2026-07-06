import type { ReactNode } from 'react';
import { Header, Footer, BottomTabBar, ShopSidebar } from '@/components';

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <div className="w-full max-w-[90rem] mx-auto px-4 flex gap-6 min-h-screen">
        <ShopSidebar />
        <main className="w-0 flex-1 min-w-0 pb-16 md:pb-0">{children}</main>
      </div>
      <Footer />
      <BottomTabBar />
    </>
  );
}
