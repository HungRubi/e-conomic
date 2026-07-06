export type AdminProductMaterialRow = Record<string, any>;
export type ListProductMaterialsParams = Record<string, any>;
export type ProductMaterialListResponse = { data: AdminProductMaterialRow[]; total: number; items?: AdminProductMaterialRow[] };
export function listProductMaterials(_params?: any) { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getProductMaterial(_id: string) { return Promise.resolve(null); }
export function createProductMaterial(_data: any) { return Promise.resolve({ id: "new" }); }
export function updateProductMaterial(_id: string, _data: any) { return Promise.resolve(); }
export function deleteProductMaterial(_id: string) { return Promise.resolve(); }
