import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
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
