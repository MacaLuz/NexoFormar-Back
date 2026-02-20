import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UsuarioService } from 'src/usuario/usuario.service';
import { RecoveryCode } from '../codigoRecuperacion/entities/codigo.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { EstadoUsuario, RolUsuario } from 'src/usuario/entities/usuario.entity';

type JwtUserPayload = {
  id: number;
  correo: string;
  rol: RolUsuario;
  nombre: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    @InjectRepository(RecoveryCode)
    private readonly recoveryRepo: Repository<RecoveryCode>,
  ) {}

  async validateUser(
    correo: string,
    password: string,
  ): Promise<JwtUserPayload> {
    const user = await this.usuarioService.findByEmail(correo);

    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    if (user.estado === EstadoUsuario.INACTIVO) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    if (user.estado === EstadoUsuario.BANEADO) {
      throw new UnauthorizedException('Usuario baneado permanentemente');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');

    return {
      id: user.id,
      correo: user.correo,
      rol: user.rol,
      nombre: user.nombre,
    };
  }

  login(user: JwtUserPayload) {
    const payload = {
      correo: user.correo,
      sub: user.id,
      rol: user.rol,
      nombre: user.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      nombre: user.nombre,
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.usuarioService.findByEmail(dto.correo);
    if (exists) throw new BadRequestException('El correo ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usuarioService.crear({
      nombre: dto.nombre,
      correo: dto.correo,
      password: passwordHash,
      rol: RolUsuario.NORMAL,
      estado: EstadoUsuario.ACTIVO,
    });

    return this.login({
      id: user.id,
      correo: user.correo,
      rol: user.rol,
      nombre: user.nombre,
    });
  }

  async generarCodigoRegistro(correo: string) {
    const okResponse = {
      message:
        'Si el correo es válido, enviamos un código para crear tu cuenta.',
    };

    const exists = await this.usuarioService.findByEmail(correo);
    if (exists) return okResponse;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codigoHash = await bcrypt.hash(code, 10);

    const ttl = Number(
      this.config.get<string>('REGISTER_CODE_TTL_MINUTES') || '15',
    );
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await this.recoveryRepo.delete({ correo });

    await this.recoveryRepo.save(
      this.recoveryRepo.create({ correo, codigoHash, expiresAt }),
    );

    await this.mailService.sendRecoveryCode(correo, code);

    return okResponse;
  }

  async confirmarRegistroConCodigo(dto: {
    nombre: string;
    correo: string;
    password: string;
    codigo: string;
  }) {
    const exists = await this.usuarioService.findByEmail(dto.correo);
    if (exists) throw new BadRequestException('El correo ya está registrado');

    const recovery = await this.recoveryRepo.findOne({
      where: { correo: dto.correo },
    });
    if (!recovery) throw new UnauthorizedException('Código inválido');

    if (recovery.expiresAt.getTime() < Date.now()) {
      await this.recoveryRepo.delete({ id: recovery.id });
      throw new UnauthorizedException('Código expirado');
    }

    const ok = await bcrypt.compare(dto.codigo, recovery.codigoHash);
    if (!ok) throw new UnauthorizedException('Código inválido');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usuarioService.crear({
      nombre: dto.nombre,
      correo: dto.correo,
      password: passwordHash,
      rol: RolUsuario.NORMAL,
      estado: EstadoUsuario.ACTIVO,
    });

    await this.recoveryRepo.delete({ id: recovery.id });

    return this.login({
      id: user.id,
      correo: user.correo,
      rol: user.rol,
      nombre: user.nombre,
    });
  }

  async generarCodigoRecuperacion(correo: string) {
    const usuario = await this.usuarioService.findByEmail(correo);

    const okResponse = {
      message: 'Si el correo existe, enviamos un código de recuperación',
    };

    if (!usuario) return okResponse;

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codigoHash = await bcrypt.hash(code, 10);

    const ttl = Number(
      this.config.get<string>('RECOVERY_CODE_TTL_MINUTES') || '15',
    );
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);

    await this.recoveryRepo.delete({ correo });

    await this.recoveryRepo.save(
      this.recoveryRepo.create({ correo, codigoHash, expiresAt }),
    );

    await this.mailService.sendRecoveryCode(correo, code);

    return okResponse;
  }

  async cambiarPasswordConCodigo(
    correo: string,
    codigo: string,
    nuevaPass: string,
  ) {
    const recovery = await this.recoveryRepo.findOne({ where: { correo } });
    if (!recovery) throw new UnauthorizedException('Código inválido');

    if (recovery.expiresAt.getTime() < Date.now()) {
      await this.recoveryRepo.delete({ id: recovery.id });
      throw new UnauthorizedException('Código expirado');
    }

    const ok = await bcrypt.compare(codigo, recovery.codigoHash);
    if (!ok) throw new UnauthorizedException('Código inválido');

    const hash = await bcrypt.hash(nuevaPass, 10);

    await this.usuarioService.actualizarPassword(correo, hash);

    await this.recoveryRepo.delete({ id: recovery.id });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
