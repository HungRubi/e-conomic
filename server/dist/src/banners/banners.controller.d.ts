import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';
export declare class BannersController {
    private readonly banners;
    constructor(banners: BannersService);
    list(query: any): Promise<{
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
    get(id: string): Promise<{
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.BannerType;
        imageUrl: string;
        linkUrl: string | null;
        altText: string | null;
        active: boolean;
    }>;
    create(dto: CreateBannerDto): Promise<{
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.BannerType;
        imageUrl: string;
        linkUrl: string | null;
        altText: string | null;
        active: boolean;
    }>;
    update(id: string, dto: UpdateBannerDto): Promise<{
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.BannerType;
        imageUrl: string;
        linkUrl: string | null;
        altText: string | null;
        active: boolean;
    }>;
    delete(id: string): Promise<{
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.BannerType;
        imageUrl: string;
        linkUrl: string | null;
        altText: string | null;
        active: boolean;
    }>;
    upload(file: Express.Multer.File): {
        url: string;
    };
    uploadUrl(url: string): {
        url: string;
    };
}
