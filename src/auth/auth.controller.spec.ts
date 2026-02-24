import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    generarCodigoRegistro: jest.fn(),
    confirmarRegistroConCodigo: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    generarCodigoRecuperacion: jest.fn(),
    cambiarPasswordConCodigo: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = moduleRef.get(AuthController);
    jest.clearAllMocks();
  });

  it('register -> llama authService.register', async () => {
    authServiceMock.register.mockResolvedValue({ ok: true });

    const dto: any = { nombre: 'A', correo: 'a@a.com', password: '123' };
    const res = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ ok: true });
  });

  it('requestRegisterCode -> llama generarCodigoRegistro', async () => {
    authServiceMock.generarCodigoRegistro.mockResolvedValue({ message: 'ok' });

    const res = await controller.requestRegisterCode({
      correo: 'a@a.com',
    } as any);

    expect(authServiceMock.generarCodigoRegistro).toHaveBeenCalledWith(
      'a@a.com',
    );
    expect(res).toEqual({ message: 'ok' });
  });

  it('confirmRegister -> llama confirmarRegistroConCodigo', async () => {
    authServiceMock.confirmarRegistroConCodigo.mockResolvedValue({
      token: 'x',
    });

    const dto: any = {
      nombre: 'A',
      correo: 'a@a.com',
      password: '123',
      codigo: '111111',
    };
    const res = await controller.confirmRegister(dto);

    expect(authServiceMock.confirmarRegistroConCodigo).toHaveBeenCalledWith(
      dto,
    );
    expect(res).toEqual({ token: 'x' });
  });

  it('login -> valida usuario y luego llama login', async () => {
    authServiceMock.validateUser.mockResolvedValue({
      id: 1,
      correo: 'a@a.com',
      rol: 'NORMAL',
      nombre: 'A',
    });
    authServiceMock.login.mockReturnValue({
      access_token: 'token',
      nombre: 'A',
    });

    const dto: any = { correo: 'a@a.com', password: '123' };
    const res = await controller.login(dto);

    expect(authServiceMock.validateUser).toHaveBeenCalledWith('a@a.com', '123');
    expect(authServiceMock.login).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, correo: 'a@a.com' }),
    );
    expect(res).toEqual({ access_token: 'token', nombre: 'A' });
  });

  it('validateToken -> devuelve {valid:true}', () => {
    expect(controller.validateToken()).toEqual({ valid: true });
  });

  it('solicitarCodigo -> llama generarCodigoRecuperacion', async () => {
    authServiceMock.generarCodigoRecuperacion.mockResolvedValue({
      message: 'ok',
    });

    const res = await controller.solicitarCodigo({ correo: 'a@a.com' } as any);

    expect(authServiceMock.generarCodigoRecuperacion).toHaveBeenCalledWith(
      'a@a.com',
    );
    expect(res).toEqual({ message: 'ok' });
  });

  it('resetPassword -> llama cambiarPasswordConCodigo', async () => {
    authServiceMock.cambiarPasswordConCodigo.mockResolvedValue({
      message: 'ok',
    });

    const dto: any = {
      correo: 'a@a.com',
      codigo: '111111',
      nuevaPass: 'newpass',
    };
    const res = await controller.resetPassword(dto);

    expect(authServiceMock.cambiarPasswordConCodigo).toHaveBeenCalledWith(
      'a@a.com',
      '111111',
      'newpass',
    );
    expect(res).toEqual({ message: 'ok' });
  });
});
