export type AdminPromotionDiscountRow = Record<string, any>;
export type ListPromotionDiscountsParams = Record<string, any>;
export type PromotionDiscountListResponse = {
	data: AdminPromotionDiscountRow[];
	items: AdminPromotionDiscountRow[];
	total: number;
	limit: number;
	offset: number;
	hasMore: boolean;
};
export function listPromotionDiscounts(_params?: any): Promise<PromotionDiscountListResponse> {
	return Promise.resolve({ data: [], items: [], total: 0, limit: 0, offset: 0, hasMore: false });
}
export function getPromotionDiscount(_id: string) {
	return Promise.resolve(null);
}
export function deletePromotionDiscount(_id: string) {
	return Promise.resolve();
}
export async function fetchPromotionDiscounts(_params?: any): Promise<PromotionDiscountListResponse> {
	return { data: [], items: [], total: 0, limit: 0, offset: 0, hasMore: false };
}
export const fetchPromotionDiscountById = getPromotionDiscount;
export const archivePromotionDiscount = (_id: string) => Promise.resolve({ id: _id });
export const publishPromotionDiscount = (_id: string) => Promise.resolve({ id: _id });
export const createPromotionDiscount = (_data: any) => Promise.resolve({ id: 'new' } as AdminPromotionDiscountRow);
export const updatePromotionDiscount = (_id: string, _data: any) =>
	Promise.resolve({ id: _id } as AdminPromotionDiscountRow);
