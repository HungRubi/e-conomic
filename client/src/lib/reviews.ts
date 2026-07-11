import type { Review } from '@/types';

const allReviews: Review[] = [
	// ── prod-1: Áo Thun Cotton ──
	{
		id: 'rev-1-1',
		productId: 'prod-1',
		author: 'Minh Anh',
		rating: 5,
		title: 'Chất lượng tuyệt vời',
		body: 'Áo mặc rất thoải mái, chất vải dày dặn nhưng vẫn mát. Mình mua màu trắng, sau 3 lần giặt không bị ố vàng hay co rút. Sẽ mua thêm màu khác.',
		createdAt: '2026-07-05T10:30:00Z',
		verified: true,
	},
	{
		id: 'rev-1-2',
		productId: 'prod-1',
		author: 'Hoàng Long',
		rating: 4,
		title: 'Form chuẩn, màu đẹp',
		body: 'Size L vừa người 1m75 70kg. Chất liệu cotton mềm, đường may chắc chắn. Trừ 1 sao vì giao hơi chậm.',
		createdAt: '2026-06-28T14:15:00Z',
		verified: true,
	},
	{
		id: 'rev-1-3',
		productId: 'prod-1',
		author: 'Thanh Trúc',
		rating: 5,
		title: 'Mua cho chồng, anh ấy rất thích',
		body: 'Chồng mình kén vải lắm mà mặc áo này khen mềm, không bị rát da. Đặt thêm 2 cái nữa để đi làm.',
		createdAt: '2026-06-20T09:00:00Z',
		verified: true,
	},
	{
		id: 'rev-1-4',
		productId: 'prod-1',
		author: 'Tuấn Phạm',
		rating: 3,
		title: 'Ổn so với giá',
		body: 'Chất áo ổn nhưng hơi mỏng hơn tưởng tượng. Form regular fit ổn, không quá rộng. Đóng gói cẩn thận.',
		createdAt: '2026-06-15T16:45:00Z',
		verified: false,
	},
	{
		id: 'rev-1-5',
		productId: 'prod-1',
		author: 'Quỳnh Nguyễn',
		rating: 5,
		title: 'Áo basic không thể thiếu',
		body: 'Mua 4 màu luôn. Chất vải tốt, co giãn nhẹ thoải mái. Cổ áo bo đẹp, không bị dão sau nhiều lần giặt. Rất đáng tiền!',
		createdAt: '2026-06-10T11:20:00Z',
		verified: true,
	},
	{
		id: 'rev-1-6',
		productId: 'prod-1',
		author: 'Đức Anh',
		rating: 4,
		title: 'Đúng mô tả',
		body: 'Lần đầu mua, áo đúng hình, đúng size. Giao hàng nhanh, đóng gói kỹ. Sẽ ủng hộ shop dài dài.',
		createdAt: '2026-06-05T08:30:00Z',
		verified: true,
	},

	// ── prod-2: Tai Nghe AirBuds ──
	{
		id: 'rev-2-1',
		productId: 'prod-2',
		author: 'Đức Anh',
		rating: 5,
		title: 'Chống ồn đỉnh cao',
		body: 'Dùng cho dân văn phòng, chống ồn tốt, đeo thoải mái cả ngày. Pin trâu, sạc nhanh. Âm bass chắc, không bị rè.',
		createdAt: '2026-07-02T20:00:00Z',
		verified: true,
	},
	{
		id: 'rev-2-2',
		productId: 'prod-2',
		author: 'Minh Anh',
		rating: 4,
		title: 'Âm thanh tốt, xứng tầm giá',
		body: 'So với AirPods thì hơi thua chút về chống ồn chủ động, nhưng mức giá này là quá ok. Kết nối nhanh, ổn định.',
		createdAt: '2026-06-25T15:10:00Z',
		verified: true,
	},
	{
		id: 'rev-2-3',
		productId: 'prod-2',
		author: 'Hoàng Long',
		rating: 5,
		title: 'Lần đầu mua tai nghe không dây',
		body: 'Từ ngày đổi sang tai nghe này, chạy bộ thoải mái hơn hẳn. Chống nước tốt, không sợ mồ hôi. Âm thanh trong trẻo.',
		createdAt: '2026-06-18T07:45:00Z',
		verified: true,
	},
	{
		id: 'rev-2-4',
		productId: 'prod-2',
		author: 'Thanh Trúc',
		rating: 2,
		title: 'Hay bị mất kết nối',
		body: 'Dùng iPhone thỉnh thoảng bị ngắt kết nối, phải cho vào hộp mở lại. Có thể do lỗi phần mềm. Mong shop fix sớm.',
		createdAt: '2026-06-12T13:00:00Z',
		verified: false,
	},

	// ── prod-3: Đèn Bàn ──
	{
		id: 'rev-3-1',
		productId: 'prod-3',
		author: 'Tuấn Phạm',
		rating: 5,
		title: 'Đẹp hơn trong hình',
		body: 'Đèn nhỏ gọn, ánh sáng trắng/ấm điều chỉnh được. Có cổng sạc USB rất tiện. Bàn làm việc của mình đẹp hẳn lên.',
		createdAt: '2026-07-01T19:30:00Z',
		verified: true,
	},
	{
		id: 'rev-3-2',
		productId: 'prod-3',
		author: 'Quỳnh Nguyễn',
		rating: 4,
		title: 'Hơi thấp so với kỳ vọng',
		body: 'Đèn đẹp, chất lượng tốt nhưng hơi thấp nếu để bàn cao. Cần thêm đế nâng nữa. Chất lượng ánh sáng tốt, không nhức mắt.',
		createdAt: '2026-06-22T10:00:00Z',
		verified: true,
	},

	// ── prod-4: Serum ──
	{
		id: 'rev-4-1',
		productId: 'prod-4',
		author: 'Thanh Trúc',
		rating: 5,
		title: 'Da sáng rõ rệt sau 2 tuần',
		body: 'Serum thẩm thấu nhanh, không bết dính. Dùng kết hợp kem chống nắng ban ngày, da mình đều màu hơn, vết thâm mờ đi đáng kể.',
		createdAt: '2026-07-03T11:15:00Z',
		verified: true,
	},
	{
		id: 'rev-4-2',
		productId: 'prod-4',
		author: 'Quỳnh Nguyễn',
		rating: 5,
		title: 'Mùi dễ chịu, texture mỏng nhẹ',
		body: 'Loại serum đầu tiên mình dùng hết chai. Da dầu không bị kích ứng, sáng dần đều. Giá hơi cao nhưng xứng đáng.',
		createdAt: '2026-06-20T09:30:00Z',
		verified: true,
	},
	{
		id: 'rev-4-3',
		productId: 'prod-4',
		author: 'Minh Anh',
		rating: 3,
		title: 'Chưa thấy hiệu quả rõ',
		body: 'Dùng được 3 tuần, da chưa cải thiện nhiều. Có thể cần kiên trì hơn. Chất serum mỏng nhẹ, thấm nhanh.',
		createdAt: '2026-06-08T14:20:00Z',
		verified: false,
	},

	// ── prod-5: Giày Ultralight ──
	{
		id: 'rev-5-1',
		productId: 'prod-5',
		author: 'Hoàng Long',
		rating: 5,
		title: 'Giày chạy siêu nhẹ',
		body: 'Đúng tên gọi — siêu nhẹ, đế đàn hồi tốt. Chạy 10km không thấy mỏi chân. Size chuẩn, đi vừa. Màu trắng đẹp nhưng dễ bẩn.',
		createdAt: '2026-07-06T06:45:00Z',
		verified: true,
	},
	{
		id: 'rev-5-2',
		productId: 'prod-5',
		author: 'Đức Anh',
		rating: 4,
		title: 'Đế êm, thoáng khí',
		body: 'Mới chạy được 50km, giày êm, thoáng. Đế bám tốt kể cả đường ướt. Trừ 1 sao vì form hơi chật so với giày Adidas cùng size.',
		createdAt: '2026-06-30T17:00:00Z',
		verified: true,
	},

	// ── prod-7: Áo Khoác Jeans ──
	{
		id: 'rev-7-1',
		productId: 'prod-7',
		author: 'Tuấn Phạm',
		rating: 5,
		title: 'Khoác đẹp, chất denim dày',
		body: 'Chất vải denim dày dặn, form đẹp. Mặc đi chơi hay đi làm đều ok. Mua size L vừa vặn. Không bị phai màu sau giặt.',
		createdAt: '2026-07-02T15:30:00Z',
		verified: true,
	},
	{
		id: 'rev-7-2',
		productId: 'prod-7',
		author: 'Thanh Trúc',
		rating: 4,
		title: 'Tặng bạn trai, bạn ấy mê',
		body: 'Người yêu mình thích style jeans nên mua tặng. Anh ấy khen đẹp, mặc vừa. Chỉ hơi nặng hơn tưởng tượng.',
		createdAt: '2026-06-15T10:10:00Z',
		verified: true,
	},

	// ── prod-8: Polaroid ──
	{
		id: 'rev-8-1',
		productId: 'prod-8',
		author: 'Quỳnh Nguyễn',
		rating: 5,
		title: 'Máy xinh xắn, chụp dễ',
		body: 'Mua tặng em gái, bạn ấy thích mê. Máy nhỏ gọn, dễ sử dụng, ảnh ra màu retro đẹp. Phim chính hãng đắt nhưng xứng đáng.',
		createdAt: '2026-07-04T20:00:00Z',
		verified: true,
	},
	{
		id: 'rev-8-2',
		productId: 'prod-8',
		author: 'Minh Anh',
		rating: 5,
		title: 'Máy ảnh kỷ niệm',
		body: 'Cả nhà đi chơi mang theo, chụp rất vui. Ảnh in ra có cảm giác vintage, làm album rất đẹp.',
		createdAt: '2026-06-28T12:00:00Z',
		verified: true,
	},
	{
		id: 'rev-8-3',
		productId: 'prod-8',
		author: 'Đức Anh',
		rating: 3,
		title: 'Phim hơi đắt',
		body: 'Máy ảnh tốt, chụp đẹp nhưng giá phim cao, mỗi lần chụp tốn ~20k cho 1 kiểu. Cân nhắc nếu bạn định chụp nhiều.',
		createdAt: '2026-06-18T09:45:00Z',
		verified: true,
	},
];

export function getProductReviews(
	productId: string,
	filters?: { rating?: number[]; sort?: string }
): Promise<Review[]> {
	let result = allReviews.filter(r => r.productId === productId);

	if (filters?.rating && filters.rating.length > 0) {
		result = result.filter(r => filters.rating!.includes(r.rating));
	}

	switch (filters?.sort) {
		case 'oldest':
			result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			break;
		case 'highest':
			result.sort(
				(a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			break;
		case 'lowest':
			result.sort(
				(a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
			break;
		default: // 'newest'
			result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	return new Promise(resolve => setTimeout(() => resolve(result), 200));
}

export function getReviewDistribution(productId: string): Promise<Record<number, number>> {
	const reviews = allReviews.filter(r => r.productId === productId);
	const dist: Record<number, number> = {};
	for (let i = 1; i <= 5; i++) dist[i] = 0;
	reviews.forEach(r => {
		dist[r.rating]++;
	});
	return Promise.resolve(dist);
}
