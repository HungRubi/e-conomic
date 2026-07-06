'use client';

import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { AdminQuickLinksNav, AdminSidebarNav } from '@/admin-routes';
import { useAuth } from '@/auth/auth-context';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

const teams = [
	{
		name: 'e-conomic',
		plan: 'E-conomic',
		logo: (
			<div className='flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-[10px] text-white'>
				Ec
			</div>
		),
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const navigate = useNavigate();
	const { user, logout } = useAuth();
	const sidebarUser = {
		name: user?.name?.trim() || user?.email?.split('@')[0] || 'Quản trị',
		email: user?.email ?? '',
		avatar: '/avatars/shadcn.jpg',
	};

	return (
		<Sidebar collapsible='icon' {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={teams} />
			</SidebarHeader>
			<SidebarContent>
				<AdminSidebarNav />
				<AdminQuickLinksNav />
			</SidebarContent>
			<SidebarFooter>
				<NavUser
					user={sidebarUser}
					onLogout={async () => {
						await logout();
						navigate('/login', { replace: true });
					}}
				/>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
