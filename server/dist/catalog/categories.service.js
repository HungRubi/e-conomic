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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const slug_1 = require("../common/slug");
const categoryInclude = {
    parent: true,
    children: true,
    attributes: true,
    products: true,
};
let CategoriesService = class CategoriesService {
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
        if (query.level !== undefined && query.level !== 'all')
            where.level = Number(query.level);
        if (query.q) {
            where.OR = [
                { name: { contains: query.q, mode: 'insensitive' } },
                { slug: { contains: query.q, mode: 'insensitive' } },
                { description: { contains: query.q, mode: 'insensitive' } },
            ];
        }
        const orderBy = { [query.sortBy ?? 'sortOrder']: query.sortOrder ?? 'asc' };
        const [data, total] = await Promise.all([
            this.prisma.productCategory.findMany({ where, skip: page * pageSize, take: pageSize, orderBy, include: categoryInclude }),
            this.prisma.productCategory.count({ where }),
        ]);
        return { data, items: data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
    }
    async all(query = {}) {
        return (await this.list({ ...query, page: 0, pageSize: 1000 })).data;
    }
    async tree() {
        const rows = await this.prisma.productCategory.findMany({ where: { deletedAt: null }, orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }], include: categoryInclude });
        return rows;
    }
    async get(id) {
        const row = await this.prisma.productCategory.findUnique({ where: { id }, include: categoryInclude });
        if (!row || row.deletedAt)
            throw new common_1.NotFoundException('Category not found');
        return row;
    }
    async create(dto) {
        const slug = dto.slug?.trim() || (0, slug_1.slugify)(dto.name);
        await this.ensureUniqueSlug(slug);
        const parent = dto.parentId ? await this.getParent(dto.parentId) : null;
        if (parent && parent.level >= 2)
            throw new common_1.BadRequestException('Category supports max 3 levels');
        const level = parent ? parent.level + 1 : 0;
        const pathIds = parent ? [...parent.pathIds, parent.id] : [];
        const path = parent ? `${parent.path ?? `/${parent.slug}`}/${slug}` : `/${slug}`;
        const data = {
            ...dto,
            slug,
            parentId: dto.parentId || null,
            level,
            path,
            pathIds,
            metadata: dto.metadata,
            filters: dto.filters,
        };
        return this.prisma.productCategory.create({ data, include: categoryInclude });
    }
    async update(id, dto) {
        await this.get(id);
        const data = { ...dto };
        if (dto.slug)
            data.slug = (0, slug_1.slugify)(dto.slug);
        return this.prisma.productCategory.update({ where: { id }, data, include: categoryInclude });
    }
    async publish(id) {
        await this.get(id);
        return this.prisma.productCategory.update({ where: { id }, data: { status: client_1.CategoryStatus.ACTIVE }, include: categoryInclude });
    }
    async archive(id) {
        await this.get(id);
        return this.prisma.productCategory.update({ where: { id }, data: { status: client_1.CategoryStatus.ARCHIVED }, include: categoryInclude });
    }
    async remove(id) {
        const row = await this.prisma.productCategory.findUnique({ where: { id }, include: { children: true, products: true } });
        if (!row || row.deletedAt)
            throw new common_1.NotFoundException('Category not found');
        return this.prisma.productCategory.update({ where: { id }, data: { status: client_1.CategoryStatus.ARCHIVED, deletedAt: new Date() } });
    }
    async createAttribute(categoryId, dto) {
        await this.get(categoryId);
        const data = {
            ...dto,
            categoryId,
            options: dto.options,
        };
        return this.prisma.categoryAttribute.create({ data });
    }
    async getParent(id) {
        const parent = await this.prisma.productCategory.findUnique({ where: { id } });
        if (!parent || parent.deletedAt)
            throw new common_1.BadRequestException('Parent category not found');
        return parent;
    }
    async ensureUniqueSlug(slug) {
        const existing = await this.prisma.productCategory.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.BadRequestException('Category slug already exists');
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map