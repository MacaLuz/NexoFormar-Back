import { MailService } from './mail.service';

// ✅ Mock del paquete "resend"
const sendMock = jest.fn();

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: sendMock,
      },
    })),
  };
});

describe('MailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('constructor: tira error si no hay RESEND_API_KEY', () => {
    const configMock = {
      get: jest.fn().mockReturnValue(undefined),
    } as any;

    expect(() => new MailService(configMock)).toThrow('RESEND_API_KEY no está configurada');
  });

  it('sendRecoveryCode: usa MAIL_FROM default si no existe', async () => {
    const configMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RESEND_API_KEY') return 'key123';
        if (key === 'MAIL_FROM') return undefined;
        return undefined;
      }),
    } as any;

    sendMock.mockResolvedValue({ id: 'email_1' });

    const service = new MailService(configMock);

    await service.sendRecoveryCode('to@mail.com', '123456');

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'NexoFormar <onboarding@resend.dev>',
        to: 'to@mail.com',
        subject: expect.any(String),
        html: expect.stringContaining('123456'),
      }),
    );
  });

  it('sendRecoveryCode: tira error si resend devuelve error', async () => {
    const configMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RESEND_API_KEY') return 'key123';
        if (key === 'MAIL_FROM') return 'NexoFormar <test@x.com>';
        return undefined;
      }),
    } as any;

    sendMock.mockResolvedValue({ error: { message: 'Boom' } });

    const service = new MailService(configMock);

    await expect(service.sendRecoveryCode('to@mail.com', '123456')).rejects.toThrow('Boom');
  });
});