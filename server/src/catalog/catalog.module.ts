import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PublicProductsController } from './public-products.controller';
import { PublicCategoriesController } from './public-categories.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    CategoriesController,
    ProductsController,
    PublicProductsController,
    PublicCategoriesController,
  ],
  providers: [CategoriesService, ProductsService],
})
export class CatalogModule {}
