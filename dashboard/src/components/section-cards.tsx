'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GlobeIcon, ShoppingBagIcon, TrendingUpIcon, UserRoundPlusIcon } from 'lucide-react';

export function SectionCards() {
	return (
		<div className='grid grid-cols-1 gap-4 px-4 md:grid-cols-2 xl:grid-cols-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card lg:px-6 dark:*:data-[slot=card]:bg-card'>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Lượt truy cập website</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums text-blue-600 @[250px]/card:text-3xl dark:text-blue-400'>
						120.450
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<GlobeIcon className='text-blue-500 dark:text-blue-400' />
							+18.2%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Tăng trưởng truy cập ổn định{' '}
						<TrendingUpIcon className='text-blue-500 size-4 dark:text-blue-400' />
					</div>
					<div className='text-muted-foreground'>Hiệu suất tốt trong 30 ngày gần nhất</div>
				</CardFooter>
			</Card>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Khách hàng mới</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums text-emerald-600 @[250px]/card:text-3xl dark:text-emerald-400'>
						2.314
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<UserRoundPlusIcon className='text-emerald-500 dark:text-emerald-400' />
							+11.4%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Tệp khách hàng mở rộng nhanh{' '}
						<TrendingUpIcon className='text-emerald-500 size-4 dark:text-emerald-400' />
					</div>
					<div className='text-muted-foreground'>Tỷ lệ đăng ký thành công cải thiện theo tuần</div>
				</CardFooter>
			</Card>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Đơn hàng hoàn tất</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums text-violet-600 @[250px]/card:text-3xl dark:text-violet-400'>
						1.086
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<ShoppingBagIcon className='text-violet-500 dark:text-violet-400' />
							+9.8%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Đơn hàng tăng đều mỗi ngày{' '}
						<TrendingUpIcon className='text-violet-500 size-4 dark:text-violet-400' />
					</div>
					<div className='text-muted-foreground'>Nhóm sản phẩm chăm sóc đang dẫn đầu doanh số</div>
				</CardFooter>
			</Card>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Tỷ lệ chuyển đổi</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums text-rose-600 @[250px]/card:text-3xl dark:text-rose-400'>
						5.7%
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<TrendingUpIcon className='text-rose-500 dark:text-rose-400' />
							+1.3%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Trang sản phẩm tối ưu tốt hơn{' '}
						<TrendingUpIcon className='text-rose-500 size-4 dark:text-rose-400' />
					</div>
					<div className='text-muted-foreground'>Tăng hiệu quả từ kênh social và quảng cáo tìm kiếm</div>
				</CardFooter>
			</Card>
		</div>
	);
}
