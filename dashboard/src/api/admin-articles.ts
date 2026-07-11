export type AdminArticleRow = Record<string, any>;
export type ArticleWriteBody = Record<string, any>;
export type ListArticlesParams = Record<string, any>;
export type ArticleListResponse = { data: AdminArticleRow[]; total: number; items?: AdminArticleRow[] };
export function listArticles(_params?: any): Promise<ArticleListResponse> {
	return Promise.resolve({ data: [], total: 0, items: [] });
}
export function getArticle(_id: string): Promise<AdminArticleRow | null> {
	return Promise.resolve(null);
}
export function createArticle(_data: any): Promise<AdminArticleRow> {
	return Promise.resolve({ id: 'new' });
}
export function updateArticle(..._args: any[]): Promise<AdminArticleRow> {
	return Promise.resolve({ id: 'updated' });
}
export function deleteArticle(_id: string): Promise<void> {
	return Promise.resolve();
}
export async function fetchArticles(_params?: any): Promise<ArticleListResponse> {
	return { data: [], total: 0, items: [] };
}
export async function fetchArticleById(_id: string): Promise<AdminArticleRow | null> {
	return null;
}
export async function publishArticle(_id: string): Promise<AdminArticleRow> {
	return { id: _id, status: 'PUBLISHED' };
}
export async function archiveArticle(_id: string): Promise<AdminArticleRow> {
	return { id: _id, status: 'ARCHIVED' };
}
export async function translateArticle(_id: string, _lang?: string): Promise<void> {}
