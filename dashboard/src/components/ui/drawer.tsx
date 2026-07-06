import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
	return <DrawerPrimitive.Root data-slot='drawer' {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot='drawer-trigger' {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot='drawer-portal' {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
	return <DrawerPrimitive.Close data-slot='drawer-close' {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			data-slot='drawer-overlay'
			className={cn(
				'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
				className
			)}
			{...props}
		/>
	);
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	return (
		<DrawerPortal data-slot='drawer-portal'>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot='drawer-content'
				className={cn(
					'group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm',
					className
				)}
				{...props}
			>
				<div className='mx-auto mt-4 hidden h-1 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block' />
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='drawer-header'
			className={cn(
				'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left',
				className
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot='drawer-footer' className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return (
		<DrawerPrimitive.Title
			data-slot='drawer-title'
			className={cn('font-heading text-base font-medium text-foreground', className)}
			{...props}
		/>
	);
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot='drawer-description'
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

/**
 * Drawer gần full viewport: mobile sát cạnh (full màn hình), từ `md` lùi 15px bốn phía.
 * Dùng cho form dài (vd. sản phẩm). Đóng bằng Esc (modal Vaul/Radix) hoặc nút đóng.
 */
function DrawerPageContent({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
	showCloseButton?: boolean;
}) {
	return (
		<DrawerPortal data-slot='drawer-page-portal'>
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot='drawer-page-content'
				className={cn(
					'fixed z-50 flex max-h-dvh flex-col overflow-hidden border bg-popover text-sm text-popover-foreground outline-none',
					'inset-0 rounded-none',
					'md:inset-[15px] md:max-h-[calc(100dvh-30px)] md:rounded-xl',
					className,
				)}
				{...props}
			>
				{showCloseButton ? (
					<DrawerClose
						data-slot='drawer-page-close'
						className='absolute top-3 right-3 z-10 inline-flex h-7 items-center rounded-sm bg-muted px-2.5 text-[11px] font-medium tracking-wide text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
					>
						esc
						<span className='sr-only'>Đóng</span>
					</DrawerClose>
				) : null}
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerTrigger,
	DrawerClose,
	DrawerContent,
	DrawerPageContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};
