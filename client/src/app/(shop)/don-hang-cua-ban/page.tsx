'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock3, Copy, Headphones, Package, RotateCcw, Truck } from 'lucide-react';
import { StatusBadge } from '@medusajs/ui';
import { sampleOrders, formatCurrency } from '@/lib/orders';

const iconMap: Record<string, typeof Truck> = {
	Truck,
	CheckCircle2,
	Clock3,
};

const statusBadgeColors: Record<string, 'green' | 'red' | 'orange' | 'blue' | 'purple' | 'grey'> = {
	'Đang giao': 'orange',
	'Đã giao': 'green',
	'Đang xử lý': 'grey',
};
const VISIBLE_MOBILE_ITEMS = 2;

export default function OrdersPage() {
	return (
		<section className='pt-3 pb-8 md:pt-4 md:pb-16'>
			<div className='w-full'>
				<div>
					<div className='mb-6 md:mb-8'>
						<p className='text-sm text-text2'>Theo dõi trạng thái mua hàng</p>
						<h1 className='mt-1 h1-core tracking-[-0.04em] text-text'>
							Đơn hàng của bạn
						</h1>
					</div>

					<div className='space-y-3'>
						{sampleOrders.map(order => {
							const StatusIcon = iconMap[order.icon] ?? Truck;
							const extraItemCount = Math.max(order.items.length - VISIBLE_MOBILE_ITEMS, 0);

							return (
								<div
									key={order.id}
									className='overflow-hidden rounded-xl border border-border/80 bg-surface/90 shadow-[0_18px_60px_rgba(0,0,0,0.06)] transition-all duration-200 hover:shadow-[0_18px_60px_rgba(0,0,0,0.1)] active:translate-y-px'
								>
									<Link
										href={`/don-hang-cua-ban/${order.id}`}
										className='block p-4 sm:p-5'
									>
										<div className='flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between'>
											<div className='min-w-0'>
												<div className='flex flex-wrap items-center gap-2'>
													<h2 className='text-xs font-semibold tracking-[-0.025em] text-text'>
														{order.id}
													</h2>
													<button
														onClick={e => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(order.id); }}
													>
														<Copy className='h-3 w-3 text-text2/60 hover:text-text' strokeWidth={1.8} />
													</button>
												</div>
												<p className='mt-0.5 text-xs text-text2/70'>Đặt ngày {order.date}</p>
											</div>
											<StatusBadge color={statusBadgeColors[order.status] ?? 'grey'}>
												{order.status}
											</StatusBadge>
										</div>

										<div className='mt-4 divide-y divide-border/70'>
											{order.items.map((item, itemIndex) => (
												<div
													key={`${order.id}-${item.sku}`}
													className={`${itemIndex >= VISIBLE_MOBILE_ITEMS ? 'hidden md:block' : ''} group/order-item py-3 transition-colors duration-300 hover:bg-surface/70`}
												>
													<div className='grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 md:grid-cols-[7rem_minmax(0,1fr)] md:items-center md:gap-4'>
														<div className='relative aspect-square w-22 overflow-hidden rounded-lg bg-surface2 md:w-28'>
															<Image
																src={item.image}
																alt={item.name}
																fill
																className='object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/order-item:scale-105'
																sizes='(max-width: 768px) 88px, 112px'
															/>
															<span className='absolute right-2 top-2 rounded-full bg-surface/90 px-2 py-0.5 txt-compact-xsmall-plus tabular-nums text-text shadow-sm backdrop-blur-md'>
																x{item.qty}
															</span>
														</div>

														<div className='min-w-0 py-0.5'>
															<div className='flex min-w-0 items-center gap-2 text-xs text-text2'>
																<span className='truncate font-medium'>{item.brand}</span>
																<span aria-hidden='true'>•</span>
																<span className='truncate tabular-nums'>
																	SKU {item.sku}
																</span>
															</div>
															<h3 className='mt-1 line-clamp-2 text-sm font-semibold leading-snug text-pretty text-text transition-colors group-hover/order-item:text-accent md:text-base'>
																{item.name}
															</h3>
															<div className='mt-2 flex flex-wrap items-center gap-2'>
																<span className='rounded-full border border-border/70 bg-surface2/70 px-2.5 py-1 text-xs font-medium text-text'>
																	{item.variant}
																</span>
																<span className='rounded-full border border-border/70 bg-surface2/70 px-2.5 py-1 text-xs font-medium text-text2'>
																	{item.supportLabel}
																</span>
															</div>
															<p className='mt-2 flex items-start gap-2 text-xs leading-5 text-text2'>
																<Package
																	className='mt-0.5 h-3.5 w-3.5 shrink-0'
																	strokeWidth={1.8}
																	aria-hidden='true'
																/>
																<span className='line-clamp-2'>{item.fulfillment}</span>
															</p>
														</div>
													</div>
												</div>
											))}

											{extraItemCount > 0 && (
												<button
													type='button'
													onClick={e => { e.preventDefault(); e.stopPropagation(); }}
													className='flex h-10 w-full touch-manipulation items-center justify-center rounded-xl border border-border bg-surface2/60 text-xs font-semibold text-text transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-text/20 md:hidden'
												>
													Xem thêm {extraItemCount} sản phẩm
												</button>
											)}
										</div>

										<div className='mt-4 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between'>
											<div className='flex items-center gap-2 text-xs text-text2'>
												<Package className='h-4 w-4' strokeWidth={1.8} />
												{order.eta}
											</div>
											<div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
												<div className='flex items-center justify-between gap-4 sm:justify-end'>
													<span className='text-xs text-text2'>Tổng</span>
													<span className='text-sm font-medium tabular-nums text-text'>
														{formatCurrency(order.total)}
													</span>
												</div>
												<div className='flex flex-wrap items-center gap-2'>
													<button
														type='button'
														onClick={e => { e.preventDefault(); e.stopPropagation(); }}
														className='inline-flex h-8 touch-manipulation items-center gap-1.5 rounded-full bg-text px-3 text-xs font-semibold text-bg transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-text/20'
													>
														<RotateCcw
															className='h-3.5 w-3.5'
															strokeWidth={1.8}
															aria-hidden='true'
														/>
														Mua lại
													</button>
													<button
														type='button'
														onClick={e => { e.preventDefault(); e.stopPropagation(); }}
														className='inline-flex h-8 touch-manipulation items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-semibold text-text2 transition-colors hover:border-text hover:text-text focus-visible:ring-2 focus-visible:ring-text/20'
													>
														<Headphones
															className='h-3.5 w-3.5'
															strokeWidth={1.8}
															aria-hidden='true'
														/>
														Hỗ trợ
													</button>
												</div>
											</div>
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</section>
	);
}
