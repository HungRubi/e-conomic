import type { BlogPost } from '@/types';

export const blogPosts: BlogPost[] = [
	{
		id: 'blog-1',
		slug: 'cach-chon-ao-thun-chat-luong',
		title: 'Cách Chọn Áo Thun Chất Lượng — 5 Tiêu Chí Cần Nhớ',
		excerpt:
			'Áo thun là item cơ bản nhất trong tủ đồ nhưng không phải ai cũng biết cách chọn. Từ chất liệu, đường may đến form dáng, bài viết này sẽ chỉ bạn 5 tiêu chí vàng.',
		content:
			'## Chất liệu vải\n\nCotton 100% là lựa chọn tốt nhất cho áo thun hàng ngày. Sợi cotton dài cho cảm giác mềm mại, thoáng khí và thấm hút mồ hôi tốt.\n\n## Đường may\n\nKiểm tra đường may ở cổ áo, nách áo và gấu áo. Đường may đều, chắc chắn là dấu hiệu của áo chất lượng.\n\n## Form dáng\n\nRegular fit phù hợp với đa số vóc dáng. Nếu bạn thích thoải mái hơn, chọn oversized.\n\n## Màu sắc\n\nMàu trắng và đen là basic dễ phối đồ nhất. Màu pastel cho phong cách trẻ trung.',
		image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=500&fit=crop',
		author: 'Minh Anh',
		category: 'Thời trang',
		tags: ['thời trang', 'áo thun', 'mẹo hay'],
		createdAt: '2026-07-05T00:00:00Z',
	},
	{
		id: 'blog-2',
		slug: 'meo-chon-tai-nghe-phu-hop',
		title: 'Tai Nghe Nào Phù Hợp Với Bạn? — Từ Gaming Đến Workout',
		excerpt:
			'Phân loại tai nghe theo nhu cầu: chống ồn cho dân văn phòng, độ trễ thấp cho game thủ, chống nước cho dân tập gym. Đừng mua nhầm!',
		content: '...',
		image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f58?w=800&h=500&fit=crop',
		author: 'Hoàng Long',
		category: 'Công nghệ',
		tags: ['công nghệ', 'tai nghe', 'review'],
		createdAt: '2026-07-02T00:00:00Z',
	},
	{
		id: 'blog-3',
		slug: 'bi-quyet-cham-soc-da-mua-he',
		title: 'Bí Quyết Chăm Sóc Da Mùa Hè — 3 Bước Cơ Bản',
		excerpt:
			'Ánh nắng mùa hè là kẻ thù số một của làn da. Khám phá quy trình 3 bước đơn giản để giữ da luôn khoẻ và sáng mịn.',
		content: '...',
		image: 'https://images.unsplash.com/photo-1570194065650-d99fb4ee3541?w=800&h=500&fit=crop',
		author: 'Thanh Trúc',
		category: 'Sắc đẹp',
		tags: ['sắc đẹp', 'chăm sóc da', 'mùa hè'],
		createdAt: '2026-06-28T00:00:00Z',
	},
	{
		id: 'blog-4',
		slug: 'setup-ban-lam-viec-tai-nha',
		title: 'Setup Bàn Làm Việc Tại Nhà — Tối Ưu Năng Suất & Sức Khoẻ',
		excerpt:
			'Một góc làm việc khoa học giúp bạn tập trung hơn, giảm đau lưng và tăng hiệu suất. Những món đồ không thể thiếu cho home office.',
		content: '...',
		image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&h=500&fit=crop',
		author: 'Minh Anh',
		category: 'Nhà cửa',
		tags: ['nhà cửa', 'làm việc', 'gợi ý'],
		createdAt: '2026-06-22T00:00:00Z',
	},
	{
		id: 'blog-5',
		slug: 'chon-giay-chay-bo-cho-nguoi-moi',
		title: 'Chọn Giày Chạy Bộ Cho Người Mới Bắt Đầu — Hướng Dẫn A-Z',
		excerpt:
			'Đôi giày chạy đầu tiên nên là đôi nào? Làm sao biết mình cần loại đệm gì? Bài viết dành cho người mới bắt đầu môn chạy bộ.',
		content: '...',
		image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
		author: 'Hoàng Long',
		category: 'Thể thao',
		tags: ['thể thao', 'giày chạy bộ', 'hướng dẫn'],
		createdAt: '2026-06-18T00:00:00Z',
	},
	{
		id: 'blog-6',
		slug: 'do-choi-triet-ly-cho-tre',
		title: 'Đồ Chơi Giáo Dục Cho Trẻ — Vừa Chơi Vừa Học Nên Chọn Gì?',
		excerpt:
			'Đồ chơi không chỉ để giải trí mà còn phát triển tư duy. Gợi ý các món đồ chơi mang tính giáo dục cao cho từng độ tuổi.',
		content:
			'## Độ tuổi 0-2\n\nĐồ chơi cảm giác, đồ chơi phát ra âm thanh, sách vải.\n\n## Độ tuổi 3-5\n\nLego lớn, đồ chơi ghép hình, đồ chơi nhập vai.\n\n## Độ tuổi 6-12\n\nRobotics kit, thí nghiệm khoa học, board game.',
		image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=500&fit=crop',
		author: 'Thanh Trúc',
		category: 'Mẹ & Bé',
		tags: ['mẹ & bé', 'đồ chơi', 'giáo dục'],
		createdAt: '2026-06-14T00:00:00Z',
	},
	{
		id: 'blog-7',
		slug: 'test-fallback-image',
		title: '[TEST] Bài Viết Kiểm Tra Fallback Ảnh',
		excerpt:
			'Bài viết này cố tình dùng ảnh hỏng để kiểm tra cơ chế fallback. Nếu bạn thấy ảnh phong cảnh hoặc ảnh mặc định thay thế, fallback hoạt động tốt!',
		content:
			'## Fallback image test\n\nNếu bạn đang đọc bài này và thấy ảnh đại diện hiển thị bình thường (dù URL gốc cố tình sai), cơ chế fallback đã hoạt động.\n\nCơ chế này sẽ thử 4 ảnh dự phòng khác nhau, nếu tất cả đều fail sẽ hiển thị ảnh cuối cùng.',
		image: 'https://invalid-url.example.com/broken-image-12345.jpg',
		author: 'Admin',
		category: 'Công nghệ',
		tags: ['test', 'fallback', 'ảnh'],
		createdAt: '2026-07-09T00:00:00Z',
	},
];

export function getBlogPosts(): Promise<BlogPost[]> {
	return new Promise(resolve =>
		setTimeout(
			() =>
				resolve(
					[...blogPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
				),
			200
		)
	);
}

export function getRecentBlogPosts(count = 3): Promise<BlogPost[]> {
	return getBlogPosts().then(posts => posts.slice(0, count));
}

export function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
	return new Promise(resolve => setTimeout(() => resolve(blogPosts.find(p => p.slug === slug)), 150));
}
