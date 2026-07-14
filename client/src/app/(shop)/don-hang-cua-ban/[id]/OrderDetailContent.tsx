'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Copy, ChevronLeft, Package, RotateCcw, Star, MapPin, Truck, CreditCard, XCircle } from 'lucide-react';
import { BuildingStorefront, CheckCircle, CubeSolid, ChatBubbleLeftRight } from '@medusajs/icons';
import { Button } from '@/components';
import { Heading, Text, StatusBadge } from '@medusajs/ui';
import { formatCurrency } from '@/lib/orders';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import type { Order } from '@/types';

type StatusColor = 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'grey';

const statusBadgeMap: Record<string, StatusColor> = {
	'Đang giao': 'orange',
	'Đã giao': 'green',
	'Đang xử lý': 'grey',
};

interface TimelineStep {
	label: string;
	date: string;
	icon: typeof BuildingStorefront;
	done: boolean;
	current: boolean;
}

function buildTimeline(status: string, date: string, eta: string): TimelineStep[] {
	const day = Number(date.split('/')[0]);
	const month = Number(date.split('/')[1]);
	const year = Number(date.split('/')[2]);

	return [
		{
			label: 'Đặt hàng',
			date: `${date} 10:23`,
			icon: BuildingStorefront,
			done: true,
			current: false,
		},
		{
			label: 'Xác nhận',
			date: `${String(day + 1).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} 14:30`,
			icon: CheckCircle,
			done: status !== 'Đang xử lý',
			current: status === 'Đang xử lý',
		},
		{
			label: 'Đóng gói',
			date: `${String(day + 2).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} 09:15`,
			icon: CubeSolid,
			done: status !== 'Đang xử lý',
			current: false,
		},
		{
			label: status === 'Đã giao' ? 'Hoàn thành' : 'Giao hàng',
			date: status === 'Đã giao' ? '14:32' : eta,
			icon: Truck,
			done: status === 'Đã giao',
			current: status === 'Đang giao',
		},
		{
			label: 'Đánh giá',
			date: '',
			icon: Star,
			done: false,
			current: false,
		},
	];
}

const sampleShippingInfo = {
	name: 'Nguyễn Văn A',
	phone: '0123 456 789',
	address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
};

const sampleCarrier = {
	name: 'Giao hàng nhanh',
	tracking: 'GHN2V3W4X5Y6Z',
};

interface Props {
	order: Order;
}

export default function OrderDetailContent({ order }: Props) {
	const router = useRouter();
	const subtotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
	const rawShipping = SHIPPING_FEE;
	const shippingDiscount = subtotal >= FREE_SHIPPING_THRESHOLD ? rawShipping : 0;
	const finalShipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : rawShipping;
	const voucher = -Math.round(subtotal * 0.17);
	const finalTotal = subtotal + finalShipping + shippingDiscount + voucher;
	const badgeColor = statusBadgeMap[order.status] ?? 'grey';
	const timeline = buildTimeline(order.status, order.date, order.eta);
	const isDelivered = order.status === 'Đã giao';

	const handleCopyId = () => {
		navigator.clipboard.writeText(order.id);
	};

	return (
		<section className='pt-2 pb-8 md:pb-16'>
			<div className='rounded-xl border border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)]'>
				{/* === 1. HEADER === */}
				<div className='p-4 sm:p-5'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<div className='flex items-center gap-2'>
							<button
								type='button'
								onClick={handleCopyId}
								className='inline-flex items-center gap-1.5 text-sm font-semibold tracking-[-0.03em] text-text transition-colors hover:text-text2'
							>
								<Copy className='h-3.5 w-3.5' strokeWidth={1.8} />
								{order.id}
							</button>
							<p className='text-xs text-text2/70'>Đặt ngày {order.date}</p>
						</div>
						<StatusBadge color={badgeColor}>{order.status}</StatusBadge>
					</div>
				</div>

				{/* === 2. TRẠNG THÁI ĐƠN === */}
				<div className='border-t border-border px-4 py-5 sm:px-5'>
					<h2 className='h3-core tracking-[-0.025em] text-text mb-5'>Trạng thái đơn hàng</h2>
					<div className='overflow-x-auto scrollbar-hide -mx-4 sm:-mx-5'>
						<div className='flex min-w-max items-start justify-between px-4 sm:px-5 gap-0 sm:gap-4 lg:gap-6'>
							{timeline.map((step, index) => {
								const Icon = step.icon;
								const isLast = index === timeline.length - 1;
								const isReview = step.label === 'Đánh giá';

								return (
									<div key={step.label} className='flex items-start'>
										<div className='flex flex-col items-center'>
											<div
												className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
													isReview && isDelivered
														? 'border-accent bg-accent/10 text-accent'
														: step.done
														? 'border-text bg-text text-bg'
														: step.current
														? 'border-accent bg-accent/10 text-accent'
														: 'border-border bg-surface2 text-text2'
												}`}
											>
												{isReview ? (
													<Star
														className={`h-4 w-4 ${isDelivered ? 'fill-accent text-accent' : ''}`}
														strokeWidth={isDelivered ? 0 : 1.8}
													/>
												) : (
													<Icon className='h-4 w-4' />
												)}
											</div>
											<p
												className={`mt-2 whitespace-nowrap text-center text-xs font-medium ${
													isReview && isDelivered
														? 'text-accent'
														: step.current
														? 'text-accent'
														: step.done
														? 'text-text'
														: 'text-text2'
												}`}
											>
												{step.label}
											</p>
											{step.date && (
												<p className='mt-0.5 whitespace-nowrap text-center text-[11px] text-text2'>
													{step.date}
												</p>
											)}
										</div>
										{!isLast && (
											<div
												className={`relative mx-2 mt-5 h-px w-10 min-w-[2.5rem] sm:mx-3 sm:w-16 lg:w-20 ${
													isReview ? 'border-dashed border border-border' : ''
												}`}
											>
												{!isReview && (
													<>
														<div className={`h-full ${step.done ? 'bg-text' : 'bg-border'}`} />
														<div
															className={`absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rotate-45 border-r border-t ${
																step.done ? 'border-text' : 'border-border'
															}`}
														/>
													</>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* === 3. THAO TÁC VỚI ĐƠN HÀNG + DỰ KIẾN GIAO === */}
				<div className='border-t border-border px-4 py-4 sm:px-5'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<div className='flex flex-wrap items-center gap-2'>
							{order.status === 'Đang giao' && (
								<Button variant='primary' size='base'>
									<Package className='h-4 w-4' strokeWidth={1.8} />
									Đã nhận hàng
								</Button>
							)}
							{order.status === 'Đang xử lý' && (
								<Button variant='danger' size='base'>
									<XCircle className='h-4 w-4' strokeWidth={1.8} />
									Xác nhận huỷ
								</Button>
							)}
							{isDelivered && (
								<>
									<Button variant='secondary' size='base'>
										<RotateCcw className='h-4 w-4' strokeWidth={1.8} />
										Mua lại
									</Button>
									<Button variant='transparent' size='base'>
										<Package className='h-4 w-4' strokeWidth={1.8} />
										Đánh giá
									</Button>
								</>
							)}
							<Button variant='transparent' size='base'>
								<ChatBubbleLeftRight className='h-4 w-4' />
								Liên hệ Người bán
							</Button>
						</div>
						<div className='flex items-center gap-2 text-sm text-text2'>
							<Truck className='h-4 w-4 shrink-0' strokeWidth={1.8} />
							<span className='text-text font-medium'>{order.eta}</span>
						</div>
					</div>
				</div>

				{/* === 4. ĐỊA CHỈ NHẬN HÀNG + ĐƠN VỊ VẬN CHUYỂN === */}
				<div className='border-t border-border px-4 py-5 sm:px-5'>
					<div className='grid gap-6 md:grid-cols-2 md:gap-8'>
						<div>
							<Heading level='h3' className='text-lg font-medium text-ui-fg-base'>
								Địa chỉ nhận hàng
							</Heading>
							<div className='mt-4 flex items-start gap-3'>
								<MapPin className='mt-0.5 h-4 w-4 shrink-0 text-text2' strokeWidth={1.8} />
								<div className='space-y-1 text-sm'>
									<p className='font-medium text-text'>{sampleShippingInfo.name}</p>
									<p className='text-text2'>{sampleShippingInfo.phone}</p>
									<p className='leading-6 text-text2'>{sampleShippingInfo.address}</p>
								</div>
							</div>
						</div>
						<div>
							<Heading level='h3' className='text-lg font-medium text-ui-fg-base'>
								Đơn vị vận chuyển
							</Heading>
							<div className='mt-4 flex items-start gap-3'>
								<Truck className='mt-0.5 h-4 w-4 shrink-0 text-text2' strokeWidth={1.8} />
								<div className='space-y-1 text-sm'>
									<p className='font-medium text-text'>{sampleCarrier.name}</p>
									<p className='text-text2'>Mã vận đơn: {sampleCarrier.tracking}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* === 5. SẢN PHẨM === */}
				<div className='border-t border-border px-4 py-5 sm:px-5'>
					<Heading level='h3' className='text-lg font-medium text-ui-fg-base'>
						Sản phẩm đã mua
					</Heading>
					<div className='mt-4 divide-y divide-border/70'>
						{order.items.map(item => (
							<div key={item.sku} className='py-4 first:pt-0 last:pb-0'>
								<div className='flex gap-4'>
									<Link href={item.slug} className='shrink-0'>
										<div className='relative h-20 w-20 overflow-hidden rounded-xl bg-surface2 sm:h-24 sm:w-24'>
											<Image
												src={item.image}
												alt={item.name}
												fill
												className='object-cover'
												sizes='(max-width: 768px) 80px, 96px'
											/>
										</div>
									</Link>

									<div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 self-center sm:flex-nowrap sm:gap-x-6'>
										<div className='min-w-0 flex-1'>
											<Link
												href={item.slug}
												className='line-clamp-2 text-sm font-semibold leading-snug text-text transition-colors hover:text-accent'
											>
												{item.name}
											</Link>
											<div className='mt-1 flex flex-wrap items-center gap-1.5'>
												<Text size='xsmall' className='rounded-full border border-border/70 bg-surface2/70 px-2 py-0.5 text-ui-fg-subtle'>
													{item.variant}
												</Text>
												<Text size='xsmall' className='text-ui-fg-muted'>x{item.qty}</Text>
											</div>
										</div>

										<div className='text-right'>
											<Text size='xsmall' className='text-ui-fg-muted'>Đơn giá</Text>
											<p className='text-sm tabular-nums text-text'>{formatCurrency(item.unitPrice)}</p>
										</div>

										<div className='min-w-[5.5rem] text-right'>
											<Text size='xsmall' className='text-ui-fg-muted'>Tạm tính</Text>
											<p className='text-sm font-semibold tabular-nums text-text'>{formatCurrency(item.lineTotal)}</p>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* === 6. TỔNG THANH TOÁN === */}
				<div className='border-t border-border/30 px-4 sm:px-5 pt-1 pb-1'>
					<table className='w-full'>
						<tbody className='divide-y divide-border/20'>
							<tr>
								<td className='w-[70%] py-3 text-right text-[13px] text-text2/70'>
									Tổng tiền hàng
								</td>
								<td className='text-sm tabular-nums text-text text-right' style={{ paddingRight: '4px' }}>
									{formatCurrency(subtotal)}
								</td>
							</tr>
							<tr>
								<td className='w-[70%] py-3 text-right text-[13px] text-text2/70'>
									Phí vận chuyển
								</td>
								<td className='text-sm tabular-nums text-text text-right' style={{ paddingRight: '4px' }}>
									{formatCurrency(rawShipping)}
								</td>
							</tr>
							{shippingDiscount > 0 && (
								<tr>
									<td className='w-[70%] py-3 text-right text-[13px] text-text2/70'>
										Giảm giá phí vận chuyển
									</td>
									<td className='text-sm tabular-nums text-text text-right' style={{ paddingRight: '4px' }}>
										-{formatCurrency(shippingDiscount)}
									</td>
								</tr>
							)}
							<tr>
								<td className='w-[70%] py-3 text-right text-[13px] text-text2/70'>
									Voucher từ Shopee
								</td>
								<td className='text-sm tabular-nums text-text text-right' style={{ paddingRight: '4px' }}>
									{formatCurrency(voucher)}
								</td>
							</tr>
							<tr className='border-t border-border/20'>
								<td className='w-[70%] py-3 text-right text-[13px] text-text2/70'>
									Thành tiền
								</td>
								<td className='text-base font-semibold tabular-nums text-text text-right' style={{ paddingRight: '4px' }}>
									{formatCurrency(finalTotal)}
								</td>
							</tr>
							<tr className='border-t border-border/20'>
								<td className='w-[70%] py-3 text-right text-[13px] text-text2/70'>
									<span className='inline-flex items-center gap-1.5'>
										<CreditCard className='h-4 w-4 shrink-0' strokeWidth={1.8} />
										Phương thức thanh toán
									</span>
								</td>
								<td className='text-sm text-text text-right' style={{ paddingRight: '4px' }}>
									TK Ngân hàng liên kết ShopeePay
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
