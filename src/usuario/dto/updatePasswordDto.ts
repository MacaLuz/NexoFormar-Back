import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    example: 'claveActual123',
    description: 'Contraseña actual del usuario',
  })
  @IsString()
  passwordActual: string;

  @ApiProperty({
    example: 'nuevaClave123',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  passwordNueva: string;
}
