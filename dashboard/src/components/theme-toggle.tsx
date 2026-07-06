'use client';

import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon, MonitorIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type='button'
					variant='ghost'
					size='icon'
					className={cn('size-8', className)}
					aria-label='Đổi giao diện'
				>
					<SunIcon className='size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
					<MoonIcon className='absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuLabel>Giao diện</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => setTheme('light')} data-active={theme === 'light'}>
					<SunIcon className='mr-2 size-4' />
					Sáng
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')} data-active={theme === 'dark'}>
					<MoonIcon className='mr-2 size-4' />
					Tối
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')} data-active={theme === 'system'}>
					<MonitorIcon className='mr-2 size-4' />
					Theo hệ thống
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
