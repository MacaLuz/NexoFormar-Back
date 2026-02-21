import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCursoDto {
  @ApiPropertyOptional({
    example: 'Curso de Excel intermedio',
    description: 'Título del curso',
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({
    example: 'Contenido actualizado con nuevas prácticas.',
    description: 'Descripción del curso',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    example: ['https://res.cloudinary.com/.../img1.jpg'],
    description: 'Lista de URLs de imágenes del curso',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @ApiPropertyOptional({
    example: 2,
    description: 'ID de la categoría asociada',
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoria_id?: number;

  @ApiPropertyOptional({
    example: 'https://www.coursera.org/learn/xxxx',
    description: 'URL del curso',
  })
  @IsOptional()
  @IsUrl()
  enlace?: string;
}
