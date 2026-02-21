import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RolUsuario, EstadoUsuario } from '../entities/usuario.entity';

export class AdminUpdateUsuarioDto {
  @ApiPropertyOptional({
    example: 'ADMIN',
    description: 'Rol del usuario',
    enum: RolUsuario,
  })
  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @ApiPropertyOptional({
    example: 'ACTIVO',
    description: 'Estado del usuario',
    enum: EstadoUsuario,
  })
  @IsOptional()
  @IsEnum(EstadoUsuario)
  estado?: EstadoUsuario;
}
