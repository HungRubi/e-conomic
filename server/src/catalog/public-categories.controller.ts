import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@Query() query: any) {
    return this.categories.all({ ...query, status: 'ACTIVE' });
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categories.getBySlug(slug);
  }
}
