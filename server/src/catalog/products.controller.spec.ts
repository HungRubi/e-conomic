import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  const service = { list: jest.fn(), get: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({ controllers: [ProductsController], providers: [{ provide: ProductsService, useValue: service }] }).compile();
    controller = module.get(ProductsController);
  });

  it('lists products through service', async () => {
    service.list.mockResolvedValue({ data: [], total: 0 });
    await expect(controller.list({ categoryId: 'cat-1' })).resolves.toEqual({ data: [], total: 0 });
    expect(service.list).toHaveBeenCalledWith({ categoryId: 'cat-1' });
  });

  it('creates product with thumbnails through service', async () => {
    service.create.mockResolvedValue({ id: 'prod-1', thumbnailSmall: '/s.jpg', thumbnailLarge: '/l.jpg' });
    const dto = { name: 'Vòng', price: 1000, thumbnailSmall: '/s.jpg', thumbnailLarge: '/l.jpg' } as any;
    await expect(controller.create(dto)).resolves.toEqual({ id: 'prod-1', thumbnailSmall: '/s.jpg', thumbnailLarge: '/l.jpg' });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('deletes product through service', async () => {
    service.remove.mockResolvedValue({ id: 'prod-1', status: 'ARCHIVED' });
    await expect(controller.remove('prod-1')).resolves.toEqual({ id: 'prod-1', status: 'ARCHIVED' });
    expect(service.remove).toHaveBeenCalledWith('prod-1');
  });
});
