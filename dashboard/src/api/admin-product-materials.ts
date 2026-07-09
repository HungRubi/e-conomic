export type AdminProductMaterialRow = Record<string, any> & {
	id: string;
	name: string;
	slug?: string;
	kind?: string;
	status?: string;
	priceVnd: number;
	image?: string | null;
	sortOrder?: number;
};
export type ListProductMaterialsParams = Record<string, any>;
export type ProductMaterialListResponse = { data: AdminProductMaterialRow[]; items: AdminProductMaterialRow[]; total: number; page: number; totalPages: number };

const empty: ProductMaterialListResponse = { data: [], items: [], total: 0, page: 0, totalPages: 1 };

export function listProductMaterials(_params?: any): Promise<ProductMaterialListResponse> { return Promise.resolve(empty); }
export function fetchProductMaterials(_params?: any): Promise<ProductMaterialListResponse> { return Promise.resolve(empty); }
export function getProductMaterial(_id: string): Promise<AdminProductMaterialRow | null> { return Promise.resolve(null); }
export function createProductMaterial(_data: any): Promise<AdminProductMaterialRow> { return Promise.resolve({ id: 'new', name: '', priceVnd: 0 }); }
export function updateProductMaterial(_id: string, _data: any): Promise<AdminProductMaterialRow> { return Promise.resolve({ id: _id, name: '', priceVnd: 0 }); }
export function deleteProductMaterial(_id: string): Promise<AdminProductMaterialRow> { return Promise.resolve({ id: _id, name: '', priceVnd: 0 }); }
export function publishProductMaterial(_id: string): Promise<AdminProductMaterialRow> { return Promise.resolve({ id: _id, name: '', priceVnd: 0, status: 'ACTIVE' }); }
export function archiveProductMaterial(_id: string): Promise<AdminProductMaterialRow> { return Promise.resolve({ id: _id, name: '', priceVnd: 0, status: 'ARCHIVED' }); }

export const fetchProductMaterialById = getProductMaterial;
