import { CategoryDisplayType, CategoryStatus, AttributeType } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
    icon?: string;
    parentId?: string | null;
    status?: CategoryStatus;
    displayType?: CategoryDisplayType;
    sortOrder?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    canonicalUrl?: string;
    showInMenu?: boolean;
    showInHomepage?: boolean;
    isFeatured?: boolean;
    metadata?: unknown;
    filters?: unknown;
}
declare const UpdateCategoryDto_base: import("@nestjs/common").Type<Partial<CreateCategoryDto>>;
export declare class UpdateCategoryDto extends UpdateCategoryDto_base {
}
export declare class CreateCategoryAttributeDto {
    name: string;
    key: string;
    type: AttributeType;
    description?: string;
    required?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    comparable?: boolean;
    options?: unknown;
    unit?: string;
    sortOrder?: number;
}
export {};
