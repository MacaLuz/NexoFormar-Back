import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RolUsuario } from 'src/usuario/entities/usuario.entity';

export type JwtUser = {
  id: number;
  correo: string;
  rol: RolUsuario;
  nombre: string;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    _info: any,
    _context: ExecutionContext,
    _status?: any,
  ): any {
    if (err || !user) {
      throw new UnauthorizedException('No autorizado - token inválido');
    }
    return user as JwtUser;
  }
}
