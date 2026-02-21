import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resend: Resend;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada');
    }

    this.resend = new Resend(apiKey);
  }

  async sendRecoveryCode(to: string, code: string): Promise<void> {
    const from =
      this.config.get<string>('MAIL_FROM') ||
      'NexoFormar <onboarding@resend.dev>';

    const result = await this.resend.emails.send({
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

    const anyResult: any = result as any;

    if (anyResult?.error) {
      throw new Error(
        anyResult.error.message || 'Error al enviar el correo con Resend',
      );
    }
  }
}
