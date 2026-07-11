import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      productCategory: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      categoryAttribute: { create: jest.fn() },
    };
    service = new CategoriesService(prisma);
  });

  it('creates a root category with generated slug, level, path and pathIds', async () => {
    prisma.productCategory.findUnique.mockResolvedValue(null);
    prisma.productCategory.create.mockResolvedValue({
      id: 'cat-1',
      name: 'Đá Phong Thủy',
      slug: 'da-phong-thuy',
      level: 0,
      path: '/da-phong-thuy',
      pathIds: [],
    });

    const result = await service.create({ name: 'Đá Phong Thủy' } as any);

    expect(prisma.productCategory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'da-phong-thuy',
          level: 0,
          path: '/da-phong-thuy',
          pathIds: [],
        }),
        include: expect.any(Object),
      }),
    );
    expect(result.slug).toBe('da-phong-thuy');
  });

  it('creates a child category with parent-derived level and pathIds', async () => {
    prisma.productCategory.findUnique.mockImplementation(({ where }: any) => {
      if (where.id === 'parent-1')
        return Promise.resolve({
          id: 'parent-1',
          slug: 'vong-tay',
          level: 1,
          pathIds: ['root-1'],
        });
      return Promise.resolve(null);
    });
    prisma.productCategory.create.mockResolvedValue({
      id: 'cat-2',
      parentId: 'parent-1',
      level: 2,
      pathIds: ['root-1', 'parent-1'],
    });

    await service.create({ name: 'Đá Moonstone', parentId: 'parent-1' } as any);

    expect(prisma.productCategory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentId: 'parent-1',
          level: 2,
          path: '/vong-tay/da-moonstone',
          pathIds: ['root-1', 'parent-1'],
        }),
      }),
    );
  });

  it('rejects a category deeper than 3 levels', async () => {
    prisma.productCategory.findUnique.mockResolvedValue({
      id: 'parent-2',
      slug: 'level-2',
      level: 2,
      pathIds: ['a', 'b'],
    });

    await expect(
      service.create({ name: 'Too Deep', parentId: 'parent-2' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists categories with pagination and status filter', async () => {
    prisma.productCategory.findMany.mockResolvedValue([{ id: 'cat-1' }]);
    prisma.productCategory.count.mockResolvedValue(1);

    const result = await service.list({
      page: 2,
      pageSize: 10,
      status: 'ACTIVE',
      q: 'stone',
    } as any);

    expect(prisma.productCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
        where: expect.objectContaining({
          status: 'ACTIVE',
          deletedAt: null,
          OR: expect.any(Array),
        }),
      }),
    );
    expect(result).toEqual({
      data: [{ id: 'cat-1' }],
      items: [{ id: 'cat-1' }],
      total: 1,
      page: 2,
      pageSize: 10,
      totalPages: 1,
    });
  });

  it('archives instead of hard-deleting when category has products or children', async () => {
    prisma.productCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      children: [{ id: 'child' }],
      products: [],
    });
    prisma.productCategory.update.mockResolvedValue({
      id: 'cat-1',
      status: 'ARCHIVED',
    });

    const result = await service.remove('cat-1');

    expect(prisma.productCategory.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: expect.objectContaining({
        status: 'ARCHIVED',
        deletedAt: expect.any(Date),
      }),
    });
    expect(result.status).toBe('ARCHIVED');
  });

  it('throws NotFoundException for missing category detail', async () => {
    prisma.productCategory.findUnique.mockResolvedValue(null);
    await expect(service.get('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
