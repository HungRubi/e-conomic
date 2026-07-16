import { apiClient, apiFetch } from '@/lib/api-client';

const api = apiClient();

export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ProductType = 'SIMPLE' | 'VARIABLE' | 'DIGITAL' | 'SERVICE' | 'PHYSICAL' | 'CUSTOM_DESIGN';

export type AdminProductVariant = {
	id: string;
	productId: string;
	name: string;
	label?: string;
	color?: string | null;
	colorHex?: string | null;
	image?: string | null;
	priceVnd?: number;
	sku?: string | null;
	price?: string | number | null;
	compareAtPrice?: string | number | null;
	costPrice?: string | number | null;
	thumbnailSmall?: string | null;
	thumbnailLarge?: string | null;
	images: string[];
	stockQuantity: number;
	trackStock: boolean;
	allowBackorder: boolean;
	lowStockThreshold?: number;
	options?: unknown;
	metadata?: unknown;
	sortOrder: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type AdminProductVariantInput = {
	id?: string;
	name: string;
	sku?: string;
	priceVnd?: number;
	stockQuantity?: number;
	trackStock?: boolean;
	images?: string[];
	isActive?: boolean;
	sortOrder?: number;
	[key: string]: unknown;
};

export type AdminProductRow = {
	id: string;
	name: string;
	slug: string;
	sku?: string | null;
	description?: string | null;
	shortDescription?: string | null;
	type: ProductType;
	status: ProductStatus;
	price: string | number;
	priceVnd?: number;
	priceLabel?: string;
	image?: string | null;
	parent?: string;
	child?: string;
	accent?: string;
	detailTitle?: string;
	custom?: boolean;
	isBracelet?: boolean;
	careTips?: string[] | string;
	priceDetailGems?: any[];
	discountPercent?: number;
	sold?: number;
	lowStockThreshold?: number;
	compareAtPrice?: string | number | null;
	costPrice?: string | number | null;
	thumbnailSmall?: string | null;
	thumbnailLarge?: string | null;
	images: string[];
	stockQuantity: number;
	trackStock: boolean;
	allowBackorder: boolean;
	weight?: string | number | null;
	width?: string | number | null;
	height?: string | number | null;
	length?: string | number | null;
	seoTitle?: string | null;
	seoDescription?: string | null;
	seoKeywords: string[];
	isFeatured: boolean;
	sortOrder: number;
	attributes?: unknown;
	metadata?: unknown;
	categories?: unknown[];
	variants?: AdminProductVariant[];
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
};

export type ListProductsParams = {
	q?: string;
	page?: number;
	pageSize?: number;
	limit?: number;
	offset?: number;
	status?: 'all' | ProductStatus;
	type?: 'all' | ProductType;
	categoryId?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
};

export type ProductListResponse = {
	data: AdminProductRow[];
	items: AdminProductRow[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type ProductBody = Partial<
	Omit<AdminProductRow, 'id' | 'categories' | 'variants' | 'createdAt' | 'updatedAt' | 'deletedAt'>
> & {
	name: string;
	price?: number;
	priceVnd?: number;
	image?: string;
	categoryIds?: string[];
	primaryCategoryId?: string;
	[key: string]: unknown;
};

function qs(params?: Record<string, unknown>) {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params ?? {})) {
		if (value === undefined || value === null || value === '') continue;
		search.set(key, String(value));
	}
	const text = search.toString();
	return text ? `?${text}` : '';
}

function normalizeProduct(row: AdminProductRow): AdminProductRow {
	const priceNumber = Number(row.price ?? 0);
	const image = (row as any).image ?? row.thumbnailLarge ?? row.thumbnailSmall ?? row.images?.[0] ?? null;
	const compareAt = row.compareAtPrice ? Number(row.compareAtPrice) : null;
	return {
		...row,
		image,
		priceVnd: (row as any).priceVnd ?? priceNumber,
		priceLabel: (row as any).priceLabel ?? `${priceNumber.toLocaleString('vi-VN')}đ`,
		type: row.type === 'SIMPLE' ? 'PHYSICAL' : row.type,
		discountPercent:
			(row as any).discountPercent ??
			(compareAt && priceNumber > 0 ? Math.round((1 - priceNumber / compareAt) * 100) : 0),
	} as AdminProductRow;
}

function normalizeList(res: ProductListResponse): ProductListResponse {
	const items = (res.items ?? res.data ?? []).map(normalizeProduct);
	return { ...res, data: items, items };
}

function toServerProductBody(data: Partial<ProductBody>): Record<string, unknown> {
	const thumbnail = data.image ?? data.thumbnailLarge ?? data.thumbnailSmall;
	const images = Array.isArray(data.images)
		? data.images.map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
		: [];
	const out: Record<string, unknown> = {};
	if (data.name !== undefined) out.name = data.name;
	if (data.slug !== undefined) out.slug = data.slug;
	if (data.sku !== undefined) out.sku = data.sku;
	if (data.description !== undefined) out.description = data.description;
	if (data.shortDescription !== undefined) out.shortDescription = data.shortDescription;
	if (data.status !== undefined) out.status = data.status;
	if (data.type !== undefined) out.type = data.type;
	if (data.isFeatured !== undefined) out.isFeatured = data.isFeatured;
	if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
	if (data.sold !== undefined) out.soldCount = data.sold;
	if (data.soldCount !== undefined) out.soldCount = data.soldCount;

	// Price — only send if explicitly provided
	if (data.price !== undefined || data.priceVnd !== undefined) {
		out.price = data.price ?? data.priceVnd ?? 0;
	}

	// Discount: compute compareAtPrice from discountPercent if available
	if (data.discountPercent !== undefined) {
		const basePrice = Number(data.price ?? data.priceVnd ?? 0);
		if (data.discountPercent > 0 && basePrice > 0) {
			out.compareAtPrice = Math.round(basePrice / (1 - data.discountPercent / 100));
		} else {
			out.compareAtPrice = null;
		}
	} else if (data.compareAtPrice !== undefined) {
		out.compareAtPrice = data.compareAtPrice !== null ? Number(data.compareAtPrice) : null;
	}

	// Images
	if (data.thumbnailSmall !== undefined) out.thumbnailSmall = data.thumbnailSmall;
	if (data.thumbnailLarge !== undefined) out.thumbnailLarge = data.thumbnailLarge;
	if (data.images !== undefined) out.images = images;

	// Stock
	if ((data as any).stockQuantity !== undefined) out.stockQuantity = (data as any).stockQuantity;
	if ((data as any).trackStock !== undefined) out.trackStock = (data as any).trackStock;
	if ((data as any).allowBackorder !== undefined) out.allowBackorder = (data as any).allowBackorder;

	// SEO
	if (data.seoTitle !== undefined) out.seoTitle = data.seoTitle;
	if (data.seoDescription !== undefined) out.seoDescription = data.seoDescription;
	if (data.seoKeywords !== undefined) out.seoKeywords = data.seoKeywords;

	// Physical dimensions
	if ((data as any).weight !== undefined) out.weight = (data as any).weight;
	if ((data as any).width !== undefined) out.width = (data as any).width;
	if ((data as any).height !== undefined) out.height = (data as any).height;
	if ((data as any).length !== undefined) out.length = (data as any).length;

	// Categories
	if (data.categoryIds !== undefined) {
		out.categoryIds = data.categoryIds;
		out.primaryCategoryId = data.primaryCategoryId ?? data.categoryIds?.[0];
	}

	return out;
}

export async function fetchProducts(params?: ListProductsParams): Promise<ProductListResponse> {
	return normalizeList(await api.get(`/admin/products${qs(params)}`));
}

export function listProducts(params?: ListProductsParams): Promise<ProductListResponse> {
	return fetchProducts(params);
}

export async function getProduct(id: string): Promise<AdminProductRow> {
	return normalizeProduct(await api.get(`/admin/products/${id}`));
}

export async function createProduct(data: ProductBody): Promise<AdminProductRow> {
	return normalizeProduct(await api.post('/admin/products', toServerProductBody(data)));
}

export async function updateProduct(id: string, data: Partial<ProductBody>): Promise<AdminProductRow> {
	return normalizeProduct(
		await apiFetch<AdminProductRow>(`/admin/products/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(toServerProductBody(data)),
		})
	);
}

export async function publishProduct(id: string): Promise<AdminProductRow> {
	return normalizeProduct(
		await apiFetch<AdminProductRow>(`/admin/products/${id}/publish`, { method: 'PATCH', body: '{}' })
	);
}

export async function archiveProduct(id: string): Promise<AdminProductRow> {
	return normalizeProduct(
		await apiFetch<AdminProductRow>(`/admin/products/${id}/archive`, { method: 'PATCH', body: '{}' })
	);
}

export async function deleteProduct(id: string): Promise<AdminProductRow> {
	return normalizeProduct(await api.del(`/admin/products/${id}`));
}

export async function uploadProductImage(idOrFile: string | File, maybeFile?: File): Promise<{ url: string }> {
	const file = idOrFile instanceof File ? idOrFile : maybeFile;
	if (!file) return { url: '' };
	return { url: URL.createObjectURL(file) };
}

export type InventoryTransaction = Record<string, any>;

export function adjustProductStock(_id: string, _data?: any): Promise<any> {
	return Promise.resolve({ id: _id });
}

export function fetchInventoryTransactions(_type?: string, _id?: string): Promise<InventoryTransaction[]> {
	return Promise.resolve([]);
}
