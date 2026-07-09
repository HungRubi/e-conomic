import type { AdminProductRow, AdminProductVariant } from './admin-products';

export type InventoryRow = Record<string, any>;
export type InventoryTransaction = Record<string, any>;
export type InventoryTransactionComponent = Record<string, any>;
export type InventoryDetailResponse = { product: AdminProductRow | null; variants: AdminProductVariant[]; transactions: InventoryTransaction[]; orderItems?: any[] };
export type CustomProductPreviewResponse = { products: AdminProductRow[]; variants: AdminProductVariant[]; materials: any[]; requirements: any[]; sufficient: boolean };

export function listInventory(_params?: any) { return Promise.resolve({ data: [], items: [], total: 0, page: 0, totalPages: 1 }); }
export function getInventory(_id: string) { return Promise.resolve(null); }
export function updateStock(_id: string, _stock: number) { return Promise.resolve({ id: _id, stockQuantity: _stock }); }
const preview: CustomProductPreviewResponse = { products: [], variants: [], materials: [], requirements: [], sufficient: true };
export function fetchLowStock(_params?: any): Promise<CustomProductPreviewResponse> { return Promise.resolve(preview); }
export function fetchProductInventory(_id: string): Promise<InventoryDetailResponse> { return Promise.resolve({ product: null, variants: [], transactions: [] }); }
export function adjustProductStock(_id: string, data?: any): Promise<any> { return Promise.resolve({ id: _id, ...data }); }
export function batchReceiveVariants(data?: any, _note?: any): Promise<any> { return Promise.resolve({ received: 0, ...data }); }
export function previewCustomProductStock(_id?: any, _qty?: any): Promise<CustomProductPreviewResponse> { return Promise.resolve(preview); }
export function fetchTransactionComponents(_id: string): Promise<InventoryTransactionComponent[]> { return Promise.resolve([]); }
