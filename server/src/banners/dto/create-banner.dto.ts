import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BannerType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBannerDto {
  @ApiProperty({ description: 'URL của ảnh banner' })
  @IsString()
  imageUrl!: string;

  @ApiPropertyOptional({ description: 'Link khi click vào banner' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Alt text cho SEO' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiProperty({ enum: BannerType, default: 'BANNER' })
  @IsEnum(BannerType)
  type!: BannerType;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
