import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex-1 flex items-center justify-center px-0 md:px-4 py-0 md:py-24'>
			<div className='w-full max-w-md min-h-dvh md:min-h-0 flex items-center justify-center md:block'>
				<div className='md:rounded-xl md:border md:border-border/80 md:bg-surface/90 md:shadow-[0_18px_60px_rgba(0,0,0,0.06)] md:p-6 md:my-8 md:w-full'>
					{children}
				</div>
			</div>
		</div>
	);
}
