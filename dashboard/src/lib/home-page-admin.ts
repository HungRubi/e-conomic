/**
 * Schema JSON trang Home (slug `home`) — template-based sections.
 * Kiểu & parser nhân bản trong dashboard để không phụ thuộc package website.
 */

export const HOME_CONTENT_VERSION = 1 as const;

/* ─── Page font config ─── */

export type PageFontConfig = {
	headingFamily: string;
	bodyFamily: string;
	headingSize: string;
	bodySize: string;
};

const DEFAULT_FONTS: PageFontConfig = {
	headingFamily: 'Lora',
	bodyFamily: 'Inter',
	headingSize: 'text-4xl sm:text-5xl',
	bodySize: 'text-base sm:text-lg',
};

/* ─── Background config ─── */

export type BackgroundConfig =
	| { type: 'color'; value: string }
	| { type: 'image'; value: string; overlay?: string }
	| { type: 'gradient'; value: string };

/* ─── Section style ─── */

export type SectionStyle = {
	fonts?: Partial<PageFontConfig>;
	background?: BackgroundConfig;
	textColor?: string;
	paddingY?: string;
	width?: 'full' | 'contained';
};

/* ─── CTA button ─── */

export type CTAButton = {
	label: string;
	href: string;
	variant: 'primary' | 'secondary' | 'outline';
};

/* ─── Template content types ─── */

export type HeroContent = {
	eyebrow?: string;
	title?: string;
	description?: string;
	backgroundImage: { desktop: string; mobile?: string };
	overlay?: string;
	alignment?: 'center' | 'left';
	height?: 'full-screen' | 'large' | 'medium';
	buttons?: CTAButton[];
	showEyebrow?: boolean;
	showTitle?: boolean;
	showDescription?: boolean;
};

export type TwoColumnContent = {
	layout: 'text-left' | 'text-right';
	ratio: '50-50' | '60-40' | '40-60' | '70-30';
	background: string;
	eyebrow?: string;
	title?: string;
	description?: string;
	paragraphs?: string[];
	images: string[];
	imageAlt?: string[];
	showEyebrow?: boolean;
	showTitle?: boolean;
	showDescription?: boolean;
	showParagraphs?: boolean;
};

export type GridCardItem = {
	imageUrl?: string;
	title: string;
	description: string;
	link?: string;
};

export type GridCardsContent = {
	columns: 2 | 3 | 4;
	eyebrow?: string;
	title?: string;
	description?: string;
	cardStyle: 'bordered' | 'shadow' | 'minimal';
	cards: GridCardItem[];
};

export type GalleryImage = {
	url: string;
	alt: string;
	caption?: string;
};

export type GalleryContent = {
	layout: 'grid' | 'masonry';
	columns: 2 | 3 | 4;
	images: GalleryImage[];
	caption: 'none' | 'hover' | 'always';
};

export type FeedproductsContent = {
	title?: string;
	description?: string;
	count: number;
	sortBy: 'default' | 'newest' | 'best-seller';
	layout: 'grid' | 'carousel';
};

export type VideoContent = {
	youtubeUrl: string;
	title?: string;
	description?: string;
	autoplay?: boolean;
	thumbnailUrl?: string;
};

export type CtaBannerContent = {
	backgroundImage: string;
	overlay?: string;
	eyebrow?: string;
	title?: string;
	description?: string;
	buttons?: CTAButton[];
	alignment?: 'center' | 'left';
};

export type RichTextContent = {
	content: string;
	alignment?: 'left' | 'center' | 'right';
};

export type FeedbacksContent = {
	title?: string;
	count: number;
	layout: 'grid' | 'carousel';
};

export type BlockGroup = {
	title: string;
	items: string[];
};

export type SplitBlocksContent = {
	eyebrow?: string;
	title?: string;
	description?: string;
	images: string[];
	imageAlt?: string;
	blocks: BlockGroup[];
	blockIcons?: string[];
	ctaDescription?: string;
	ctaLabel?: string;
	ctaHref?: string;
};

/* ─── Union ─── */

export type TemplateContent =
	| { templateId: 'hero'; content: HeroContent }
	| { templateId: 'two-column'; content: TwoColumnContent }
	| { templateId: 'grid-cards'; content: GridCardsContent }
	| { templateId: 'gallery'; content: GalleryContent }
	| { templateId: 'featured-products'; content: FeedproductsContent }
	| { templateId: 'video'; content: VideoContent }
	| { templateId: 'cta-banner'; content: CtaBannerContent }
	| { templateId: 'rich-text'; content: RichTextContent }
	| { templateId: 'customer-feedbacks'; content: FeedbacksContent }
	| { templateId: 'split-blocks'; content: SplitBlocksContent };

/* ─── Home section ─── */

export type HomeSection = {
	id: string;
	templateId: string;
	label: string;
	content: Record<string, unknown>;
	style: SectionStyle | null;
};

/* ─── Home content (toàn bộ content của StaticPage) ─── */

export type HomeContentV1 = {
	version: typeof HOME_CONTENT_VERSION;
	fonts: PageFontConfig;
	sections: HomeSection[];
};

/* ─── Parser ─── */

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function parseHomePageContent(raw: unknown): HomeContentV1 | null {
	if (!isRecord(raw)) return null;
	if (raw.version !== HOME_CONTENT_VERSION) return null;

	// fonts
	const fonts = parseFonts(isRecord(raw.fonts) ? raw.fonts : {});
	// sections
	if (!Array.isArray(raw.sections)) return null;
	const sections: HomeSection[] = [];
	for (const item of raw.sections) {
		const sec = parseSection(item);
		if (!sec) return null;
		sections.push(sec);
	}

	return { version: HOME_CONTENT_VERSION, fonts, sections };
}

function parseFonts(raw: Record<string, unknown>): PageFontConfig {
	return {
		headingFamily: typeof raw.headingFamily === 'string' ? raw.headingFamily : DEFAULT_FONTS.headingFamily,
		bodyFamily: typeof raw.bodyFamily === 'string' ? raw.bodyFamily : DEFAULT_FONTS.bodyFamily,
		headingSize: typeof raw.headingSize === 'string' ? raw.headingSize : DEFAULT_FONTS.headingSize,
		bodySize: typeof raw.bodySize === 'string' ? raw.bodySize : DEFAULT_FONTS.bodySize,
	};
}

function parseSection(raw: unknown): HomeSection | null {
	if (!isRecord(raw)) return null;
	if (typeof raw.id !== 'string' || typeof raw.templateId !== 'string') return null;
	return {
		id: raw.id,
		templateId: raw.templateId,
		label: typeof raw.label === 'string' ? raw.label : raw.templateId,
		content: isRecord(raw.content) ? raw.content : {},
		style:
			raw.style !== null && raw.style !== undefined && isRecord(raw.style)
				? (raw.style as unknown as SectionStyle)
				: null,
	};
}

/* ─── Defaults ─── */

export const TEMPLATE_LABELS: Record<string, string> = {
	hero: 'Hero (Banner toàn màn hình)',
	'soul-jewelry': 'Giới thiệu (Trang sức tâm hồn)',
	'healing-space': 'Không gian chữa lành',
	connection: 'Kết nối (Banner toàn màn hình)',
	'two-column': 'Hai cột (chữ + ảnh)',
	'grid-cards': 'Grid Cards',
	gallery: 'Bộ sưu tập ảnh',
	'featured-products': 'Sản phẩm nổi bật',
	video: 'Video YouTube',
	'cta-banner': 'Banner kêu gọi (CTA)',
	'rich-text': 'Văn bản định dạng',
	'customer-feedbacks': 'Phản hồi khách hàng',
	'split-blocks': 'Nhiều nhóm (như spotlight)',
};

export const TEMPLATE_IDS = Object.keys(TEMPLATE_LABELS);

function uid(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultSectionContent(templateId: string): Record<string, unknown> {
	switch (templateId) {
		case 'hero':
			return {
				eyebrow: '',
				title: '',
				description: '',
				backgroundImage: { desktop: '/images/home_banner.png', mobile: '' },
				overlay: 'from-black/20 via-black/15 to-black/30',
				alignment: 'center',
				height: 'full-screen',
				buttons: [{ label: 'Khám phá', href: '/product', variant: 'primary' }],
				showEyebrow: true,
				showTitle: true,
				showDescription: true,
			} as unknown as Record<string, unknown>;
		case 'two-column':
			return {
				layout: 'text-left',
				ratio: '50-50',
				background: 'white',
				eyebrow: '',
				title: '',
				description: '',
				paragraphs: [],
				images: [''],
				imageAlt: [''],
				showEyebrow: true,
				showTitle: true,
				showDescription: true,
				showParagraphs: false,
			} as unknown as Record<string, unknown>;
		case 'grid-cards':
			return {
				columns: 3,
				eyebrow: '',
				title: '',
				description: '',
				cardStyle: 'shadow',
				cards: [{ imageUrl: '', title: 'Tiêu đề', description: 'Mô tả ngắn' }],
			} as unknown as Record<string, unknown>;
		case 'gallery':
			return {
				layout: 'grid',
				columns: 3,
				images: [{ url: '', alt: '' }],
				caption: 'none',
			} as unknown as Record<string, unknown>;
		case 'featured-products':
			return {
				title: 'Sản phẩm nổi bật',
				description: '',
				count: 4,
				sortBy: 'default',
				layout: 'grid',
			} as unknown as Record<string, unknown>;
		case 'video':
			return {
				youtubeUrl: '',
				title: '',
				description: '',
				autoplay: true,
				thumbnailUrl: '',
			} as unknown as Record<string, unknown>;
		case 'cta-banner':
			return {
				backgroundImage: '',
				overlay: '#000/40',
				eyebrow: '',
				title: '',
				description: '',
				buttons: [{ label: 'Liên hệ', href: '#', variant: 'primary' }],
				alignment: 'center',
			} as unknown as Record<string, unknown>;
		case 'rich-text':
			return {
				content: '',
				alignment: 'left',
			} as unknown as Record<string, unknown>;
		case 'customer-feedbacks':
			return {
				title: 'Khách hàng nói gì',
				count: 4,
				layout: 'grid',
			} as unknown as Record<string, unknown>;
		case 'soul-jewelry':
			return {
				eyebrow: '',
				title: '',
				description: '',
				images: ['', '', ''],
				imageAlt: ['', '', ''],
				pillars: [
					{ title: 'Tinh thể', description: '' },
					{ title: 'Năng lượng', description: '' },
					{ title: 'Handmade', description: '' },
				],
				showPillars: true,
			} as unknown as Record<string, unknown>;
		case 'healing-space':
			return {
				eyebrow: '',
				title: '',
				description: '',
				images: ['', ''],
				imageAlt: ['', ''],
				items: [
					{ title: 'Dịch vụ 1', description: '' },
					{ title: 'Dịch vụ 2', description: '' },
				],
				showItems: true,
				cardEyebrow: '',
				cardDescription: '',
			} as unknown as Record<string, unknown>;
		case 'connection':
			return {
				backgroundImage: '',
				imageLabel: '',
				eyebrow: '',
				title: '',
				description: '',
				items: [
					{ title: 'Mục 1', description: '' },
					{ title: 'Mục 2', description: '' },
					{ title: 'Mục 3', description: '' },
				],
			} as unknown as Record<string, unknown>;
		case 'split-blocks':
			return {
				eyebrow: '',
				title: '',
				description: '',
				images: [''],
				imageAlt: '',
				blocks: [{ title: 'Nhóm mới', items: [''] }],
				blockIcons: ['🦋'],
				ctaDescription: '',
				ctaLabel: 'Khám phá',
				ctaHref: '/product',
			} as unknown as Record<string, unknown>;
		default:
			return {};
	}
}

export function newHomeSection(templateId: string): HomeSection {
	return {
		id: uid(),
		templateId,
		label: TEMPLATE_LABELS[templateId] ?? templateId,
		content: defaultSectionContent(templateId),
		style: null,
	};
}

export function defaultHomePageContent(): HomeContentV1 {
	return {
		version: HOME_CONTENT_VERSION,
		fonts: { ...DEFAULT_FONTS },
		sections: [newHomeSection('hero'), newHomeSection('two-column'), newHomeSection('video')],
	};
}

export function homeContentToApiRecord(content: HomeContentV1): Record<string, unknown> {
	return JSON.parse(JSON.stringify(content)) as Record<string, unknown>;
}
