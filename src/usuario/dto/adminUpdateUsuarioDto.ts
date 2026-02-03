import { IsEnum, IsOptional } from 'class-validator';
import { RolUsuario, EstadoUsuario } from '../entities/usuario.entity';

export class AdminUpdateUsuarioDto {
  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;
}
