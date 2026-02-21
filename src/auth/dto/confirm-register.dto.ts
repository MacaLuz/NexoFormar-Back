import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ConfirmRegisterDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
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

  @ApiProperty({
    example: '123456',
    description: 'Código de verificación de 6 dígitos',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  codigo: string;
}
