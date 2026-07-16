import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/slug';
import {
  CreateCategoryAttributeDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

const categoryInclude = {
  parent: true,
  children: true,
  attributes: true,
  products: true,
} satisfies Prisma.ProductCategoryInclude;

@Injectable()
export class CategoriesService {
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
    const where: Prisma.ProductCategoryWhereInput = { deletedAt: null };
    if (query.status && query.status !== 'all') where.status = query.status;
    if (query.level !== undefined && query.level !== 'all')
      where.level = Number(query.level);
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    const orderBy = {
      [query.sortBy ?? 'sortOrder']: query.sortOrder ?? 'asc',
    } as any;
    const [data, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy,
        include: categoryInclude,
      }),
      this.prisma.productCategory.count({ where }),
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

  async all(query: any = {}) {
    return (await this.list({ ...query, page: 0, pageSize: 1000 })).data;
  }

  async tree() {
    const rows = await this.prisma.productCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      include: categoryInclude,
    });
    return rows;
  }

  async get(id: string) {
    const row = await this.prisma.productCategory.findUnique({
      where: { id },
      include: categoryInclude,
    });
    if (!row || row.deletedAt)
      throw new NotFoundException('Category not found');
    return row;
  }

  async getBySlug(slug: string) {
    const row = await this.prisma.productCategory.findFirst({
      where: { slug, deletedAt: null },
      include: categoryInclude,
    });
    if (!row)
      throw new NotFoundException('Category not found');
    return row;
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug?.trim() || slugify(dto.name);
    await this.ensureUniqueSlug(slug);
    const parent = dto.parentId ? await this.getParent(dto.parentId) : null;
    if (parent && parent.level >= 2)
      throw new BadRequestException('Category supports max 3 levels');
    const level = parent ? parent.level + 1 : 0;
    const pathIds = parent ? [...parent.pathIds, parent.id] : [];
    const path = parent
      ? `${parent.path ?? `/${parent.slug}`}/${slug}`
      : `/${slug}`;
    const data: Prisma.ProductCategoryUncheckedCreateInput = {
      ...dto,
      slug,
      parentId: dto.parentId || null,
      level,
      path,
      pathIds,
      metadata: dto.metadata as Prisma.InputJsonValue | undefined,
      filters: dto.filters as Prisma.InputJsonValue | undefined,
    };
    return this.prisma.productCategory.create({
      data,
      include: categoryInclude,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.get(id);
    const data: any = { ...dto };
    if (dto.slug) data.slug = slugify(dto.slug);
    return this.prisma.productCategory.update({
      where: { id },
      data,
      include: categoryInclude,
    });
  }

  async publish(id: string) {
    await this.get(id);
    return this.prisma.productCategory.update({
      where: { id },
      data: { status: CategoryStatus.ACTIVE },
      include: categoryInclude,
    });
  }

  async archive(id: string) {
    await this.get(id);
    return this.prisma.productCategory.update({
      where: { id },
      data: { status: CategoryStatus.ARCHIVED },
      include: categoryInclude,
    });
  }

  async remove(id: string) {
    const row = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { children: true, products: true },
    });
    if (!row || row.deletedAt)
      throw new NotFoundException('Category not found');
    return this.prisma.productCategory.update({
      where: { id },
      data: { status: CategoryStatus.ARCHIVED, deletedAt: new Date() },
    });
  }

  async createAttribute(categoryId: string, dto: CreateCategoryAttributeDto) {
    await this.get(categoryId);
    const data: Prisma.CategoryAttributeUncheckedCreateInput = {
      ...dto,
      categoryId,
      options: dto.options as Prisma.InputJsonValue | undefined,
    };
    return this.prisma.categoryAttribute.create({ data });
  }

  private async getParent(id: string) {
    const parent = await this.prisma.productCategory.findUnique({
      where: { id },
    });
    if (!parent || parent.deletedAt)
      throw new BadRequestException('Parent category not found');
    return parent;
  }

  private async ensureUniqueSlug(slug: string) {
    const existing = await this.prisma.productCategory.findUnique({
      where: { slug },
    });
    if (existing) throw new BadRequestException('Category slug already exists');
  }
}
