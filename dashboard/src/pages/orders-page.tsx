import { OrdersAdminPanel } from '@/components/orders/orders-admin-panel';

export default function OrdersPage() {
	return (
		<div className='rounded-xl border border-border bg-background p-4 sm:p-5 lg:p-6'>
			<OrdersAdminPanel />
		</div>
	);
}
