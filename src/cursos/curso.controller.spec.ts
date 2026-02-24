import { Test } from '@nestjs/testing';
import { CursosController } from './curso.controller';
import { CursosService } from './curso.service';

describe('CursosController', () => {
  let controller: CursosController;

  const cursosServiceMock = {
    create: jest.fn(),
    buscarPorUsuario: jest.fn(),
    buscarPersonalizadoPaginado: jest.fn(),
    buscarPorCategoria: jest.fn(),
    findAllPaginado: jest.fn(),
    findOne: jest.fn(),
    updateSiAutorizado: jest.fn(),
    removeSiAutorizado: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CursosController],
      providers: [{ provide: CursosService, useValue: cursosServiceMock }],
    }).compile();

    controller = moduleRef.get(CursosController);
    jest.clearAllMocks();
  });

  it('create -> llama cursosService.create con dto y req.user.id', async () => {
    cursosServiceMock.create.mockResolvedValue({ id: 1 });

    const dto: any = { titulo: 'A' };
    const req: any = { user: { id: 10, rol: 'NORMAL', correo: 'a@a.com' } };

    const res = await controller.create(dto, req);

    expect(cursosServiceMock.create).toHaveBeenCalledWith(dto, 10);
    expect(res).toEqual({ id: 1 });
  });

  it('misCursos -> llama buscarPorUsuario con req.user.id', async () => {
    cursosServiceMock.buscarPorUsuario.mockResolvedValue([{ id: 1 }]);

    const req: any = { user: { id: 10 } };

    const res = await controller.misCursos(req);

    expect(cursosServiceMock.buscarPorUsuario).toHaveBeenCalledWith(10);
    expect(res).toEqual([{ id: 1 }]);
  });

  it('buscar -> arma filtros + paginación y llama buscarPersonalizadoPaginado', async () => {
    cursosServiceMock.buscarPersonalizadoPaginado.mockResolvedValue({
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });

    const res = await controller.buscar('1', 'Excel', '2', '15');

    expect(cursosServiceMock.buscarPersonalizadoPaginado).toHaveBeenCalledWith({
      categoriaId: '1',
      texto: 'excel',
      page: 2,
      limit: 15,
    });
    expect(res).toEqual({
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    });
  });

  it('findAll -> si viene usuario_id llama buscarPorUsuario', async () => {
    cursosServiceMock.buscarPorUsuario.mockResolvedValue([{ id: 1 }]);

    const res = await controller.findAll(undefined, '2', '1', '20');

    expect(cursosServiceMock.buscarPorUsuario).toHaveBeenCalledWith(2);
    expect(res).toEqual([{ id: 1 }]);
  });

  it('findAll -> si viene categoria_id llama buscarPorCategoria', async () => {
    cursosServiceMock.buscarPorCategoria.mockResolvedValue([{ id: 1 }]);

    const res = await controller.findAll('3', undefined, '1', '20');

    expect(cursosServiceMock.buscarPorCategoria).toHaveBeenCalledWith(3);
    expect(res).toEqual([{ id: 1 }]);
  });

  it('findAll -> si no viene filtro llama findAllPaginado', async () => {
    cursosServiceMock.findAllPaginado.mockResolvedValue({
      data: [],
      page: 2,
      limit: 10,
      total: 0,
      totalPages: 1,
    });

    const res = await controller.findAll(undefined, undefined, '2', '10');

    expect(cursosServiceMock.findAllPaginado).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
    });
    expect(res).toEqual({
      data: [],
      page: 2,
      limit: 10,
      total: 0,
      totalPages: 1,
    });
  });

  it('findOne -> llama findOne(id)', async () => {
    cursosServiceMock.findOne.mockResolvedValue({ id: 1 });

    const res = await controller.findOne(1);

    expect(cursosServiceMock.findOne).toHaveBeenCalledWith(1);
    expect(res).toEqual({ id: 1 });
  });

  it('update -> llama updateSiAutorizado con rol y usuario', async () => {
    cursosServiceMock.updateSiAutorizado.mockResolvedValue({ id: 1, ok: true });

    const req: any = { user: { id: 10, rol: 'ADMIN' } };
    const dto: any = { titulo: 'B' };

    const res = await controller.update(5, dto, req);

    expect(cursosServiceMock.updateSiAutorizado).toHaveBeenCalledWith(
      5,
      dto,
      10,
      'ADMIN',
    );
    expect(res).toEqual({ id: 1, ok: true });
  });

  it('remove -> llama removeSiAutorizado con rol y usuario', async () => {
    cursosServiceMock.removeSiAutorizado.mockResolvedValue({ success: true });

    const req: any = { user: { id: 10, rol: 'NORMAL' } };

    const res = await controller.remove(7, req);

    expect(cursosServiceMock.removeSiAutorizado).toHaveBeenCalledWith(
      7,
      10,
      'NORMAL',
    );
    expect(res).toEqual({ success: true });
  });
});
