export type AdminContactInquiryRow = Record<string, any>;
export type ContactInquiryStatus = 'new' | 'read' | 'archived';
export type ListContactInquiriesParams = Record<string, any>;
export type ContactInquiryListResponse = {
	data: AdminContactInquiryRow[];
	total: number;
	items?: AdminContactInquiryRow[];
};
export function listContactInquiries(_params?: any): Promise<ContactInquiryListResponse> {
	return Promise.resolve({ data: [], total: 0, items: [] });
}
export function getContactInquiry(_id: string) {
	return Promise.resolve(null);
}
export function deleteContactInquiry(_id: string) {
	return Promise.resolve();
}
export const CONTACT_INQUIRY_SOURCE_LABEL: Record<string, string> = {
	website: 'Website',
	facebook: 'Facebook',
	zalo: 'Zalo',
};
export const CONTACT_INQUIRY_STATUS_LABEL: Record<string, string> = { new: 'Mới', read: 'Đã xem', archived: 'Đã lưu' };
export async function fetchContactInquiries(_params?: any): Promise<ContactInquiryListResponse> {
	return { data: [], total: 0, items: [] };
}
export async function fetchContactInquirySummary(): Promise<any> {
	return { total: 0, unseen: 0 };
}
export async function fetchContactInquiry(_id: string): Promise<AdminContactInquiryRow | null> {
	return null;
}
export async function archiveContactInquiry(_id: string): Promise<void> {}
export async function markContactInquiryRead(_id: string): Promise<void> {}
