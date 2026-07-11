import type { ReactNode } from 'react';
import BottomTabBar from '@/components/layout/BottomTabBar';

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex-1 flex items-center justify-center px-4 py-16 md:py-24'>
			<div className='w-full max-w-md'>{children}</div>
			<div className='md:hidden'>
				<BottomTabBar />
			</div>
		</div>
	);
}
