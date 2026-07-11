import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      productCategory: { findMany: jest.fn() },
      productCategoryMap: { deleteMany: jest.fn(), createMany: jest.fn() },
      $transaction: jest.fn(async (fn: any) => fn(prisma)),
    };
    service = new ProductsService(prisma);
  });

  it('creates product with slug, thumbnails, and primary category mapping', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    prisma.productCategory.findMany.mockResolvedValue([
      { id: 'cat-1' },
      { id: 'cat-2' },
    ]);
    prisma.product.create.mockResolvedValue({
      id: 'prod-1',
      slug: 'vong-da',
      thumbnailSmall: '/s.jpg',
      thumbnailLarge: '/l.jpg',
    });

    const result = await service.create({
      name: 'Vòng Đá',
      price: 100000,
      thumbnailSmall: '/s.jpg',
      thumbnailLarge: '/l.jpg',
      categoryIds: ['cat-1', 'cat-2'],
      primaryCategoryId: 'cat-2',
    } as any);

    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'vong-da',
          thumbnailSmall: '/s.jpg',
          thumbnailLarge: '/l.jpg',
          categories: {
            create: [
              { categoryId: 'cat-1', isPrimary: false, sortOrder: 0 },
              { categoryId: 'cat-2', isPrimary: true, sortOrder: 1 },
            ],
          },
        }),
        include: expect.any(Object),
      }),
    );
    expect(result.id).toBe('prod-1');
  });

  it('rejects product category ids that do not exist', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    prisma.productCategory.findMany.mockResolvedValue([{ id: 'cat-1' }]);

    await expect(
      service.create({
        name: 'Vòng Đá',
        price: 100000,
        categoryIds: ['cat-1', 'cat-missing'],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists products with category and search filters', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 'prod-1' }]);
    prisma.product.count.mockResolvedValue(1);

    const result = await service.list({
      page: 1,
      pageSize: 20,
      q: 'vong',
      categoryId: 'cat-1',
      status: 'ACTIVE',
    } as any);

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 20,
        where: expect.objectContaining({
          status: 'ACTIVE',
          deletedAt: null,
          categories: { some: { categoryId: 'cat-1' } },
          OR: expect.any(Array),
        }),
      }),
    );
    expect(result).toEqual({
      data: [{ id: 'prod-1' }],
      items: [{ id: 'prod-1' }],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    });
  });

  it('updates product categories in a transaction', async () => {
    prisma.product.findUnique.mockResolvedValue({ id: 'prod-1' });
    prisma.productCategory.findMany.mockResolvedValue([{ id: 'cat-1' }]);
    prisma.product.update.mockResolvedValue({ id: 'prod-1', name: 'Updated' });

    await service.update('prod-1', {
      name: 'Updated',
      categoryIds: ['cat-1'],
      primaryCategoryId: 'cat-1',
    } as any);

    expect(prisma.productCategoryMap.deleteMany).toHaveBeenCalledWith({
      where: { productId: 'prod-1' },
    });
    expect(prisma.productCategoryMap.createMany).toHaveBeenCalledWith({
      data: [
        {
          productId: 'prod-1',
          categoryId: 'cat-1',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
    });
  });

  it('throws NotFoundException for missing product detail', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
