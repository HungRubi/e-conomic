import { PartialType } from '@nestjs/swagger';
import { ProductStatus, ProductType } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() name!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() sku?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsEnum(ProductType) type?: ProductType;
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
  @IsNumber() @Min(0) price!: number;
  @IsOptional() @IsNumber() @Min(0) compareAtPrice?: number;
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @IsOptional() @IsString() thumbnailSmall?: string;
  @IsOptional() @IsString() thumbnailLarge?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) images?: string[];
  @IsOptional() @IsInt() @Min(0) stockQuantity?: number;
  @IsOptional() @IsBoolean() trackStock?: boolean;
  @IsOptional() @IsBoolean() allowBackorder?: boolean;
  @IsOptional() @IsNumber() @Min(0) weight?: number;
  @IsOptional() @IsNumber() @Min(0) width?: number;
  @IsOptional() @IsNumber() @Min(0) height?: number;
  @IsOptional() @IsNumber() @Min(0) length?: number;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) seoKeywords?: string[];
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() attributes?: unknown;
  @IsOptional() metadata?: unknown;
  @IsOptional() @IsArray() @IsString({ each: true }) categoryIds?: string[];
  @IsOptional() @IsString() primaryCategoryId?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
