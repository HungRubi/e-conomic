import { apiClient, apiFetch } from '@/lib/api-client';

const api = apiClient();

export type BannerType = 'HERO' | 'BANNER';

export type AdminBannerRow = {
	id: string;
	imageUrl: string;
	linkUrl?: string | null;
	altText?: string | null;
	type: BannerType;
	sortOrder: number;
	active: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CreateBannerBody = {
	imageUrl: string;
	linkUrl?: string | null;
	altText?: string | null;
	type: BannerType;
	sortOrder?: number;
	active?: boolean;
};

export type UpdateBannerBody = Partial<CreateBannerBody>;

export async function fetchBanners(params?: { type?: string }): Promise<AdminBannerRow[]> {
	const search = params?.type ? `?type=${params.type}` : '';
	return api.get(`/admin/banners${search}`);
}

export async function getBanner(id: string): Promise<AdminBannerRow> {
	return api.get(`/admin/banners/${id}`);
}

export async function createBanner(body: CreateBannerBody): Promise<AdminBannerRow> {
	return api.post('/admin/banners', body);
}

export async function updateBanner(id: string, body: UpdateBannerBody): Promise<AdminBannerRow> {
	return api.patch(`/admin/banners/${id}`, body);
}

export async function deleteBanner(id: string): Promise<AdminBannerRow> {
	return api.del(`/admin/banners/${id}`);
}

export async function uploadBannerImage(file: File): Promise<{ url: string }> {
	const form = new FormData();
	form.append('file', file);
	return apiFetch('/admin/banners/upload', {
		method: 'POST',
		body: form,
	});
}
