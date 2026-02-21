import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  nombre: string;

  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo del usuario',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'secreto123',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
