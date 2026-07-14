import { getOrderById } from '@/lib/orders';
import { notFound } from 'next/navigation';
import OrderDetailContent from './OrderDetailContent';

interface Props {
	params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
	const { id } = await params;
	const order = getOrderById(id);

	if (!order) {
		notFound();
	}

	return <OrderDetailContent order={order} />;
}
