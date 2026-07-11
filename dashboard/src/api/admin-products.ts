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
	return {
		...row,
		image,
		priceVnd: (row as any).priceVnd ?? priceNumber,
		priceLabel: (row as any).priceLabel ?? `${priceNumber.toLocaleString('vi-VN')}đ`,
		type: row.type === 'SIMPLE' ? 'PHYSICAL' : row.type,
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
	return {
		name: data.name,
		...(data.slug ? { slug: data.slug } : {}),
		...(data.sku ? { sku: data.sku } : {}),
		description: data.description ?? '',
		shortDescription: (data as any).detailTitle ?? data.shortDescription ?? '',
		type: data.type === 'PHYSICAL' ? 'SIMPLE' : data.type,
		status: data.status,
		price: data.price ?? data.priceVnd ?? 0,
		thumbnailSmall: data.thumbnailSmall ?? thumbnail ?? null,
		thumbnailLarge: data.thumbnailLarge ?? thumbnail ?? null,
		images,
		stockQuantity: (data as any).stockQuantity ?? 0,
		trackStock: (data as any).trackStock ?? true,
		allowBackorder: (data as any).allowBackorder ?? false,
		isFeatured: data.isFeatured ?? false,
		sortOrder: data.sortOrder ?? 0,
		categoryIds: data.categoryIds ?? [],
		primaryCategoryId: data.primaryCategoryId ?? data.categoryIds?.[0],
		metadata: {
			accent: (data as any).accent,
			parent: (data as any).parent,
			child: (data as any).child,
			categorySlugs: (data as any).categorySlugs,
			custom: (data as any).custom,
			isBracelet: (data as any).isBracelet,
			careTips: (data as any).careTips,
			components: (data as any).components,
		},
		attributes: { variants: (data as any).variants ?? [] },
	};
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
