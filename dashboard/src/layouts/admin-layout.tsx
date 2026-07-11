import * as React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

import { getAdminBreadcrumbs } from '@/admin-routes';
import { AppSidebar } from '@/components/app-sidebar';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const SIDEBAR_COOKIE = 'sidebar_state';

function readSidebarCookie(): boolean {
	if (typeof document === 'undefined') return true;
	const match = document.cookie.split(';').find(c => c.trim().startsWith(`${SIDEBAR_COOKIE}=`));
	if (!match) return true;
	return match.split('=')[1] === 'true';
}

export default function AdminLayout() {
	const { pathname } = useLocation();
	const crumbs = getAdminBreadcrumbs(pathname);
	// Đọc cookie 1 lần khi mount → tránh flash collapsed→expanded.
	const [defaultOpen] = React.useState(() => readSidebarCookie());

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset className='bg-muted/40'>
				<header className='flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
					<div className='flex w-full items-center gap-2 px-4 lg:px-6'>
						<SidebarTrigger className='-ml-1' />
						<Separator orientation='vertical' className='mr-2 data-vertical:h-4 data-vertical:self-auto' />
						<Breadcrumb className='flex-1'>
							<BreadcrumbList>
								{crumbs.map((crumb, i) => {
									const isLast = i === crumbs.length - 1;
									return (
										<React.Fragment key={`${crumb.label}-${i}`}>
											{i > 0 ? <BreadcrumbSeparator className='hidden md:block' /> : null}
											<BreadcrumbItem className={i === 0 ? 'hidden sm:block' : ''}>
												{isLast || !crumb.href ? (
													<BreadcrumbPage>{crumb.label}</BreadcrumbPage>
												) : (
													<BreadcrumbLink asChild>
														<Link to={crumb.href}>{crumb.label}</Link>
													</BreadcrumbLink>
												)}
											</BreadcrumbItem>
										</React.Fragment>
									);
								})}
							</BreadcrumbList>
						</Breadcrumb>
						<div className='ml-auto flex items-center gap-1'>
							<NotificationBell />
							<ThemeToggle />
						</div>
					</div>
				</header>
				<div className='flex min-h-0 flex-1 flex-col gap-6 p-4 lg:p-6'>
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
