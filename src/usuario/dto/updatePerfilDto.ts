import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre del usuario (máx. 50 caracteres)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/.../foto.jpg',
    description: 'URL de la foto de perfil',
  })
  @IsOptional()
  @IsUrl()
  fotoUrl?: string;
}
