import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoriaService } from './categoria.service';
import { Categoria } from './entities/categoria.entity';

describe('CategoriaService', () => {
  let service: CategoriaService;

  const repoMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  } as unknown as Partial<Repository<Categoria>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriaService,
        { provide: getRepositoryToken(Categoria), useValue: repoMock },
      ],
    }).compile();

    service = moduleRef.get(CategoriaService);
    jest.clearAllMocks();
  });

  it('create: tira error si nombre vacío', async () => {
    await expect(
      service.create({ nombre: '   ' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create: guarda categoría con nombre trim', async () => {
    repoMock.create = jest.fn().mockReturnValue({ nombre: 'Programación' });
    repoMock.save = jest
      .fn()
      .mockResolvedValue({ id: 1, nombre: 'Programación' });

    const res = await service.create({ nombre: '  Programación  ' } as any);

    expect(repoMock.create).toHaveBeenCalledWith({ nombre: 'Programación' });
    expect(repoMock.save).toHaveBeenCalled();
    expect(res).toEqual({ id: 1, nombre: 'Programación' });
  });

  it('findAll: ordena por id ASC', async () => {
    repoMock.find = jest.fn().mockResolvedValue([]);

    await service.findAll();

    expect(repoMock.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
  });

  it('findOne: tira NotFound si no existe', async () => {
    repoMock.findOneBy = jest.fn().mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('update: llama findOne, update, y devuelve findOne', async () => {
    const cat = { id: 1, nombre: 'A' };

    // findOne usa findOneBy internamente
    repoMock.findOneBy = jest.fn().mockResolvedValue(cat);
    repoMock.update = jest.fn().mockResolvedValue(undefined);

    const res = await service.update(1, { nombre: 'B' } as any);

    expect(repoMock.update).toHaveBeenCalledWith(1, { nombre: 'B' });
    expect(res).toEqual(cat);
  });

  it('remove: si hay FK (23503) tira BadRequest con mensaje', async () => {
    const cat = { id: 1, nombre: 'A' };
    repoMock.findOneBy = jest.fn().mockResolvedValue(cat);

    repoMock.remove = jest.fn().mockRejectedValue({ code: '23503' });

    await expect(service.remove(1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('remove: error inesperado tira InternalServerError (sin console.error)', async () => {
    const cat = { id: 1, nombre: 'A' };
    repoMock.findOneBy = jest.fn().mockResolvedValue(cat);

    repoMock.remove = jest.fn().mockRejectedValue({ code: 'XXXXX' });

    // ✅ silenciar console.error del service
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(service.remove(1)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );

    spy.mockRestore();
  });
});
