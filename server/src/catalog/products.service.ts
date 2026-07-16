import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

const productInclude = {
  categories: { include: { category: true } },
  variants: true,
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: any = {}) {
    const pageSize = Math.min(
      100,
      Math.max(1, Number(query.pageSize ?? query.limit ?? 20)),
    );
    const page =
      query.offset !== undefined
        ? Math.floor(Math.max(0, Number(query.offset)) / pageSize)
        : Math.max(0, Number(query.page ?? 0));
    const where: Prisma.ProductWhereInput = { deletedAt: null };
    if (query.status && query.status !== 'all') where.status = query.status;
    if (query.type && query.type !== 'all') where.type = query.type;
    if (query.categoryId)
      where.categories = { some: { categoryId: query.categoryId } };
    if (query.categorySlug)
      where.categories = { some: { category: { slug: query.categorySlug } } };
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
        { sku: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    const orderBy = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    } as any;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy,
        include: productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);
    return {
      data,
      items: data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async get(id: string) {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!row || row.deletedAt) throw new NotFoundException('Product not found');
    return row;
  }

  async getBySlug(slug: string, extraWhere?: Prisma.ProductWhereInput) {
    const row = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, ...extraWhere },
      include: productInclude,
    });
    if (!row) throw new NotFoundException('Product not found');
    return row;
  }

  async create(dto: CreateProductDto) {
    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueSlug(slug);
    const categoryIds = this.unique(dto.categoryIds ?? []);
    await this.ensureCategoriesExist(categoryIds);
    const primaryCategoryId =
      dto.primaryCategoryId && categoryIds.includes(dto.primaryCategoryId)
        ? dto.primaryCategoryId
        : categoryIds[0];
    const {
      categoryIds: _categoryIds,
      primaryCategoryId: _primaryCategoryId,
      ...rawData
    } = dto;
    const data: Prisma.ProductCreateInput = {
      ...rawData,
      slug,
      attributes: rawData.attributes as Prisma.InputJsonValue | undefined,
      metadata: rawData.metadata as Prisma.InputJsonValue | undefined,
      categories: categoryIds.length
        ? {
            create: categoryIds.map((categoryId, index) => ({
              categoryId,
              isPrimary: categoryId === primaryCategoryId,
              sortOrder: index,
            })),
          }
        : undefined,
    };
    return this.prisma.product.create({ data, include: productInclude });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.get(id);
    const categoryIds = dto.categoryIds ? this.unique(dto.categoryIds) : null;
    if (categoryIds) await this.ensureCategoriesExist(categoryIds);
    const { categoryIds: _categoryIds, primaryCategoryId, ...rawData } = dto;
    const data: any = { ...rawData };
    if (dto.slug) data.slug = slugify(dto.slug);
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data,
        include: productInclude,
      });
      if (categoryIds) {
        const primary =
          primaryCategoryId && categoryIds.includes(primaryCategoryId)
            ? primaryCategoryId
            : categoryIds[0];
        await tx.productCategoryMap.deleteMany({ where: { productId: id } });
        if (categoryIds.length) {
          await tx.productCategoryMap.createMany({
            data: categoryIds.map((categoryId, index) => ({
              productId: id,
              categoryId,
              isPrimary: categoryId === primary,
              sortOrder: index,
            })),
          });
        }
      }
      return product;
    });
  }

  async publish(id: string) {
    await this.get(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: productInclude,
    });
  }

  async archive(id: string) {
    await this.get(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: productInclude,
    });
  }

  async remove(id: string) {
    await this.get(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED', deletedAt: new Date() },
      include: productInclude,
    });
  }

  private unique(values: string[]) {
    return [...new Set(values.filter(Boolean))];
  }

  private async ensureUniqueSlug(slug: string) {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException('Product slug already exists');
  }

  private async ensureCategoriesExist(categoryIds: string[]) {
    if (!categoryIds.length) return;
    const found = await this.prisma.productCategory.findMany({
      where: { id: { in: categoryIds }, deletedAt: null },
      select: { id: true },
    });
    if (found.length !== categoryIds.length)
      throw new BadRequestException('One or more categories do not exist');
  }
}
