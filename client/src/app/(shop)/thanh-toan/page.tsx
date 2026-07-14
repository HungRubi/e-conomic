'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	ArrowRight,
	Check,
	ChevronLeft,
	CreditCard,
	MapPin,
	RotateCcw,
	ShieldCheck,
	Truck,
	WalletCards,
} from 'lucide-react';
import { Button, Input } from '@/components';
import { useCartStore } from '@/stores/cart-store';
import { toast } from '@medusajs/ui';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

type Step = 'shipping' | 'payment' | 'review';
type PaymentMethod = 'cod' | 'bank' | 'card';

const steps: { key: Step; label: string; hint: string }[] = [
	{ key: 'shipping', label: 'Giao hàng', hint: 'Địa chỉ nhận hàng' },
	{ key: 'payment', label: 'Thanh toán', hint: 'Chọn phương thức' },
	{ key: 'review', label: 'Xác nhận', hint: 'Kiểm tra lần cuối' },
];

const paymentMethods: {
	id: PaymentMethod;
	label: string;
	desc: string;
	icon: typeof Truck;
}[] = [
	{ id: 'cod', label: 'Thanh toán khi nhận hàng', desc: 'Kiểm tra hàng trước khi trả tiền', icon: Truck },
	{ id: 'bank', label: 'Chuyển khoản ngân hàng', desc: 'Nhận thông tin sau khi đặt hàng', icon: WalletCards },
	{ id: 'card', label: 'Thẻ tín dụng / ghi nợ', desc: 'Bảo mật, không lưu thông tin thẻ', icon: CreditCard },
];

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

export default function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { items, clearCart } = useCartStore();
	const [step, setStep] = useState<Step>('shipping');
	const [placing, setPlacing] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
	const [form, setForm] = useState({
		fullName: '',
		phone: '',
		address: '',
		note: '',
	});

	const selectedIds = searchParams.get('items')?.split(',').filter(Boolean) ?? [];
	const checkoutItems = selectedIds.length > 0 ? items.filter(item => selectedIds.includes(item.id)) : items;
	const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
	const total = subtotal + shipping;
	const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
	const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
	const stepIndex = steps.findIndex(s => s.key === step);
	const selectedPayment = useMemo(
		() => paymentMethods.find(method => method.id === paymentMethod) ?? paymentMethods[0],
		[paymentMethod]
	);

	useEffect(() => {
		if (items.length === 0 || checkoutItems.length === 0) {
			router.replace('/gio-hang');
		}
	}, [items, checkoutItems, router]);

	if (items.length === 0 || checkoutItems.length === 0) {
		return null;
	}

	const handlePlaceOrder = async () => {
		setPlacing(true);
		await new Promise(resolve => setTimeout(resolve, 1200));
		clearCart();
		toast.success('Đặt hàng thành công!');
		router.push('/');
	};

	return (
		<section className='pt-2 pb-8 md:pb-16'>
			<div className='mb-6 md:mb-8'>
				<p className='text-sm text-text2'>Hoàn tất đơn hàng trong vài bước</p>
				<h1 className='mt-1 h1-core tracking-[-0.04em] text-text'>Thanh toán</h1>
			</div>

			<div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8'>
				<div className='space-y-4'>
					<CheckoutStepper stepIndex={stepIndex} />

					{step === 'shipping' && (
						<div className='rounded-xl border border-border/80 bg-surface/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-5'>
							<div className='mb-5 flex items-start gap-3'>
								<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface2 text-text'>
									<MapPin className='h-5 w-5' strokeWidth={1.8} />
								</div>
								<div>
									<h2 className='h3-core tracking-[-0.025em] text-text'>
										Thông tin giao hàng
									</h2>
									<p className='mt-1 text-sm leading-6 text-text2'>
										Nhập đúng số điện thoại và địa chỉ để shop giao hàng nhanh hơn.
									</p>
								</div>
							</div>

							<div className='grid gap-4 sm:grid-cols-2'>
								<Input
									label='Họ và tên'
									placeholder='Nguyễn Văn A'
									value={form.fullName}
									onChange={e => setForm({ ...form, fullName: e.target.value })}
								/>
								<Input
									label='Số điện thoại'
									placeholder='0123 456 789'
									value={form.phone}
									onChange={e => setForm({ ...form, phone: e.target.value })}
								/>
							</div>
							<div className='mt-4 space-y-4'>
								<Input
									label='Địa chỉ nhận hàng'
									placeholder='Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành'
									value={form.address}
									onChange={e => setForm({ ...form, address: e.target.value })}
								/>
								<Input
									label='Ghi chú (không bắt buộc)'
									placeholder='Ví dụ: gọi trước khi giao, giao giờ hành chính...'
									value={form.note}
									onChange={e => setForm({ ...form, note: e.target.value })}
								/>
							</div>

							<div className='mt-5 flex justify-end'>
								<Button
									onClick={() => setStep('payment')}
									disabled={!form.fullName || !form.phone || !form.address}
									size='large'
								>
									Tiếp tục
									<ArrowRight className='ml-1 h-4 w-4' strokeWidth={1.8} />
								</Button>
							</div>
						</div>
					)}

					{step === 'payment' && (
						<div className='rounded-xl border border-border/80 bg-surface/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-5'>
							<h2 className='h3-core tracking-[-0.025em] text-text'>
								Phương thức thanh toán
							</h2>
							<p className='mt-1 text-sm leading-6 text-text2'>
								Chọn cách thanh toán phù hợp. Bạn có thể đổi lại trước khi xác nhận.
							</p>

							<div className='mt-5 grid gap-3'>
								{paymentMethods.map(method => {
									const Icon = method.icon;
									const selected = paymentMethod === method.id;

									return (
										<label
											key={method.id}
											className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all active:translate-y-px ${
												selected
													? 'border-text bg-surface2/70 shadow-[0_14px_40px_var(--accent-glow)]'
													: 'border-border/80 bg-surface hover:bg-surface2/60'
											}`}
										>
											<input
												type='radio'
												name='payment'
												checked={selected}
												onChange={() => setPaymentMethod(method.id)}
												className='sr-only'
											/>
											<span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-text'>
												<Icon className='h-5 w-5' strokeWidth={1.8} />
											</span>
											<span className='min-w-0 flex-1'>
												<span className='block text-sm font-semibold text-text'>
													{method.label}
												</span>
												<span className='mt-1 block text-sm leading-6 text-text2'>
													{method.desc}
												</span>
											</span>
											<span
												className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-text bg-text text-bg' : 'border-border'}`}
											>
												{selected && <Check className='h-3 w-3' strokeWidth={2.2} />}
											</span>
										</label>
									);
								})}
							</div>

							<div className='mt-5 flex justify-between gap-3'>
								<Button
									variant='transparent'
									onClick={() => setStep('shipping')}
									icon={<ChevronLeft className='h-4 w-4' />}
								>
									Quay lại
								</Button>
								<Button onClick={() => setStep('review')} size='large'>
									Xem lại đơn
									<ArrowRight className='ml-1 h-4 w-4' strokeWidth={1.8} />
								</Button>
							</div>
						</div>
					)}

					{step === 'review' && (
						<div className='space-y-4'>
							<ReviewCard title='Giao hàng' action='Sửa' onEdit={() => setStep('shipping')}>
								<p className='font-medium text-text'>{form.fullName}</p>
								<p>{form.phone}</p>
								<p>{form.address}</p>
								{form.note && <p>Ghi chú: {form.note}</p>}
							</ReviewCard>

							<ReviewCard title='Thanh toán' action='Sửa' onEdit={() => setStep('payment')}>
								<p className='font-medium text-text'>{selectedPayment.label}</p>
								<p>{selectedPayment.desc}</p>
							</ReviewCard>

							<div className='rounded-xl border border-border/80 bg-surface/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-5'>
								<h2 className='h3-core tracking-[-0.025em] text-text'>Sản phẩm</h2>
								<div className='mt-4 divide-y divide-border/70'>
									{checkoutItems.map(item => (
										<div key={item.id} className='flex gap-3 py-3 first:pt-0 last:pb-0'>
											<div className='relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface2'>
												<Image
													src={item.image}
													alt={item.name}
													fill
													className='object-cover'
													sizes='64px'
												/>
											</div>
											<div className='min-w-0 flex-1'>
												<p className='line-clamp-2 text-xs font-medium text-text'>
													{item.name}
												</p>
												<p className='mt-1 text-xs text-text2'>Số lượng: {item.quantity}</p>
											</div>
											<div className='text-xs font-semibold tabular-nums text-text'>
												{formatCurrency(item.price * item.quantity)}
											</div>
										</div>
									))}
								</div>
							</div>

							<div className='flex justify-between gap-3'>
								<Button
									variant='transparent'
									onClick={() => setStep('payment')}
									icon={<ChevronLeft className='h-4 w-4' />}
								>
									Quay lại
								</Button>
								<Button onClick={handlePlaceOrder} loading={placing} size='large'>
									{placing ? 'Đang xử lý...' : 'Đặt hàng'}
								</Button>
							</div>
						</div>
					)}
				</div>

				<aside className='lg:sticky lg:top-24 lg:self-start'>
					<OrderSummary
						checkoutItems={checkoutItems}
						subtotal={subtotal}
						shipping={shipping}
						total={total}
						remainingForFreeShipping={remainingForFreeShipping}
						shippingProgress={shippingProgress}
					/>
				</aside>
			</div>
		</section>
	);
}

function CheckoutStepper({ stepIndex }: { stepIndex: number }) {
	return (
		<div className='rounded-xl border border-border/80 bg-surface/90 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-4'>
			<div className='grid grid-cols-3 gap-2'>
				{steps.map((step, index) => {
					const active = index <= stepIndex;
					const done = index < stepIndex;

					return (
						<div key={step.key} className='min-w-0'>
							<div className='flex items-center gap-2'>
								<span
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full txt-medium-plus ${active ? 'bg-text text-bg' : 'bg-surface2 text-text2'}`}
								>
									{done ? <Check className='h-4 w-4' strokeWidth={2.2} /> : index + 1}
								</span>
								<span className='hidden min-w-0 sm:block'>
									<span
										className={`block truncate txt-medium-plus ${active ? 'text-text' : 'text-text2'}`}
									>
										{step.label}
									</span>
									<span className='block truncate text-xs text-text2'>{step.hint}</span>
								</span>
							</div>
							<div className='mt-3 h-1 overflow-hidden rounded-full bg-surface2'>
								<div className={`h-full rounded-full ${active ? 'bg-text' : 'bg-transparent'}`} />
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ReviewCard({
	title,
	action,
	onEdit,
	children,
}: {
	title: string;
	action: string;
	onEdit: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className='rounded-xl border border-border/80 bg-surface/90 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.06)] sm:p-5'>
			<div className='mb-3 flex items-center justify-between gap-4'>
				<h2 className='h3-core tracking-[-0.025em] text-text'>{title}</h2>
				<button
					type='button'
					onClick={onEdit}
					className='rounded-full px-3 py-1 text-sm font-medium text-text2 transition-all hover:bg-surface2 hover:text-text'
				>
					{action}
				</button>
			</div>
			<div className='space-y-1 text-sm leading-6 text-text2'>{children}</div>
		</div>
	);
}

function OrderSummary({
	checkoutItems,
	subtotal,
	shipping,
	total,
	remainingForFreeShipping,
	shippingProgress,
}: {
	checkoutItems: { id: string; name: string; image: string; quantity: number; price: number }[];
	subtotal: number;
	shipping: number;
	total: number;
	remainingForFreeShipping: number;
	shippingProgress: number;
}) {
	return (
		<div className='rounded-xl border border-border/80 bg-surface/90 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.06)]'>
			<h2 className='h3-core tracking-[-0.025em] text-text'>Tóm tắt đơn hàng</h2>

			{remainingForFreeShipping > 0 ? (
				<div className='mt-4 rounded-xl border border-border/70 bg-surface2/60 p-3'>
					<div className='flex items-start gap-3'>
						<Truck className='mt-0.5 h-4 w-4 shrink-0 text-text' strokeWidth={1.8} />
						<div className='min-w-0 flex-1'>
							<p className='text-xs font-medium leading-5 text-text'>
								Mua thêm {formatCurrency(remainingForFreeShipping)} để được miễn phí vận chuyển
							</p>
							<div className='mt-2 h-1.5 overflow-hidden rounded-full bg-bg'>
								<div
									className='h-full rounded-full bg-text transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
									style={{ width: `${shippingProgress}%` }}
								/>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className='mt-4 rounded-xl border border-green/30 bg-green/10 p-3 text-xs font-medium text-green'>
					Đơn hàng đã được miễn phí vận chuyển
				</div>
			)}

			<div className='mt-5 max-h-64 space-y-3 overflow-auto pr-1 scrollbar-hover'>
				{checkoutItems.map(item => (
					<div key={item.id} className='flex gap-3'>
						<div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface2'>
							<Image src={item.image} alt={item.name} fill className='object-cover' sizes='48px' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-sm font-medium text-text'>{item.name}</p>
							<p className='text-xs text-text2'>x{item.quantity}</p>
						</div>
						<p className='text-xs font-semibold tabular-nums text-text'>
							{formatCurrency(item.price * item.quantity)}
						</p>
					</div>
				))}
			</div>

			<div className='mt-5 space-y-3 border-t border-border pt-4 text-sm'>
				<div className='flex items-center justify-between gap-4 text-text2'>
					<span>Tạm tính</span>
					<span className='tabular-nums text-text'>{formatCurrency(subtotal)}</span>
				</div>
				<div className='flex items-center justify-between gap-4 text-text2'>
					<span>Phí vận chuyển</span>
					<span className='tabular-nums text-text'>
						{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
					</span>
				</div>
				<div className='flex items-end justify-between gap-4 border-t border-border pt-3'>
					<span className='font-semibold text-text'>Tổng</span>
					<span className='text-xl font-semibold tracking-[-0.03em] tabular-nums text-text'>
						{formatCurrency(total)}
					</span>
				</div>
			</div>

			<div className='mt-5 grid gap-2 border-t border-border pt-4 text-xs leading-5 text-text2'>
				<div className='flex items-center gap-2'>
					<ShieldCheck className='h-4 w-4 text-green' strokeWidth={1.8} />
					Thanh toán an toàn và bảo mật
				</div>
				<div className='flex items-center gap-2'>
					<Truck className='h-4 w-4 text-text2' strokeWidth={1.8} />
					Giao 2-4 ngày
				</div>
				<div className='flex items-center gap-2'>
					<RotateCcw className='h-4 w-4 text-text2' strokeWidth={1.8} />
					Đổi trả theo chính sách cửa hàng
				</div>
			</div>

			<Link
				href='/gio-hang'
				className='mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-text transition-all hover:bg-surface2 active:translate-y-px'
			>
				Chỉnh sửa giỏ hàng
			</Link>
		</div>
	);
}
