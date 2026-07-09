import { ProductStatus, ProductType } from '@prisma/client';
export declare class CreateProductDto {
    name: string;
    slug?: string;
    sku?: string;
    description?: string;
    shortDescription?: string;
    type?: ProductType;
    status?: ProductStatus;
    price: number;
    compareAtPrice?: number;
    costPrice?: number;
    thumbnailSmall?: string;
    thumbnailLarge?: string;
    images?: string[];
    stockQuantity?: number;
    trackStock?: boolean;
    allowBackorder?: boolean;
    weight?: number;
    width?: number;
    height?: number;
    length?: number;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    isFeatured?: boolean;
    sortOrder?: number;
    attributes?: unknown;
    metadata?: unknown;
    categoryIds?: string[];
    primaryCategoryId?: string;
}
declare const UpdateProductDto_base: import("@nestjs/common").Type<Partial<CreateProductDto>>;
export declare class UpdateProductDto extends UpdateProductDto_base {
}
export {};
