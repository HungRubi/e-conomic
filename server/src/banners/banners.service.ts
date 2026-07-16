import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './dto';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { type?: string } = {}) {
    const where: Prisma.BannerWhereInput = {};
    if (query.type) where.type = query.type as any;
    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async listPublic(type?: string) {
    const where: Prisma.BannerWhereInput = { active: true };
    if (type) where.type = type as any;
    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getById(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async create(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async update(id: string, dto: UpdateBannerDto) {
    await this.getById(id);
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.getById(id);
    return this.prisma.banner.delete({ where: { id } });
  }
}
