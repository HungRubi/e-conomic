/**
 * Schema JSON trang About (slug `about`) — khớp `miuehealing-website/lib/about-page-content.ts`.
 * Parser/kiểu được nhân bản trong dashboard để không phụ thuộc package website.
 */

export const ABOUT_CONTENT_VERSION = 1 as const;

export type AboutSplitSection = {
	type: 'split';
	variant: 'text-left-image-right' | 'image-left-text-right';
	background: 'white' | 'cream';
	eyebrow?: string;
	title?: string;
	description?: string;
	paragraphs?: string[];
	imageUrls: string[];
	imageAlt?: string;
};

export type AboutProductSpotlightSection = {
	type: 'product-spotlight';
	background: 'white' | 'cream';
	eyebrow: string;
	title: string;
	description: string;
	imageUrls: string[];
	imageAlt: string;
	blocks: { title: string; items: string[] }[];
	blockIcons?: string[];
	ctaDescription: string;
	ctaLabel: string;
	ctaHref: string;
};

export type AboutSectionV1 = AboutSplitSection | AboutProductSpotlightSection;

export type AboutContentV1 = {
	version: typeof ABOUT_CONTENT_VERSION;
	hero: {
		eyebrow: string;
		title: string;
		description: string;
		imageUrls: string[];
		imageAlt: string;
		ctaLabel: string;
		ctaHref: string;
	};
	sections: AboutSectionV1[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
	return Array.isArray(v) && v.every(x => typeof x === 'string');
}

function isSplitSection(s: Record<string, unknown>): s is AboutSplitSection {
	if (s.type !== 'split') return false;
	if (s.variant !== 'text-left-image-right' && s.variant !== 'image-left-text-right') return false;
	if (s.background !== 'white' && s.background !== 'cream') return false;
	if (!isStringArray(s.imageUrls) || s.imageUrls.length === 0) return false;
	return true;
}

function isProductSpotlight(s: Record<string, unknown>): s is AboutProductSpotlightSection {
	if (s.type !== 'product-spotlight') return false;
	if (s.background !== 'white' && s.background !== 'cream') return false;
	if (typeof s.eyebrow !== 'string' || typeof s.title !== 'string' || typeof s.description !== 'string') return false;
	if (!isStringArray(s.imageUrls) || s.imageUrls.length === 0) return false;
	if (typeof s.imageAlt !== 'string') return false;
	if (!Array.isArray(s.blocks)) return false;
	for (const b of s.blocks) {
		if (!isRecord(b) || typeof b.title !== 'string' || !Array.isArray(b.items)) return false;
		if (!b.items.every(i => typeof i === 'string')) return false;
	}
	if (typeof s.ctaDescription !== 'string' || typeof s.ctaLabel !== 'string' || typeof s.ctaHref !== 'string')
		return false;
	return true;
}

export function parseAboutPageContent(raw: unknown): AboutContentV1 | null {
	if (!isRecord(raw)) return null;
	if (raw.version !== ABOUT_CONTENT_VERSION) return null;
	if (!isRecord(raw.hero)) return null;
	const h = raw.hero;
	if (
		typeof h.eyebrow !== 'string' ||
		typeof h.title !== 'string' ||
		typeof h.description !== 'string' ||
		typeof h.imageAlt !== 'string' ||
		typeof h.ctaLabel !== 'string' ||
		typeof h.ctaHref !== 'string' ||
		!isStringArray(h.imageUrls) ||
		h.imageUrls.length === 0
	) {
		return null;
	}
	if (!Array.isArray(raw.sections)) return null;
	const sections: AboutSectionV1[] = [];
	for (const item of raw.sections) {
		if (!isRecord(item)) return null;
		if (isSplitSection(item)) {
			sections.push(item);
			continue;
		}
		if (isProductSpotlight(item)) {
			sections.push(item);
			continue;
		}
		return null;
	}
	return {
		version: ABOUT_CONTENT_VERSION,
		hero: {
			eyebrow: h.eyebrow,
			title: h.title,
			description: h.description,
			imageUrls: h.imageUrls,
			imageAlt: h.imageAlt,
			ctaLabel: h.ctaLabel,
			ctaHref: h.ctaHref,
		},
		sections,
	};
}

/** Mẫu mặc định (tiếng Việt) — cùng cấu trúc seed Prisma `about-pages`. */
export const DEFAULT_ABOUT_PAGE_CONTENT_VI: AboutContentV1 = {
	version: 1,
	hero: {
		eyebrow: 'Miue.healing crystal studio',
		title: 'Atelier đá trong căn nhà gỗ',
		description:
			'Miue.healing là một tiệm đá nhỏ ấm áp, nơi chúng tôi nuôi dưỡng niềm đam mê với nguồn năng lượng chữa lành tự nhiên từ đất mẹ. Mỗi sản phẩm trang sức và linh phẩm đều được làm bằng tay, gắn kết với đá năng lượng và cảm hứng riêng của từng mùa.',
		imageUrls: ['/images/about/1.jpg'],
		imageAlt: 'Không gian Miue.healing — tiệm đá trong nhà gỗ',
		ctaLabel: 'Xem sản phẩm',
		ctaHref: '/product',
	},
	sections: [
		{
			type: 'split',
			variant: 'text-left-image-right',
			background: 'white',
			eyebrow: 'Câu chuyện tiệm',
			title: 'Chạm dịu, sống chậm',
			description:
				'Chúng tôi tin vào những buổi chiều trong lành: trà ấm, mùi gỗ và ánh sáng lọt qua từng viên đá. Không gian nhỏ của Miue.healing được dựng lên để bạn có thể dừng lại, lắng nghe và chọn một món đồ thật sự đồng điệu với mình.',
			imageUrls: ['/images/about/2.jpg'],
			imageAlt: 'Không gian và chi tiết tiệm Miue.healing',
		},
		{
			type: 'split',
			variant: 'image-left-text-right',
			background: 'cream',
			eyebrow: '✨ Trải nghiệm sự rung động',
			title: 'Tần số của tinh thể',
			paragraphs: [
				'Cũng như mọi vật chất, mỗi tinh thể mang một rung động riêng. Cơ thể con người cũng có nhịp rung của mình và có thể cộng hưởng khi tiếp xúc với các rung động khác. Khi làm việc với tinh thể, bạn có thể cảm nhận sự chuyển hóa nhẹ nhàng trên thể chất, tâm trí và tinh thần.',
				'Bởi tinh thể thường có độ rung cao hơn so với trạng thái thường nhật của cơ thể, chúng có xu hướng nâng đỡ và hỗ trợ bạn điều chỉnh nhịp năng lượng theo hướng tích cực hơn.',
				'Tần số rung ở mức cao hơn rất hữu ích cho con người vì nó cho phép chúng ta mở rộng nhận thức, thăng tiến về mặt tinh thần và dịch chuyển theo hướng lành mạnh hơn cho thể chất và cảm xúc.',
			],
			imageUrls: ['/images/about/3.jpg'],
			imageAlt: 'Tinh thể và năng lượng — Miue.healing',
		},
		{
			type: 'product-spotlight',
			background: 'white',
			eyebrow: 'Đa dạng làm tay',
			title: 'Bạn có thể tìm thấy gì ở đây',
			description:
				'Với mong muốn đưa nguồn năng lượng chữa lành đến gần hơn với mọi người, các sản phẩm handmade tại tiệm rất đa dạng — từ nghi thức thanh tẩy đến trang sức và tinh thể thô.',
			imageUrls: ['/images/about/4.jpg'],
			imageAlt: 'Bộ sưu tập sản phẩm Miue.healing',
			blocks: [
				{
					title: 'Nến & gỗ Palo thanh tẩy',
					items: [
						'**Nến Spell:** handmade từ sáp đậu nành và đá năng lượng, gợi ý cho từng ước nguyện — Tình yêu, Tiền tài, Giao tiếp, Chữa lành…',
						'**Gỗ Palo Santo:** thanh tẩy không gian và hỗ trợ thanh tẩy đá.',
					],
				},
				{
					title: 'Trang sức',
					items: [
						'Dây chuyền đá quấn dây đồng, vòng tay đan macrame, nhẫn đá quấn dây đồng, dây bạc — mỗi món đều được hoàn thiện bằng tay.',
					],
				},
				{
					title: 'Móc khóa',
					items: ['Tinh thể được đan dây sáp chống nước, bền bỉ để mang năng lượng đi cùng bạn mỗi ngày.'],
				},
				{
					title: 'Tinh thể năng lượng',
					items: [
						'Hàng trăm loại đa dạng hình dáng: cụm mầm, đá thô, trụ, trái tim, kim tự tháp, sỏi… phục vụ 12 cung hoàng đạo, luân xa, chữa lành và lưới đá trị liệu.',
					],
				},
			],
			blockIcons: ['🦋', '🦋', '🦋', '🦋'],
			ctaDescription: 'Ghé cửa hàng trực tuyến để chọn tinh thể và trang sức phù hợp với bạn.',
			ctaLabel: 'Khám phá cửa hàng',
			ctaHref: '/product',
		},
	],
};

export function defaultAboutPageContent(): AboutContentV1 {
	return structuredClone(DEFAULT_ABOUT_PAGE_CONTENT_VI);
}

export function aboutContentToApiRecord(content: AboutContentV1): Record<string, unknown> {
	return JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
}

export function newEmptySplitSection(): AboutSplitSection {
	return {
		type: 'split',
		variant: 'text-left-image-right',
		background: 'white',
		eyebrow: '',
		title: '',
		description: '',
		imageUrls: ['/images/about/2.jpg'],
		imageAlt: '',
	};
}

export function newEmptyProductSpotlightSection(): AboutProductSpotlightSection {
	return {
		type: 'product-spotlight',
		background: 'white',
		eyebrow: '',
		title: '',
		description: '',
		imageUrls: ['/images/about/4.jpg'],
		imageAlt: '',
		blocks: [{ title: 'Nhóm mới', items: [''] }],
		blockIcons: ['🦋'],
		ctaDescription: '',
		ctaLabel: 'Khám phá cửa hàng',
		ctaHref: '/product',
	};
}
