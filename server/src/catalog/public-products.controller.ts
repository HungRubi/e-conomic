import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class PublicProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: any) {
    return this.products.list({ ...query, status: 'ACTIVE' });
  }

  @Get('featured')
  featured() {
    return this.products.list({
      isFeatured: true,
      status: 'ACTIVE',
      pageSize: 8,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  @Get('new-arrivals')
  newArrivals() {
    return this.products.list({
      status: 'ACTIVE',
      pageSize: 8,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  @Get('best-selling')
  bestSelling() {
    return this.products.list({
      status: 'ACTIVE',
      pageSize: 8,
      sortBy: 'soldCount',
      sortOrder: 'desc',
    });
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.products.getBySlug(slug, { status: 'ACTIVE' });
  }
}
