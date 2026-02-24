import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

describe('UsuarioController', () => {
  let controller: UsuarioController;

  const usuarioServiceMock = {
    getMe: jest.fn(),
    updateMe: jest.fn(),
    findAll: jest.fn(),
    cambiarRol: jest.fn(),
    cambiarEstado: jest.fn(),
    banearPermanentemente: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [{ provide: UsuarioService, useValue: usuarioServiceMock }],
    }).compile();

    controller = moduleRef.get(UsuarioController);
    jest.clearAllMocks();
  });

  it('getMe -> llama usuarioService.getMe con CurrentUser.id', async () => {
    usuarioServiceMock.getMe.mockResolvedValue({ id: 1 });

    const res = await controller.getMe({ id: 1 });

    expect(usuarioServiceMock.getMe).toHaveBeenCalledWith(1);
    expect(res).toEqual({ id: 1 });
  });

  it('updateMe -> tira BadRequest si no viene nombre ni fotoUrl', () => {
    expect(() => controller.updateMe({ id: 1 }, {} as any)).toThrow(
      BadRequestException,
    );

    expect(usuarioServiceMock.updateMe).not.toHaveBeenCalled();
  });

  it('updateMe -> llama usuarioService.updateMe si viene nombre o fotoUrl', async () => {
    usuarioServiceMock.updateMe.mockResolvedValue({ id: 1, nombre: 'B' });

    const res = await controller.updateMe({ id: 1 }, { nombre: 'B' } as any);

    expect(usuarioServiceMock.updateMe).toHaveBeenCalledWith(1, {
      nombre: 'B',
    });
    expect(res).toEqual({ id: 1, nombre: 'B' });
  });

  it('findAllUsuarios -> llama usuarioService.findAll', async () => {
    usuarioServiceMock.findAll.mockResolvedValue([]);

    const res = await controller.findAllUsuarios();

    expect(usuarioServiceMock.findAll).toHaveBeenCalled();
    expect(res).toEqual([]);
  });

  it('cambiarRol -> llama usuarioService.cambiarRol(id, rol)', async () => {
    usuarioServiceMock.cambiarRol.mockResolvedValue({ message: 'ok' });

    const res = await controller.cambiarRol(2, 'ADMIN' as any);

    expect(usuarioServiceMock.cambiarRol).toHaveBeenCalledWith(2, 'ADMIN');
    expect(res).toEqual({ message: 'ok' });
  });

  it('cambiarEstado -> llama usuarioService.cambiarEstado(id, estado)', async () => {
    usuarioServiceMock.cambiarEstado.mockResolvedValue({ message: 'ok' });

    const res = await controller.cambiarEstado(2, 'ACTIVO' as any);

    expect(usuarioServiceMock.cambiarEstado).toHaveBeenCalledWith(2, 'ACTIVO');
    expect(res).toEqual({ message: 'ok' });
  });

  it('banearPermanentemente -> llama usuarioService.banearPermanentemente(id)', async () => {
    usuarioServiceMock.banearPermanentemente.mockResolvedValue({
      message: 'ok',
    });

    const res = await controller.banearPermanentemente(5);

    expect(usuarioServiceMock.banearPermanentemente).toHaveBeenCalledWith(5);
    expect(res).toEqual({ message: 'ok' });
  });
});
