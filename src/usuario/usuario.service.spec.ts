import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsuarioService } from './usuario.service';
import { Usuario, EstadoUsuario, RolUsuario } from './entities/usuario.entity';

describe('UsuarioService', () => {
  let service: UsuarioService;

  const repoMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as Partial<Repository<Usuario>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: getRepositoryToken(Usuario), useValue: repoMock },
      ],
    }).compile();

    service = moduleRef.get(UsuarioService);
    jest.clearAllMocks();
  });

  it('getMe: tira NotFound si no existe', async () => {
    repoMock.findOne = jest.fn().mockResolvedValue(null);

    await expect(service.getMe(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateMe: actualiza nombre/foto y devuelve select seguro', async () => {
    repoMock.findOne = jest
      .fn()
      // 1) traer user completo
      .mockResolvedValueOnce({ id: 1, nombre: 'A', fotoUrl: null })
      // 2) traer actualizado con select
      .mockResolvedValueOnce({
        id: 1,
        nombre: 'B',
        correo: 'a@a.com',
        rol: RolUsuario.NORMAL,
        estado: EstadoUsuario.ACTIVO,
        fotoUrl: 'x',
        fechaCreacion: new Date(),
      });

    repoMock.save = jest.fn().mockResolvedValue(undefined);

    const res = await service.updateMe(1, { nombre: 'B', fotoUrl: 'x' } as any);

    // ✅ Fix TS: aseguramos no-null
    expect(res).not.toBeNull();
    if (!res) return;

    expect(repoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, nombre: 'B', fotoUrl: 'x' }),
    );
    expect(res.nombre).toBe('B');
    expect(res.fotoUrl).toBe('x');
  });

  it('crear: setea defaults rol/estado si no vienen', async () => {
    repoMock.create = jest.fn().mockReturnValue({ correo: 'x@x.com' });
    repoMock.save = jest.fn().mockResolvedValue({ id: 1 });

    await service.crear({ correo: 'x@x.com' } as any);

    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        correo: 'x@x.com',
        rol: RolUsuario.NORMAL,
        estado: EstadoUsuario.ACTIVO,
      }),
    );
  });

  it('cambiarRol: tira BadRequest si rol inválido', async () => {
    await expect(
      service.cambiarRol(1, 'INVALID' as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('cambiarEstado: no permite reactivar si está BANEADO', async () => {
    repoMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      estado: EstadoUsuario.BANEADO,
    });

    await expect(
      service.cambiarEstado(1, EstadoUsuario.ACTIVO),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('banearPermanentemente: setea estado BANEADO', async () => {
    repoMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      estado: EstadoUsuario.ACTIVO,
    });
    repoMock.save = jest.fn().mockResolvedValue(undefined);

    const res = await service.banearPermanentemente(1);

    expect(repoMock.save).toHaveBeenCalledWith(
      expect.objectContaining({ estado: EstadoUsuario.BANEADO }),
    );
    expect(res.estado).toBe(EstadoUsuario.BANEADO);
  });
  it('actualizarPassword: tira NotFound si no existe', async () => {
    repoMock.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.actualizarPassword('a@a.com', 'hash'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findAll: devuelve lista con select seguro', async () => {
    repoMock.find = jest.fn().mockResolvedValue([{ id: 1, nombre: 'A' }]);

    const res = await service.findAll();

    expect(repoMock.find).toHaveBeenCalled();
    expect(res).toEqual([{ id: 1, nombre: 'A' }]);
  });
});
