import type { Order } from '@/types';

export const sampleOrders: Order[] = [
	{
		id: 'EC-2407-1024',
		date: '07/07/2026',
		status: 'Đang giao',
		statusTone: 'text-orange bg-orange/10 border-orange/20',
		icon: 'Truck',
		eta: 'Dự kiến giao: 09/07/2026',
		total: 1290000,
		items: [
			{
				name: 'Áo khoác minimal linen',
				brand: 'ECO Atelier',
				variant: 'Be / Size M',
				sku: 'LIN-JKT-BE-M',
				qty: 1,
				unitPrice: 790000,
				lineTotal: 790000,
				fulfillment: 'Đã bàn giao cho đơn vị vận chuyển',
				slug: '/san-pham/ao-khoac-minimal-linen',
				supportLabel: 'Đổi size trong 7 ngày',
				image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=160&fit=crop',
			},
			{
				name: 'Túi tote canvas daily',
				brand: 'Daily Carry',
				variant: 'Natural',
				sku: 'TOT-CVS-NA',
				qty: 2,
				unitPrice: 250000,
				lineTotal: 500000,
				fulfillment: 'Đóng gói cùng kiện hàng chính',
				slug: '/san-pham/tui-tote-canvas-daily',
				supportLabel: 'Bảo hành đường may',
				image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop',
			},
		],
	},
	{
		id: 'EC-2407-0981',
		date: '04/07/2026',
		status: 'Đã giao',
		statusTone: 'text-green bg-green/10 border-green/20',
		icon: 'CheckCircle2',
		eta: 'Đã giao thành công lúc 14:32',
		total: 860000,
		items: [
			{
				name: 'Sneaker cloud white',
				brand: 'Urban Sole',
				variant: 'Trắng / Size 42',
				sku: 'SNK-CLD-WH-42',
				qty: 1,
				unitPrice: 860000,
				lineTotal: 860000,
				fulfillment: 'Đã giao đủ sản phẩm',
				slug: '/san-pham/sneaker-cloud-white',
				supportLabel: 'Đánh giá sau mua',
				image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=160&h=160&fit=crop',
			},
		],
	},
	{
		id: 'EC-2407-0944',
		date: '02/07/2026',
		status: 'Đang xử lý',
		statusTone: 'text-text bg-surface2 border-border',
		icon: 'Clock3',
		eta: 'Shop đang chuẩn bị hàng',
		total: 540000,
		items: [
			{
				name: 'Mũ bucket cotton',
				brand: 'Soft Basics',
				variant: 'Đen',
				sku: 'HAT-BKT-BK',
				qty: 1,
				unitPrice: 540000,
				lineTotal: 540000,
				fulfillment: 'Shop đang kiểm hàng trước khi gửi',
				slug: '/san-pham/mu-bucket-cotton',
				supportLabel: 'Nhắn shop về chất liệu',
				image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=160&h=160&fit=crop',
			},
		],
	},
];

export function getOrderById(id: string): Order | undefined {
	return sampleOrders.find(order => order.id === id);
}

export function formatCurrency(value: number): string {
	return `${value.toLocaleString('vi-VN')}₫`;
}
