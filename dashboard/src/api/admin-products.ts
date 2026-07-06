export type AdminProductRow = Record<string, any>;
export type AdminProductVariant = Record<string, any>;
export type ListProductsParams = Record<string, any>;
export type ProductListResponse = { data: AdminProductRow[]; total: number; items?: AdminProductRow[] };
export function listProducts(_params?: any): Promise<ProductListResponse> { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getProduct(_id: string) { return Promise.resolve(null); }
export function deleteProduct(_id: string) { return Promise.resolve(); }
export function createProduct(_data: any) { return Promise.resolve({ id: "new" }); }
export function updateProduct(..._args: any[]): Promise<void> { return Promise.resolve(); }
export async function uploadProductImage(_id: string, _file: any) { return Promise.resolve({ url: "" }); }
export async function fetchProducts(_params?: any): Promise<ProductListResponse> { return { data: [], total: 0, items: [] }; }
