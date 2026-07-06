export type AdminStaticPageRow = Record<string, any>;
export type ListStaticPagesParams = Record<string, any>;
export type StaticPageListResponse = { data: AdminStaticPageRow[]; total: number; items?: AdminStaticPageRow[] };
export function listStaticPages(_params?: any) { return Promise.resolve({ data: [], total: 0, items: [] }); }
export function getStaticPage(_id: string) { return Promise.resolve(null); }
export function updateStaticPage(_id: string, _data: any) { return Promise.resolve(); }
