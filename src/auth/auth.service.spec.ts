import { Test } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { MailService } from '../mail/mail.service';
import { RecoveryCode } from '../codigoRecuperacion/entities/codigo.entity';
import { EstadoUsuario, RolUsuario } from '../usuario/entities/usuario.entity';

// ---------- MOCK BCRYPT ----------
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;

  const usuarioServiceMock = {
    findByEmail: jest.fn(),
    crear: jest.fn(),
    actualizarPassword: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  const mailServiceMock = {
    sendRecoveryCode: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  const recoveryRepoMock = {
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as Partial<Repository<RecoveryCode>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: MailService, useValue: mailServiceMock },
        { provide: ConfigService, useValue: configMock },
        {
          provide: getRepositoryToken(RecoveryCode),
          useValue: recoveryRepoMock,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    jest.clearAllMocks();
  });

  // ======================================================
  // VALIDATE USER
  // ======================================================

  it('validateUser → user inexistente', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);

    await expect(service.validateUser('a@a.com', '123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('validateUser → usuario inactivo', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue({
      estado: EstadoUsuario.INACTIVO,
    });

    await expect(service.validateUser('a@a.com', '123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('validateUser → password incorrecta', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      password: 'hash',
      rol: RolUsuario.NORMAL,
      nombre: 'Maca',
      estado: EstadoUsuario.ACTIVO,
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.validateUser('a@a.com', 'bad')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('validateUser → success', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      password: 'hash',
      rol: RolUsuario.NORMAL,
      nombre: 'Maca',
      estado: EstadoUsuario.ACTIVO,
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('a@a.com', '123');

    expect(result).toEqual({
      id: 1,
      correo: 'a@a.com',
      rol: RolUsuario.NORMAL,
      nombre: 'Maca',
    });
  });

  // ======================================================
  // LOGIN
  // ======================================================

  it('login → devuelve token', () => {
    jwtServiceMock.sign.mockReturnValue('token123');

    const res = service.login({
      id: 1,
      correo: 'x@x.com',
      rol: RolUsuario.NORMAL,
      nombre: 'X',
    });

    expect(res).toEqual({
      access_token: 'token123',
      nombre: 'X',
    });
  });

  // ======================================================
  // REGISTER
  // ======================================================

  it('register → correo ya existe', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue({ id: 1 });

    await expect(
      service.register({
        nombre: 'A',
        correo: 'a@a.com',
        password: '123',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('register → success', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashPass');

    usuarioServiceMock.crear.mockResolvedValue({
      id: 10,
      correo: 'new@a.com',
      rol: RolUsuario.NORMAL,
      nombre: 'New',
    });

    jwtServiceMock.sign.mockReturnValue('tokenNEW');

    const res = await service.register({
      nombre: 'New',
      correo: 'new@a.com',
      password: '123',
    } as any);

    expect(res).toEqual({
      access_token: 'tokenNEW',
      nombre: 'New',
    });
  });

  // ======================================================
  // GENERAR CODIGO REGISTRO
  // ======================================================

  it('generarCodigoRegistro → si existe correo devuelve ok', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue({ id: 1 });

    const res = await service.generarCodigoRegistro('a@a.com');

    expect(res.message).toContain('Si el correo es válido');
    expect(mailServiceMock.sendRecoveryCode).not.toHaveBeenCalled();
  });

  it('generarCodigoRegistro → guarda código y manda mail', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);

    configMock.get.mockReturnValue('15');

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashCode');

    recoveryRepoMock.create = jest.fn().mockReturnValue({});
    recoveryRepoMock.save = jest.fn().mockResolvedValue({});
    recoveryRepoMock.delete = jest.fn();

    await service.generarCodigoRegistro('x@x.com');

    expect(recoveryRepoMock.save).toHaveBeenCalled();
    expect(mailServiceMock.sendRecoveryCode).toHaveBeenCalled();
  });

  // ======================================================
  // CONFIRMAR REGISTRO
  // ======================================================

  it('confirmarRegistroConCodigo → código inválido', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);
    recoveryRepoMock.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.confirmarRegistroConCodigo({
        nombre: 'A',
        correo: 'a@a.com',
        password: '123',
        codigo: '111111',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('confirmarRegistroConCodigo → success', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);

    recoveryRepoMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      codigoHash: 'hash',
      expiresAt: new Date(Date.now() + 60000),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashPass');

    usuarioServiceMock.crear.mockResolvedValue({
      id: 7,
      correo: 'a@a.com',
      rol: RolUsuario.NORMAL,
      nombre: 'A',
    });

    jwtServiceMock.sign.mockReturnValue('tokenOK');

    const res = await service.confirmarRegistroConCodigo({
      nombre: 'A',
      correo: 'a@a.com',
      password: '123',
      codigo: '111111',
    });

    expect(res.access_token).toBe('tokenOK');
    expect(recoveryRepoMock.delete).toHaveBeenCalled();
  });

  // ======================================================
  // GENERAR CODIGO RECUPERACION
  // ======================================================

  it('generarCodigoRecuperacion → usuario inexistente', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);

    const res = await service.generarCodigoRecuperacion('x@x.com');

    expect(res.message).toContain('Si el correo existe');
  });

  // ======================================================
  // CAMBIAR PASSWORD
  // ======================================================

  it('cambiarPasswordConCodigo → código inválido', async () => {
    recoveryRepoMock.findOne = jest.fn().mockResolvedValue(null);

    await expect(
      service.cambiarPasswordConCodigo('a@a.com', '111', 'new'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('cambiarPasswordConCodigo → success', async () => {
    recoveryRepoMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      codigoHash: 'hash',
      expiresAt: new Date(Date.now() + 60000),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashNew');

    recoveryRepoMock.delete = jest.fn();

    const res = await service.cambiarPasswordConCodigo(
      'a@a.com',
      '111',
      'newpass',
    );

    expect(usuarioServiceMock.actualizarPassword).toHaveBeenCalled();
    expect(res.message).toContain('Contraseña actualizada');
  });
  it('validateUser → usuario baneado', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue({
      estado: EstadoUsuario.BANEADO,
    });

    await expect(service.validateUser('a@a.com', '123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('confirmarRegistroConCodigo → código expirado', async () => {
    usuarioServiceMock.findByEmail.mockResolvedValue(null);

    recoveryRepoMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      codigoHash: 'hash',
      expiresAt: new Date(Date.now() - 60_000), // expirado
    });

    await expect(
      service.confirmarRegistroConCodigo({
        nombre: 'A',
        correo: 'a@a.com',
        password: '123',
        codigo: '111111',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(recoveryRepoMock.delete).toHaveBeenCalled(); // borra el recovery expirado
  });

  it('cambiarPasswordConCodigo → código expirado', async () => {
    recoveryRepoMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      codigoHash: 'hash',
      expiresAt: new Date(Date.now() - 60_000), // expirado
    });

    await expect(
      service.cambiarPasswordConCodigo('a@a.com', '111', 'new'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(recoveryRepoMock.delete).toHaveBeenCalled();
  });
});
