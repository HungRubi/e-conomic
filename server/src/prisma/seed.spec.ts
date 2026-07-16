import { PrismaClient } from '@prisma/client';

// Seed validation: runs against the database to verify seed data integrity.
// Prereq: seed has been run (npx prisma db seed).

describe('Seed Data Validation', () => {
  const prisma = new PrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Categories ──

  it('should have 58 categories total', async () => {
    const count = await prisma.productCategory.count();
    expect(count).toBe(58);
  });

  it('should have 12 root (level-0) categories', async () => {
    const count = await prisma.productCategory.count({ where: { level: 0 } });
    expect(count).toBe(12);
  });

  it('should have 41 level-1 categories', async () => {
    const count = await prisma.productCategory.count({ where: { level: 1 } });
    expect(count).toBe(41);
  });

  it('should have 5 level-2 categories', async () => {
    const count = await prisma.productCategory.count({ where: { level: 2 } });
    expect(count).toBe(5);
  });

  it('each root category should have showInMenu = true and showInHomepage = true', async () => {
    const roots = await prisma.productCategory.findMany({
      where: { level: 0 },
      select: { name: true, showInMenu: true, showInHomepage: true },
    });
    for (const r of roots) {
      expect(r.showInMenu).toBe(true);
      expect(r.showInHomepage).toBe(true);
    }
  });

  it('all categories should have Unsplash image URLs', async () => {
    const count = await prisma.productCategory.count({
      where: { image: { startsWith: 'https://images.unsplash.com/' } },
    });
    expect(count).toBe(58);
  });

  it('no category should have status DRAFT or ARCHIVED', async () => {
    const bad = await prisma.productCategory.count({
      where: { status: { in: ['DRAFT', 'ARCHIVED'] } },
    });
    expect(bad).toBe(0);
  });

  it('should have unique slugs across all categories', async () => {
    const slugs = await prisma.productCategory.findMany({ select: { slug: true } });
    const unique = new Set(slugs.map((s) => s.slug));
    expect(unique.size).toBe(slugs.length);
  });

  // ── Products ──

  it('should have 80 products', async () => {
    const count = await prisma.product.count();
    expect(count).toBe(80);
  });

  it('should have at least 10 featured products', async () => {
    const count = await prisma.product.count({ where: { isFeatured: true } });
    expect(count).toBeGreaterThanOrEqual(10);
  });

  it('all products should have Unsplash thumbnail URLs', async () => {
    const count = await prisma.product.count({
      where: { thumbnailSmall: { startsWith: 'https://images.unsplash.com/' } },
    });
    expect(count).toBe(80);
  });

  it('all products should have correct URL format (?w=… not &w=…)', async () => {
    const bad = await prisma.product.findMany({
      where: { thumbnailSmall: { contains: '&w=' } },
      select: { name: true },
    });
    expect(bad).toHaveLength(0);
  });

  it('all products should have unique slugs', async () => {
    const slugs = await prisma.product.findMany({ select: { slug: true } });
    const unique = new Set(slugs.map((s) => s.slug));
    expect(unique.size).toBe(slugs.length);
  });

  it('all products should have unique SKUs', async () => {
    const skus = await prisma.product.findMany({
      where: { sku: { not: null } },
      select: { sku: true },
    });
    const unique = new Set(skus.map((s) => s.sku));
    expect(unique.size).toBe(skus.length);
  });

  it('all products should be ACTIVE and SIMPLE type', async () => {
    const bad = await prisma.product.count({
      where: { OR: [{ status: { not: 'ACTIVE' } }, { type: { not: 'SIMPLE' } }] },
    });
    expect(bad).toBe(0);
  });

  it('all products should have at least one category mapping', async () => {
    const count = await prisma.productCategoryMap.count();
    expect(count).toBe(80);
  });

  it('each product should have price > 0', async () => {
    const bad = await prisma.product.findMany({
      where: { price: { lte: 0 } },
      select: { name: true },
    });
    expect(bad).toHaveLength(0);
  });

  it('should have products with compareAtPrice (sale)', async () => {
    const count = await prisma.product.count({
      where: { compareAtPrice: { not: null } },
    });
    expect(count).toBeGreaterThanOrEqual(15);
  });

  it('should have products priced over 10M (high-value)', async () => {
    const count = await prisma.product.count({
      where: { price: { gte: 10_000_000 } },
    });
    expect(count).toBeGreaterThanOrEqual(6);
  });

  // ── Category-Product mapping ──

  it('every category should have at least one product', async () => {
    const catsWithProducts = await prisma.productCategory.count({
      where: { products: { some: {} } },
    });
    expect(catsWithProducts).toBeGreaterThanOrEqual(20);
  });

  it('all root categories should have products via their children', async () => {
    const rootsWithProducts = await prisma.productCategory.count({
      where: {
        level: 0,
        children: { some: { products: { some: {} } } },
      },
    });
    expect(rootsWithProducts).toBe(12);
  });
});
