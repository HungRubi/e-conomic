import { Test } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  const service = {
    list: jest.fn(), all: jest.fn(), tree: jest.fn(), get: jest.fn(), create: jest.fn(), update: jest.fn(), publish: jest.fn(), archive: jest.fn(), remove: jest.fn(), createAttribute: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({ controllers: [CategoriesController], providers: [{ provide: CategoriesService, useValue: service }] }).compile();
    controller = module.get(CategoriesController);
  });

  it('lists categories through service', async () => {
    service.list.mockResolvedValue({ data: [], total: 0 });
    await expect(controller.list({ status: 'ACTIVE' })).resolves.toEqual({ data: [], total: 0 });
    expect(service.list).toHaveBeenCalledWith({ status: 'ACTIVE' });
  });

  it('creates category through service', async () => {
    service.create.mockResolvedValue({ id: 'cat-1' });
    await expect(controller.create({ name: 'Đá' } as any)).resolves.toEqual({ id: 'cat-1' });
    expect(service.create).toHaveBeenCalledWith({ name: 'Đá' });
  });

  it('archives category through service', async () => {
    service.archive.mockResolvedValue({ id: 'cat-1', status: 'ARCHIVED' });
    await expect(controller.archive('cat-1')).resolves.toEqual({ id: 'cat-1', status: 'ARCHIVED' });
    expect(service.archive).toHaveBeenCalledWith('cat-1');
  });
});
