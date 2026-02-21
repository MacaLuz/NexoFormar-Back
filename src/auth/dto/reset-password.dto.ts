import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo del usuario',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: '123456',
    description: 'Código de recuperación de 6 dígitos',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  codigo: string;

  @ApiProperty({
    example: 'nuevaClave123',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  nuevaPass: string;
}
