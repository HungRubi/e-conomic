import { apiClient, apiFetch } from '@/lib/api-client';

const api = apiClient();

export type CategoryStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type CategoryDisplayType = 'DEFAULT' | 'COLLECTION' | 'LANDING' | 'HIDDEN';

export type AdminProductCategoryRow = {
	id: string;
	parentId?: string | null;
	name: string;
	enName?: string;
	slug: string;
	productCount?: number;
	description?: string | null;
	image?: string | null;
	icon?: string | null;
	status: CategoryStatus;
	displayType: CategoryDisplayType;
	sortOrder: number;
	level: number;
	path?: string | null;
	pathIds: string[];
	seoTitle?: string | null;
	seoDescription?: string | null;
	seoKeywords: string[];
	canonicalUrl?: string | null;
	showInMenu: boolean;
	showInHomepage: boolean;
	isFeatured: boolean;
	metadata?: unknown;
	filters?: unknown;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
	children?: AdminProductCategoryRow[];
	parent?: AdminProductCategoryRow | null;
	products?: unknown[];
	attributes?: unknown[];
};

export type ListProductCategoriesParams = {
	q?: string;
	page?: number;
	pageSize?: number;
	limit?: number;
	offset?: number;
	status?: 'all' | CategoryStatus;
	level?: 'all' | 0 | 1 | 2;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
};

export type ProductCategoryListResponse = {
	data: AdminProductCategoryRow[];
	items: AdminProductCategoryRow[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type ProductCategoryBody = Partial<
	Omit<
		AdminProductCategoryRow,
		'id' | 'children' | 'parent' | 'products' | 'attributes' | 'createdAt' | 'updatedAt' | 'deletedAt'
	>
> & {
	name: string;
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

export function fetchProductCategories(params?: ListProductCategoriesParams): Promise<ProductCategoryListResponse> {
	return api.get(`/admin/product-categories${qs(params)}`);
}

export function listProductCategories(params?: ListProductCategoriesParams): Promise<ProductCategoryListResponse> {
	return fetchProductCategories(params);
}

export function fetchAllProductCategories(
	params?: Omit<ListProductCategoriesParams, 'page' | 'pageSize'>
): Promise<AdminProductCategoryRow[]> {
	return api.get(`/admin/product-categories/all${qs(params)}`);
}

export function getProductCategory(id: string): Promise<AdminProductCategoryRow> {
	return api.get(`/admin/product-categories/${id}`);
}

export function createProductCategory(data: ProductCategoryBody): Promise<AdminProductCategoryRow> {
	return api.post('/admin/product-categories', data);
}

export function updateProductCategory(
	id: string,
	data: Partial<ProductCategoryBody>
): Promise<AdminProductCategoryRow> {
	return apiFetch<AdminProductCategoryRow>(`/admin/product-categories/${id}`, {
		method: 'PATCH',
		body: JSON.stringify(data),
	});
}

export function publishProductCategory(id: string): Promise<AdminProductCategoryRow> {
	return apiFetchPatch(`/admin/product-categories/${id}/publish`);
}

export function archiveProductCategory(id: string): Promise<AdminProductCategoryRow> {
	return apiFetchPatch(`/admin/product-categories/${id}/archive`);
}

export function deleteProductCategory(id: string): Promise<AdminProductCategoryRow> {
	return api.del(`/admin/product-categories/${id}`);
}

async function apiFetchPatch<T = AdminProductCategoryRow>(url: string): Promise<T> {
	return apiFetch<T>(url, { method: 'PATCH', body: '{}' });
}
