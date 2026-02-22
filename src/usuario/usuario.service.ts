import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario, EstadoUsuario, RolUsuario } from './entities/usuario.entity';
import { UpdatePerfilDto } from './dto/updatePerfilDto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepo: Repository<Usuario>,
  ) {}

  async getMe(userId: number) {
    const user = await this.usuarioRepo.findOne({
      where: { id: userId },
      select: [
        'id',
        'nombre',
        'correo',
        'rol',
        'estado',
        'fotoUrl',
        'fechaCreacion',
      ],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateMe(userId: number, dto: UpdatePerfilDto) {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.nombre !== undefined) user.nombre = dto.nombre;
    if (dto.fotoUrl !== undefined) user.fotoUrl = dto.fotoUrl;

    await this.usuarioRepo.save(user);

    const updated = await this.usuarioRepo.findOne({
      where: { id: userId },
      select: [
        'id',
        'nombre',
        'correo',
        'rol',
        'estado',
        'fotoUrl',
        'fechaCreacion',
      ],
    });

    return updated;
  }

  async findByEmail(correo: string) {
    return this.usuarioRepo.findOne({ where: { correo } });
  }

  async crear(data: Partial<Usuario>) {
    const nuevo = this.usuarioRepo.create({
      ...data,
      rol: data.rol ?? RolUsuario.NORMAL,
      estado: data.estado ?? EstadoUsuario.ACTIVO,
    });
    return this.usuarioRepo.save(nuevo);
  }

  async actualizarPassword(correo: string, passwordHash: string) {
    const user = await this.usuarioRepo.findOne({ where: { correo } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.password = passwordHash;
    return this.usuarioRepo.save(user);
  }

  async findAll() {
    return this.usuarioRepo.find({
      select: [
        'id',
        'nombre',
        'correo',
        'rol',
        'estado',
        'fotoUrl',
        'fechaCreacion',
      ],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async cambiarRol(userId: number, rol: RolUsuario) {
    if (!rol) throw new BadRequestException('Debe enviarse un rol');

    const valoresPermitidos = Object.values(RolUsuario);
    if (!valoresPermitidos.includes(rol)) {
      throw new BadRequestException('Rol inválido');
    }

    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.rol = rol;
    await this.usuarioRepo.save(user);

    return {
      message: 'Rol actualizado',
      id: user.id,
      rol: user.rol,
    };
  }

  async cambiarEstado(userId: number, estado: EstadoUsuario) {
    if (!estado) throw new BadRequestException('Debe enviarse un estado');

    if (estado !== EstadoUsuario.ACTIVO && estado !== EstadoUsuario.INACTIVO) {
      throw new BadRequestException('Estado inválido para esta acción');
    }

    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.estado === EstadoUsuario.BANEADO) {
      throw new BadRequestException(
        'Este usuario está baneado permanentemente y no puede reactivarse',
      );
    }

    user.estado = estado;
    await this.usuarioRepo.save(user);

    return {
      message: 'Estado actualizado',
      id: user.id,
      estado: user.estado,
    };
  }

  async banearPermanentemente(userId: number) {
    const user = await this.usuarioRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.estado = EstadoUsuario.BANEADO;
    await this.usuarioRepo.save(user);

    return {
      message: 'Usuario baneado permanentemente',
      id: user.id,
      estado: user.estado,
    };
  }
}
