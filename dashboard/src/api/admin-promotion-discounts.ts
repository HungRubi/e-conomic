export type AdminPromotionDiscountRow = Record<string, any>;
export type ListPromotionDiscountsParams = Record<string, any>;
export type PromotionDiscountListResponse = { data: AdminPromotionDiscountRow[]; total: number; items?: AdminPromotionDiscountRow[] };
export function listPromotionDiscounts(_params?: any): Promise<PromotionDiscountListResponse> { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getPromotionDiscount(_id: string) { return Promise.resolve(null); }
export function createPromotionDiscount(_data: any) { return Promise.resolve({ id: "new" }); }
export function updatePromotionDiscount(_id: string, _data: any) { return Promise.resolve(); }
export function deletePromotionDiscount(_id: string) { return Promise.resolve(); }
export async function fetchPromotionDiscounts(_params?: any): Promise<PromotionDiscountListResponse> { return { data: [], total: 0, items: [] }; }
