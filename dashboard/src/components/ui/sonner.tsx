import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react';

/**
 * Toaster — không nút X, không richColors chói.
 * - Light: nền card (xám nhạt) + viền trái màu + shadow
 * - Dark: nền tối + viền trái màu
 */
const Toaster = ({ ...props }: ToasterProps) => {
	const { resolvedTheme } = useTheme();
	return (
		<Sonner
			theme={(resolvedTheme as ToasterProps['theme']) ?? 'system'}
			position='bottom-right'
			className='toaster group'
			richColors={false}
			icons={{
				success: <CircleCheckIcon className='size-4 text-emerald-600 dark:text-emerald-400' />,
				info: <InfoIcon className='size-4 text-blue-600 dark:text-blue-400' />,
				warning: <TriangleAlertIcon className='size-4 text-amber-600 dark:text-amber-400' />,
				error: <OctagonXIcon className='size-4 text-red-600 dark:text-red-400' />,
				loading: <Loader2Icon className='size-4 animate-spin' />,
			}}
			style={
				{
					'--normal-bg': 'hsl(var(--card))',
					'--normal-text': 'hsl(var(--card-foreground))',
					'--normal-border': 'hsl(var(--border))',
					'--error-bg': 'hsl(var(--card))',
					'--error-text': 'hsl(var(--card-foreground))',
					'--error-border': 'hsl(var(--destructive))',
					'--success-bg': 'hsl(var(--card))',
					'--success-text': 'hsl(var(--card-foreground))',
					'--success-border': 'hsl(142 71% 45%)',
					'--warning-bg': 'hsl(var(--card))',
					'--warning-text': 'hsl(var(--card-foreground))',
					'--warning-border': 'hsl(38 92% 50%)',
					'--info-bg': 'hsl(var(--card))',
					'--info-text': 'hsl(var(--card-foreground))',
					'--info-border': 'hsl(221 83% 53%)',
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: '!bg-card !shadow-xl !border-l-4 text-sm',
					title: 'text-sm font-medium',
					description: 'text-xs text-muted-foreground',
					error: '!border-l-red-500 dark:!border-l-red-400',
					success: '!border-l-emerald-500 dark:!border-l-emerald-400',
					warning: '!border-l-amber-500 dark:!border-l-amber-400',
					info: '!border-l-blue-500 dark:!border-l-blue-400',
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
