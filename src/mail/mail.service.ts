import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: Number(this.config.get<string>('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendRecoveryCode(to: string, code: string) {
    const from =
      this.config.get<string>('MAIL_FROM') ||
      this.config.get<string>('MAIL_USER');

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Código de verificación - NexoFormar',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verificación por código</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="letter-spacing: 4px;">${code}</h1>
          <p>Este código vence en 15 minutos.</p>
        </div>
      `,
    });

    this.logger.log(`Código de recuperación enviado a ${to}`);
  }
}
