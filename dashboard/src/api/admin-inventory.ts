export type InventoryRow = Record<string, any>;
export function listInventory(_params?: any) { return Promise.resolve({ data: [], total: 0 }); }
export function getInventory(_id: string) { return Promise.resolve(null); }
export function updateStock(_id: string, _stock: number) { return Promise.resolve(); }
