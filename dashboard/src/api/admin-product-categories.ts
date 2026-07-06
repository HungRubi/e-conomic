export type AdminProductCategoryRow = Record<string, any>;
export type ListProductCategoriesParams = Record<string, any>;
export type ProductCategoryListResponse = { data: AdminProductCategoryRow[]; total: number; items?: AdminProductCategoryRow[] };
export function listProductCategories(_params?: any): Promise<ProductCategoryListResponse> { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getProductCategory(_id: string) { return Promise.resolve(null); }
export function createProductCategory(_data: any) { return Promise.resolve({ id: "new" }); }
export function updateProductCategory(_id: string, _data: any) { return Promise.resolve(); }
export function deleteProductCategory(_id: string) { return Promise.resolve(); }
export async function fetchAllProductCategories(): Promise<AdminProductCategoryRow[]> { return []; }
