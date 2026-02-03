import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

import { UsuarioModule } from 'src/usuario/usuario.module';
import { MailModule } from '../mail/mail.module';
import { RecoveryCode } from '../codigoRecuperacion/entities/codigo.entity';

@Module({
  imports: [
    ConfigModule,
    UsuarioModule,
    MailModule,
    PassportModule,
    TypeOrmModule.forFeature([RecoveryCode]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET') ?? 'dev_secret';

        const expiresInEnv = config.get<string>('JWT_EXPIRES_IN') ?? '3600s';

        const expiresIn: number | StringValue = /^\d+$/.test(expiresInEnv)
          ? Number(expiresInEnv)
          : (expiresInEnv as StringValue);

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
