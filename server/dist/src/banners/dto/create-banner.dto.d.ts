import { BannerType } from '@prisma/client';
export declare class CreateBannerDto {
    imageUrl: string;
    linkUrl?: string;
    altText?: string;
    type: BannerType;
    sortOrder?: number;
    active?: boolean;
}
