import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';
export declare class BannersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(query?: {
        type?: string;
    }): Promise<{
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
    listPublic(type?: string): Promise<{
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
    getById(id: string): Promise<{
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
}
