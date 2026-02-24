import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CursosService } from './curso.service';
import { Curso } from './entities/curso.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

describe('CursosService', () => {
  let service: CursosService;

  const cursoRepoMock = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as unknown as Partial<Repository<Curso>>;

  const usuarioRepoMock = {
    findOneBy: jest.fn(),
  } as unknown as Partial<Repository<Usuario>>;

  const categoriaRepoMock = {
    findOneBy: jest.fn(),
  } as unknown as Partial<Repository<Categoria>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CursosService,
        { provide: getRepositoryToken(Curso), useValue: cursoRepoMock },
        { provide: getRepositoryToken(Usuario), useValue: usuarioRepoMock },
        { provide: getRepositoryToken(Categoria), useValue: categoriaRepoMock },
      ],
    }).compile();

    service = moduleRef.get(CursosService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('tira NotFound si usuario no existe', async () => {
      usuarioRepoMock.findOneBy = jest.fn().mockResolvedValue(null);
      categoriaRepoMock.findOneBy = jest.fn().mockResolvedValue({ id: 1 });

      await expect(
        service.create({ categoria_id: 1 } as any, 123),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('tira NotFound si categoria no existe', async () => {
      usuarioRepoMock.findOneBy = jest.fn().mockResolvedValue({ id: 1 });
      categoriaRepoMock.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(
        service.create({ categoria_id: 999 } as any, 1),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('crea y guarda curso si todo OK', async () => {
      const usuario = { id: 1 };
      const categoria = { id: 2 };

      usuarioRepoMock.findOneBy = jest.fn().mockResolvedValue(usuario);
      categoriaRepoMock.findOneBy = jest.fn().mockResolvedValue(categoria);

      cursoRepoMock.create = jest.fn().mockReturnValue({ titulo: 'A' });
      cursoRepoMock.save = jest.fn().mockResolvedValue({ id: 10 });

      const dto = {
        titulo: 'A',
        descripcion: 'B',
        imagenes: [],
        enlace: 'http://x.com',
        categoria_id: 2,
      };

      const res = await service.create(dto as any, 1);

      expect(cursoRepoMock.create).toHaveBeenCalledWith({
        titulo: 'A',
        descripcion: 'B',
        imagenes: [],
        enlace: 'http://x.com',
        usuario,
        categoria,
      });
      expect(cursoRepoMock.save).toHaveBeenCalled();
      expect(res).toEqual({ id: 10 });
    });
  });

  describe('findAllPaginado', () => {
    it('clamp: limit máximo 50 y page mínimo 1', async () => {
      cursoRepoMock.findAndCount = jest
        .fn()
        .mockResolvedValue([[{ id: 1 }], 1]);

      const res = await service.findAllPaginado({
        page: -5,
        limit: 999,
      } as any);

      expect(cursoRepoMock.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
          skip: 0,
        }),
      );

      expect(res.page).toBe(1);
      expect(res.limit).toBe(50);
      expect(res.total).toBe(1);
      expect(res.totalPages).toBe(1);
    });
  });

  describe('updateSiAutorizado', () => {
    it('tira Forbidden si no es admin ni propietario', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({
        id: 1,
        usuario: { id: 999 },
      });

      await expect(
        service.updateSiAutorizado(1, {} as any, 1, 'NORMAL'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('permite si es admin', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({
        id: 1,
        usuario: { id: 999 },
      });

      // mockea update interno
      jest.spyOn(service, 'update').mockResolvedValue({ id: 1 } as any);

      const res = await service.updateSiAutorizado(1, {} as any, 1, 'ADMIN');

      expect(service.update).toHaveBeenCalledWith(1, {} as any);
      expect(res).toEqual({ id: 1 });
    });

    it('permite si es propietario', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({
        id: 1,
        usuario: { id: 123 },
      });

      jest.spyOn(service, 'update').mockResolvedValue({ id: 1 } as any);

      const res = await service.updateSiAutorizado(1, {} as any, 123, 'NORMAL');

      expect(res).toEqual({ id: 1 });
    });
  });

  describe('removeSiAutorizado', () => {
    it('tira Forbidden si no autorizado', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({
        id: 1,
        usuario: { id: 999 },
      });

      await expect(
        service.removeSiAutorizado(1, 1, 'NORMAL'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('si autorizado, hace softDelete y devuelve success', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({
        id: 1,
        usuario: { id: 1 },
      });
      cursoRepoMock.softDelete = jest.fn().mockResolvedValue(undefined);

      const res = await service.removeSiAutorizado(1, 1, 'NORMAL');

      expect(cursoRepoMock.softDelete).toHaveBeenCalledWith(1);
      expect(res).toEqual({ success: true });
    });
  });

  describe('update', () => {
    it('si dto trae categoria_id y NO existe -> tira NotFound', async () => {
      // findOne del service usa cursoRepo.findOne()
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({
        id: 1,
        usuario: { id: 1 },
        categoria: { id: 1 },
      });

      categoriaRepoMock.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(
        service.update(1, { categoria_id: 999 } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('si dto trae categoria_id existente -> setea categoria + guarda', async () => {
      const cursoInicial: any = {
        id: 1,
        titulo: 'A',
        usuario: { id: 1 },
        categoria: { id: 1 },
      };

      cursoRepoMock.findOne = jest.fn().mockResolvedValue(cursoInicial);
      categoriaRepoMock.findOneBy = jest.fn().mockResolvedValue({ id: 2 });

      cursoRepoMock.save = jest.fn().mockResolvedValue({
        ...cursoInicial,
        titulo: 'Nuevo',
        categoria: { id: 2 },
      });

      const res = await service.update(1, {
        titulo: 'Nuevo',
        categoria_id: 2,
        usuario_id: 999, // debe ser ignorado
      } as any);

      expect(categoriaRepoMock.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(cursoRepoMock.save).toHaveBeenCalled();
      expect(res.titulo).toBe('Nuevo');
      expect(res.categoria.id).toBe(2);
    });
  });

  describe('remove', () => {
    it('si no existe -> tira NotFound', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('si existe -> hace softDelete y devuelve success', async () => {
      cursoRepoMock.findOne = jest.fn().mockResolvedValue({ id: 1 });
      cursoRepoMock.softDelete = jest.fn().mockResolvedValue(undefined);

      const res = await service.remove(1);

      expect(cursoRepoMock.softDelete).toHaveBeenCalledWith(1);
      expect(res).toEqual({ success: true });
    });
  });

  describe('buscarPersonalizadoPaginado', () => {
    it('arma query con categoriaId múltiple + texto y devuelve paginado', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1 }], 1]),
      };

      cursoRepoMock.createQueryBuilder = jest.fn().mockReturnValue(qb);

      const res = await service.buscarPersonalizadoPaginado({
        categoriaId: '1, 2, x',
        texto: 'excel',
        page: 1,
        limit: 20,
      });

      // debe filtrar ids válidos (1,2)
      expect(qb.andWhere).toHaveBeenCalled();
      expect(res.total).toBe(1);
      expect(res.data).toEqual([{ id: 1 }]);
    });
  });
});
