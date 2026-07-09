export type AdminCustomerFeedbackRow = Record<string, any>;
export type CustomerFeedbackBullet = Record<string, any>;
export type CustomerFeedbackWriteBody = Record<string, any>;
export type ListCustomerFeedbacksParams = Record<string, any>;
export type CustomerFeedbackListResponse = { data: AdminCustomerFeedbackRow[]; total: number; items?: AdminCustomerFeedbackRow[] };
export function listCustomerFeedbacks(_params?: any): Promise<CustomerFeedbackListResponse> { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getCustomerFeedback(_id: string) { return Promise.resolve(null); }
export function deleteCustomerFeedback(_id: string) { return Promise.resolve(); }
export async function fetchCustomerFeedbacks(_params?: any): Promise<CustomerFeedbackListResponse> { return { data: [], total: 0, items: [] }; }
export async function fetchCustomerFeedbackById(_id: string): Promise<AdminCustomerFeedbackRow | null> { return null; }
export async function publishCustomerFeedback(_id: string): Promise<AdminCustomerFeedbackRow> { return { id: _id, status: 'PUBLISHED' }; }
export async function archiveCustomerFeedback(_id: string): Promise<AdminCustomerFeedbackRow> { return { id: _id, status: 'ARCHIVED' }; }
export async function updateCustomerFeedback(..._args: any[]): Promise<AdminCustomerFeedbackRow> { return { id: 'updated' }; }
export async function createCustomerFeedback(_data: any): Promise<AdminCustomerFeedbackRow> { return { id: "new" }; }
