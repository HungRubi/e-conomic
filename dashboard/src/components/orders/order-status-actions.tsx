import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	AlertTriangleIcon,
	BanknoteIcon,
	CheckCircle2Icon,
	InfoIcon,
	PackageCheckIcon,
	TruckIcon,
	XCircleIcon,
} from 'lucide-react';

import {
	updateOrder,
	type OrderRow,
	type OrderStatus,
	type PaymentStatus,
	type UpdateOrderParams,
} from '@/api/admin-orders';
import { AuthApiError } from '@/auth/auth-api';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import {
	ORDER_STATUS_LABEL,
	PAYMENT_STATUS_LABEL,
	canTransitionTo,
	isOrderTerminal,
	nextAllowedStatuses,
	primaryActionLabel,
	primaryNextStatus,
} from './order-status-helpers';

type OrderStatusActionsProps = {
	order: OrderRow;
};

const ALL_PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

function statusButtonIcon(target: OrderStatus) {
	switch (target) {
		case 'CONFIRMED':
		case 'PROCESSING':
		case 'DELIVERED':
			return <PackageCheckIcon className='size-4' />;
		case 'SHIPPED':
			return <TruckIcon className='size-4' />;
		case 'CANCELLED':
			return <XCircleIcon className='size-4' />;
		case 'REFUNDED':
			return <BanknoteIcon className='size-4' />;
		default:
			return null;
	}
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<p
			className={cn(
				'text-[11px] font-medium uppercase tracking-wider text-muted-foreground',
				className
			)}
		>
			{children}
		</p>
	);
}

export function OrderStatusActions({ order }: OrderStatusActionsProps) {
	const queryClient = useQueryClient();
	const [pendingTransition, setPendingTransition] = useState<OrderStatus | null>(null);
	const [transitionNote, setTransitionNote] = useState('');

	const [tracking, setTracking] = useState(order.trackingNumber ?? '');
	const [provider, setProvider] = useState(order.shippingProvider ?? '');
	const [adminNote, setAdminNote] = useState(order.adminNote ?? '');
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);

	const mutation = useMutation({
		mutationFn: (body: UpdateOrderParams) => updateOrder(order.id, body),
		onSuccess: (next) => {
			queryClient.setQueryData<OrderRow>(['admin-order', order.id], next);
			void queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
		},
	});

	const allowed = nextAllowedStatuses(order.status);
	const primaryNext = primaryNextStatus(order.status);
	const cancelAvailable = canTransitionTo(order.status, 'CANCELLED');
	const refundAvailable = canTransitionTo(order.status, 'REFUNDED');

	function runTransition(next: OrderStatus, note?: string) {
		if (!canTransitionTo(order.status, next)) {
			toast.error(`Không thể chuyển từ ${ORDER_STATUS_LABEL[order.status]} sang ${ORDER_STATUS_LABEL[next]}`);
			return;
		}
		mutation.mutate(
			{ status: next, ...(note?.trim() ? { adminNote: note.trim() } : {}) },
			{
				onSuccess: () => {
					toast.success(`đã cập nhật sang ${ORDER_STATUS_LABEL[next]}`);
					setPendingTransition(null);
					setTransitionNote('');
				},
				onError: (e) => toast.error(e instanceof AuthApiError ? e.message : 'Cập nhật thất bại'),
			}
		);
	}

	function savePaymentStatus() {
		if (paymentStatus === order.paymentStatus) return;
		mutation.mutate(
			{ paymentStatus },
			{
				onSuccess: () => toast.success('đã cập nhật thanh toán'),
				onError: (e) => toast.error(e instanceof AuthApiError ? e.message : 'Cập nhật thất bại'),
			}
		);
	}

	function saveShippingInfo() {
		const body: UpdateOrderParams = {};
		if (tracking !== (order.trackingNumber ?? '')) body.trackingNumber = tracking;
		if (provider !== (order.shippingProvider ?? '')) body.shippingProvider = provider;
		if (Object.keys(body).length === 0) return;
		mutation.mutate(body, {
			onSuccess: () => toast.success('đã lưu thông tin vận chuyển'),
			onError: (e) => toast.error(e instanceof AuthApiError ? e.message : 'Lưu thất bại'),
		});
	}

	function saveAdminNote() {
		if (adminNote === (order.adminNote ?? '')) return;
		mutation.mutate(
			{ adminNote },
			{
				onSuccess: () => toast.success('đã lưu ghi chú'),
				onError: (e) => toast.error(e instanceof AuthApiError ? e.message : 'Lưu thất bại'),
			}
		);
	}

	const isShippingStage = order.status === 'PROCESSING' || order.status === 'SHIPPED';
	const trackingDirty =
		tracking !== (order.trackingNumber ?? '') || provider !== (order.shippingProvider ?? '');
	const adminNoteDirty = adminNote !== (order.adminNote ?? '');
	const paymentDirty = paymentStatus !== order.paymentStatus;
	const terminal = isOrderTerminal(order.status);

	return (
		<div className='space-y-5 text-sm'>
			{!terminal ? (
				<section className='space-y-2'>
					<SectionLabel>Bước tiếp theo</SectionLabel>
					<div className='flex flex-wrap gap-2'>
						{primaryNext ? (
							<Button
								type='button'
								onClick={() => setPendingTransition(primaryNext)}
								disabled={mutation.isPending}
								className='gap-1.5'
							>
								{statusButtonIcon(primaryNext)}
								{primaryActionLabel(primaryNext)}
							</Button>
						) : null}
						{cancelAvailable ? (
							<Button
								type='button'
								variant='outline'
								onClick={() => setPendingTransition('CANCELLED')}
								disabled={mutation.isPending}
								className='gap-1.5 text-destructive hover:text-destructive'
							>
								<XCircleIcon className='size-4' />
								Hủy đơn
							</Button>
						) : null}
						{refundAvailable && primaryNext !== 'REFUNDED' ? (
							<Button
								type='button'
								variant='outline'
								onClick={() => setPendingTransition('REFUNDED')}
								disabled={mutation.isPending}
								className='gap-1.5'
							>
								<BanknoteIcon className='size-4' />
								Hoàn tiền
							</Button>
						) : null}
						{allowed.length === 0 ? (
							<p className='text-xs text-muted-foreground'>Không còn bước nào tiếp theo.</p>
						) : null}
					</div>
				</section>
			) : (
				<div className='flex items-start gap-2 rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground'>
					<AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0' aria-hidden />
					<p>Đơn đã ở trạng thái cuối ({ORDER_STATUS_LABEL[order.status]}).</p>
				</div>
			)}

			<section className='space-y-2 border-t border-border/60 pt-4'>
				<div className='flex items-center justify-between gap-2'>
					<SectionLabel>Thanh toán</SectionLabel>
					{paymentDirty ? (
						<span className='text-[11px] text-amber-600 dark:text-amber-400'>Chưa lưu</span>
					) : null}
				</div>
				<div className='flex gap-2'>
					<Select
						value={paymentStatus}
						onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
						disabled={mutation.isPending}
					>
						<SelectTrigger id='payment-status' className='flex-1'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{ALL_PAYMENT_STATUSES.map((s) => (
								<SelectItem key={s} value={s}>
									{PAYMENT_STATUS_LABEL[s]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						type='button'
						onClick={savePaymentStatus}
						disabled={mutation.isPending || !paymentDirty}
						variant='secondary'
						size='sm'
					>
						Lưu
					</Button>
				</div>
				{order.paidAt ? (
					<p className='text-[11px] text-muted-foreground tabular-nums'>
						Thanh toán lúc{' '}
						{new Intl.DateTimeFormat('vi-VN', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit',
						}).format(new Date(order.paidAt))}
					</p>
				) : null}
			</section>

			<section className='space-y-2 border-t border-border/60 pt-4'>
				<div className='flex items-center justify-between gap-2'>
					<SectionLabel>Vận chuyển</SectionLabel>
					{trackingDirty ? (
						<span className='text-[11px] text-amber-600 dark:text-amber-400'>Chưa lưu</span>
					) : null}
				</div>
				<div className='space-y-2'>
					<Input
						id='order-tracking'
						value={tracking}
						onChange={(e) => setTracking(e.target.value)}
						placeholder='Mã vận đơn (VD: GHN12345678)'
						disabled={mutation.isPending}
						autoComplete='off'
						aria-label='Mã vận đơn'
					/>
					<Input
						id='order-provider'
						value={provider}
						onChange={(e) => setProvider(e.target.value)}
						placeholder='Đơn vị vận chuyển (VD: Giao Hàng Nhanh)'
						disabled={mutation.isPending}
						autoComplete='off'
						aria-label='Đơn vị vận chuyển'
					/>
				</div>
				<div className='flex items-center justify-between gap-2'>
					{!tracking && isShippingStage ? (
						<p className='flex items-start gap-1 text-[11px] text-amber-600 dark:text-amber-400'>
							<AlertTriangleIcon className='mt-0.5 size-3 shrink-0' aria-hidden />
							Nhập mã trước khi đánh dấu đã giao vận.
						</p>
					) : (
						<span aria-hidden />
					)}
					<Button
						type='button'
						variant='secondary'
						size='sm'
						onClick={saveShippingInfo}
						disabled={mutation.isPending || !trackingDirty}
					>
						Lưu
					</Button>
				</div>
			</section>

			<section className='space-y-2 border-t border-border/60 pt-4'>
				<div className='flex items-center justify-between gap-2'>
					<SectionLabel>Ghi chú nội bộ</SectionLabel>
					{adminNoteDirty ? (
						<span className='text-[11px] text-amber-600 dark:text-amber-400'>Chưa lưu</span>
					) : null}
				</div>
				<Textarea
					value={adminNote}
					onChange={(e) => setAdminNote(e.target.value)}
					rows={3}
					disabled={mutation.isPending}
					placeholder='Lưu ý xử lý đơn (không gửi tới khách)…'
					aria-label='Ghi chú nội bộ'
				/>
				<div className='flex justify-end'>
					<Button
						type='button'
						variant='secondary'
						size='sm'
						onClick={saveAdminNote}
						disabled={mutation.isPending || !adminNoteDirty}
					>
						Lưu
					</Button>
				</div>
			</section>

			<AlertDialog
				open={pendingTransition !== null}
				onOpenChange={(open) => {
					if (!open) {
						setPendingTransition(null);
						setTransitionNote('');
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Chuyển sang “{pendingTransition ? ORDER_STATUS_LABEL[pendingTransition] : ''}”?
						</AlertDialogTitle>
						<AlertDialogDescription asChild>
							<div className='space-y-3'>
								<p>
									Đơn{' '}
									<span className='font-medium text-foreground'>{order.orderNumber}</span> sẽ chuyển từ{' '}
									<span className='font-medium text-foreground'>{ORDER_STATUS_LABEL[order.status]}</span> sang{' '}
									<span className='font-medium text-foreground'>
										{pendingTransition ? ORDER_STATUS_LABEL[pendingTransition] : ''}
									</span>
									.
								</p>
								{pendingTransition === 'SHIPPED' && !tracking ? (
									<p className='text-xs text-amber-600 dark:text-amber-400'>
										Chưa có mã vận đơn. Bạn có thể tiếp tục, nhưng nên nhập ngay sau đó để khách tra cứu.
									</p>
								) : null}
								{pendingTransition === 'CANCELLED' ? (
									<p className='text-xs text-destructive'>
										Hủy đơn không thể hoàn tác — mã giảm giá (nếu có) sẽ được trả lại lượt sử dụng.
									</p>
								) : null}
								{pendingTransition === 'REFUNDED' ? (
									<div className='space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40'>
										<p className='flex items-start gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300'>
											<InfoIcon className='mt-0.5 size-3.5 shrink-0' aria-hidden />
											Xác nhận hoàn tiền
										</p>
										<div className='space-y-2 text-xs text-amber-700 dark:text-amber-400'>
											{order.paymentMethod === 'COD' ? (
												<>
													<p className='flex items-start gap-2'>
														<CheckCircle2Icon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
														<span>
															<strong className='font-semibold'>COD:</strong> Khách chưa thanh toán — bạn
															<strong className='font-semibold'> không cần chuyển tiền</strong> cho khách.
															Đơn vị vận chuyển đã thu tiền hộ và sẽ trả lại cho bạn.
														</span>
													</p>
													<p className='flex items-start gap-2'>
														<InfoIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
														<span>Bước này chỉ <strong className='font-semibold'>cập nhật trạng thái đơn hàng</strong> trên hệ thống, không ảnh hưởng đến tiền bạc.</span>
													</p>
												</>
											) : (
												<>
													<p className='flex items-start gap-2'>
														<BanknoteIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
														<span>
															<strong className='font-semibold'>BANKING:</strong> Khách đã thanh toán{' '}
															<strong className='font-semibold'>{order.totalVnd.toLocaleString('vi-VN')}₫</strong>.
															Bạn phải <strong className='font-semibold'>chuyển khoản lại</strong> cho khách trước khi xác nhận.
														</span>
													</p>
													<p className='flex items-start gap-2'>
														<AlertTriangleIcon className='mt-0.5 size-3.5 shrink-0 text-amber-500' aria-hidden />
														<span>Chỉ bấm xác nhận khi <strong className='font-semibold'>đã chuyển tiền xong</strong>. Hành động này không thể hoàn tác.</span>
													</p>
												</>
											)}
										</div>
									</div>
								) : null}
								<Textarea
									value={transitionNote}
									onChange={(e) => setTransitionNote(e.target.value)}
									rows={3}
									placeholder='Ghi chú nội bộ (tuỳ chọn) — sẽ lưu vào lịch sử đơn'
									aria-label='Ghi chú chuyển trạng thái'
								/>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={mutation.isPending}>Hủy</AlertDialogCancel>
						<AlertDialogAction
							disabled={mutation.isPending}
							onClick={() => {
								if (pendingTransition) runTransition(pendingTransition, transitionNote);
							}}
						>
							{mutation.isPending ? 'Đang lưu…' : 'Xác nhận'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
