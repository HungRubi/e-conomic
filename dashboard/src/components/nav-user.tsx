import * as React from 'react';
import { Link } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { CircleUserRoundIcon, EllipsisVerticalIcon, KeyRoundIcon, Loader2Icon, LogOutIcon } from 'lucide-react';

export function NavUser({
	user,
	onLogout,
}: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
	onLogout?: () => void | Promise<void>;
}) {
	const { isMobile } = useSidebar();
	const [loggingOut, setLoggingOut] = React.useState(false);

	async function handleLogout() {
		setLoggingOut(true);
		try {
			await onLogout?.();
		} finally {
			// Component có thể bị unmount sau logout — set state vẫn no-op an toàn.
			setLoggingOut(false);
		}
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
						>
							<Avatar className='h-8 w-8 rounded-lg grayscale'>
								<AvatarImage src={user.avatar} alt={user.name} />
								<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
							</Avatar>
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{user.name}</span>
								<span className='truncate text-xs text-muted-foreground'>{user.email}</span>
							</div>
							<EllipsisVerticalIcon className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg p-2'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={8}
					>
						<DropdownMenuLabel className='p-0 font-normal'>
							<div className='flex items-center gap-3 px-2 py-2.5 text-left text-sm'>
								<Avatar className='h-9 w-9 rounded-lg'>
									<AvatarImage src={user.avatar} alt={user.name} />
									<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
								</Avatar>
								<div className='grid flex-1 text-left text-sm leading-tight'>
									<span className='truncate font-medium'>{user.name}</span>
									<span className='truncate text-xs text-muted-foreground'>{user.email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator className='my-2' />
						<DropdownMenuGroup className='flex flex-col gap-0.5'>
							<DropdownMenuItem asChild className='gap-2.5 px-2.5 py-2'>
								<Link to='/profile'>
									<CircleUserRoundIcon />
									Tài khoản của tôi
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild className='gap-2.5 px-2.5 py-2'>
								<Link to='/profile'>
									<KeyRoundIcon />
									Đổi mật khẩu
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator className='my-2' />
						<DropdownMenuItem
							className='gap-2.5 px-2.5 py-2'
							disabled={loggingOut}
							onSelect={e => {
								e.preventDefault();
								void handleLogout();
							}}
						>
							{loggingOut ? <Loader2Icon className='animate-spin' /> : <LogOutIcon />}
							{loggingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
