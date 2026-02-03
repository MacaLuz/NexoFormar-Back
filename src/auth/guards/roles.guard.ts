import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { rol?: string };

    if (!user?.rol) {
      throw new ForbiddenException('Acceso restringido');
    }

    if (user.rol !== 'ADMIN') {
      throw new ForbiddenException('Acceso restringido a administradores');
    }

    return true;
  }
}
