"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_1 = require("../common/slug");
const productInclude = {
    categories: { include: { category: true } },
    variants: true,
};
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query = {}) {
        const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? query.limit ?? 20)));
        const page = query.offset !== undefined ? Math.floor(Math.max(0, Number(query.offset)) / pageSize) : Math.max(0, Number(query.page ?? 0));
        const where = { deletedAt: null };
        if (query.status && query.status !== 'all')
            where.status = query.status;
        if (query.type && query.type !== 'all')
            where.type = query.type;
        if (query.categoryId)
            where.categories = { some: { categoryId: query.categoryId } };
        if (query.q) {
            where.OR = [
                { name: { contains: query.q, mode: 'insensitive' } },
                { slug: { contains: query.q, mode: 'insensitive' } },
                { sku: { contains: query.q, mode: 'insensitive' } },
                { description: { contains: query.q, mode: 'insensitive' } },
            ];
        }
        const orderBy = { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' };
        const [data, total] = await Promise.all([
            this.prisma.product.findMany({ where, skip: page * pageSize, take: pageSize, orderBy, include: productInclude }),
            this.prisma.product.count({ where }),
        ]);
        return { data, items: data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
    }
    async get(id) {
        const row = await this.prisma.product.findUnique({ where: { id }, include: productInclude });
        if (!row || row.deletedAt)
            throw new common_1.NotFoundException('Product not found');
        return row;
    }
    async create(dto) {
        const slug = dto.slug?.trim() || (0, slug_1.slugify)(dto.name);
        await this.ensureUniqueSlug(slug);
        const categoryIds = this.unique(dto.categoryIds ?? []);
        await this.ensureCategoriesExist(categoryIds);
        const primaryCategoryId = dto.primaryCategoryId && categoryIds.includes(dto.primaryCategoryId) ? dto.primaryCategoryId : categoryIds[0];
        const { categoryIds: _categoryIds, primaryCategoryId: _primaryCategoryId, ...rawData } = dto;
        const data = {
            ...rawData,
            slug,
            attributes: rawData.attributes,
            metadata: rawData.metadata,
            categories: categoryIds.length
                ? { create: categoryIds.map((categoryId, index) => ({ categoryId, isPrimary: categoryId === primaryCategoryId, sortOrder: index })) }
                : undefined,
        };
        return this.prisma.product.create({ data, include: productInclude });
    }
    async update(id, dto) {
        await this.get(id);
        const categoryIds = dto.categoryIds ? this.unique(dto.categoryIds) : null;
        if (categoryIds)
            await this.ensureCategoriesExist(categoryIds);
        const { categoryIds: _categoryIds, primaryCategoryId, ...rawData } = dto;
        const data = { ...rawData };
        if (dto.slug)
            data.slug = (0, slug_1.slugify)(dto.slug);
        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.update({ where: { id }, data, include: productInclude });
            if (categoryIds) {
                const primary = primaryCategoryId && categoryIds.includes(primaryCategoryId) ? primaryCategoryId : categoryIds[0];
                await tx.productCategoryMap.deleteMany({ where: { productId: id } });
                if (categoryIds.length) {
                    await tx.productCategoryMap.createMany({
                        data: categoryIds.map((categoryId, index) => ({ productId: id, categoryId, isPrimary: categoryId === primary, sortOrder: index })),
                    });
                }
            }
            return product;
        });
    }
    async publish(id) {
        await this.get(id);
        return this.prisma.product.update({ where: { id }, data: { status: 'ACTIVE' }, include: productInclude });
    }
    async archive(id) {
        await this.get(id);
        return this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVED' }, include: productInclude });
    }
    async remove(id) {
        await this.get(id);
        return this.prisma.product.update({ where: { id }, data: { status: 'ARCHIVED', deletedAt: new Date() }, include: productInclude });
    }
    unique(values) {
        return [...new Set(values.filter(Boolean))];
    }
    async ensureUniqueSlug(slug) {
        const existing = await this.prisma.product.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.BadRequestException('Product slug already exists');
    }
    async ensureCategoriesExist(categoryIds) {
        if (!categoryIds.length)
            return;
        const found = await this.prisma.productCategory.findMany({ where: { id: { in: categoryIds }, deletedAt: null }, select: { id: true } });
        if (found.length !== categoryIds.length)
            throw new common_1.BadRequestException('One or more categories do not exist');
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map