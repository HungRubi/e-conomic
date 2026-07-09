import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryAttributeDto, CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Admin Product Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/product-categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  list(@Query() query: any) {
    return this.categories.list(query);
  }

  @Get('all')
  all(@Query() query: any) {
    return this.categories.all(query);
  }

  @Get('tree')
  tree() {
    return this.categories.tree();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.categories.get(id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }

  @Post(':id/attributes')
  createAttribute(@Param('id') id: string, @Body() dto: CreateCategoryAttributeDto) {
    return this.categories.createAttribute(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.categories.publish(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.categories.archive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categories.remove(id);
  }
}
