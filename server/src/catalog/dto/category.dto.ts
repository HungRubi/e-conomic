import { PartialType } from '@nestjs/swagger';
import {
  CategoryDisplayType,
  CategoryStatus,
  AttributeType,
} from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString() name!: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() parentId?: string | null;
  @IsOptional() @IsEnum(CategoryStatus) status?: CategoryStatus;
  @IsOptional() @IsEnum(CategoryDisplayType) displayType?: CategoryDisplayType;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @IsOptional() @IsString() seoTitle?: string;
  @IsOptional() @IsString() seoDescription?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) seoKeywords?: string[];
  @IsOptional() @IsString() canonicalUrl?: string;
  @IsOptional() @IsBoolean() showInMenu?: boolean;
  @IsOptional() @IsBoolean() showInHomepage?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;
  @IsOptional() metadata?: unknown;
  @IsOptional() filters?: unknown;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CreateCategoryAttributeDto {
  @IsString() name!: string;
  @IsString() key!: string;
  @IsEnum(AttributeType) type!: AttributeType;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @IsBoolean() filterable?: boolean;
  @IsOptional() @IsBoolean() searchable?: boolean;
  @IsOptional() @IsBoolean() comparable?: boolean;
  @IsOptional() options?: unknown;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
