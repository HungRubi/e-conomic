import { BannersService } from './banners.service';
export declare class PublicBannersController {
    private readonly banners;
    constructor(banners: BannersService);
    list(type?: string): Promise<{
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.BannerType;
        imageUrl: string;
        linkUrl: string | null;
        altText: string | null;
        active: boolean;
    }[]>;
}
