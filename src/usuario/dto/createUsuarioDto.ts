import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EstadoUsuario, RolUsuario } from '../entities/usuario.entity';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo del usuario',
  })
  @IsNotEmpty()
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'secreto123',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    example: 'NORMAL',
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
