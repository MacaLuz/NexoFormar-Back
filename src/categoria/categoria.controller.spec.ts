import { Test } from '@nestjs/testing';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';

describe('CategoriaController', () => {
  let controller: CategoriaController;

  const categoriaServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CategoriaController],
      providers: [
        { provide: CategoriaService, useValue: categoriaServiceMock },
      ],
    }).compile();

    controller = moduleRef.get(CategoriaController);
    jest.clearAllMocks();
  });

  it('create -> llama categoriaService.create', async () => {
    categoriaServiceMock.create.mockResolvedValue({ id: 1, nombre: 'A' });

    const dto: any = { nombre: 'A' };
    const res = await controller.create(dto);

    expect(categoriaServiceMock.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 1, nombre: 'A' });
  });

  it('findAll -> llama categoriaService.findAll', async () => {
    categoriaServiceMock.findAll.mockResolvedValue([]);

    const res = await controller.findAll();

    expect(categoriaServiceMock.findAll).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('findOne -> llama categoriaService.findOne', async () => {
    categoriaServiceMock.findOne.mockResolvedValue({ id: 1 });

    const res = await controller.findOne(1);

    expect(categoriaServiceMock.findOne).toHaveBeenCalledWith(1);
    expect(res).toEqual({ id: 1 });
  });

  it('update -> llama categoriaService.update', async () => {
    categoriaServiceMock.update.mockResolvedValue({ id: 1, nombre: 'B' });

    const dto: any = { nombre: 'B' };
    const res = await controller.update(1, dto);

    expect(categoriaServiceMock.update).toHaveBeenCalledWith(1, dto);
    expect(res).toEqual({ id: 1, nombre: 'B' });
  });

  it('remove -> llama categoriaService.remove', async () => {
    categoriaServiceMock.remove.mockResolvedValue({ id: 1 });

    const res = await controller.remove(1);

    expect(categoriaServiceMock.remove).toHaveBeenCalledWith(1);
    expect(res).toEqual({ id: 1 });
  });
});
