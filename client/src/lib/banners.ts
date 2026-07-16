import { apiFetch } from './api-client';

export type BannerType = 'HERO' | 'BANNER';

export interface Banner {
	id: string;
	imageUrl: string;
	linkUrl?: string | null;
	altText?: string | null;
	type: BannerType;
	sortOrder: number;
	active: boolean;
}

export async function getBanners(type?: BannerType): Promise<Banner[]> {
	const search = type ? `?type=${type}` : '';
	return apiFetch<Banner[]>(`/banners${search}`);
}

export async function getHeroBanners(): Promise<Banner[]> {
	return getBanners('HERO');
}

export async function getAdBanners(): Promise<Banner[]> {
	return getBanners('BANNER');
}
