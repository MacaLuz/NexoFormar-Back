import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub: number;
  correo: string;
  rol?: string;
  nombre?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev_secret',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) throw new UnauthorizedException('Token inválido');
    if (!payload?.correo) throw new UnauthorizedException('Token inválido');

    const rol = payload.rol ?? 'NORMAL';

    return {
      id: payload.sub,
      correo: payload.correo,
      rol,
      nombre: payload.nombre,
    };
  }
}
