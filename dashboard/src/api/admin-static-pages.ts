export type AdminStaticPageRow = Record<string, any>;
export type ListStaticPagesParams = Record<string, any>;
export type StaticPageListResponse = { data: AdminStaticPageRow[]; total: number; items?: AdminStaticPageRow[] };
export function listStaticPages(_params?: any) { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getStaticPage(_id: string) { return Promise.resolve(null); }
export function updateStaticPage(_id: string, _data: any) { return Promise.resolve(); }
export function archiveStaticPage(_id: string): Promise<AdminStaticPageRow> { return Promise.resolve({ id: _id, status: 'ARCHIVED' }); }
export const deleteStaticPage = (id: string) => Promise.resolve();
export function fetchStaticPageById(_id: string): Promise<any> { return Promise.resolve(null); }
export function publishStaticPage(_id: string): Promise<AdminStaticPageRow> { return Promise.resolve({ id: _id, status: 'PUBLISHED' }); }
export function translateStaticPage(_id: string, _lang?: string): Promise<void> { return Promise.resolve(); }
export type StaticPageWriteBody = Record<string, any>;
export function createStaticPage(_data: any): Promise<any> { return Promise.resolve({ id: 'new' }); }
export function fetchStaticPages(_params?: any): Promise<{ data: any[]; items: any[]; total: number }> { return Promise.resolve({ data: [], items: [], total: 0 }); }
export const deleteStaticPages = deleteStaticPage;
