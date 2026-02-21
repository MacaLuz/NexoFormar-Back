import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCursoDto {
  @ApiProperty({
    example: 'Curso de Excel desde cero',
    description: 'Título del curso',
  })
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @ApiProperty({
    example: 'Aprendé Excel paso a paso con ejercicios prácticos.',
    description: 'Descripción del curso',
  })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({
    example: ['https://res.cloudinary.com/.../img1.jpg'],
    description: 'Lista de URLs de imágenes del curso',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría asociada',
    type: Number,
  })
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  categoria_id: number;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=xxxx',
    description: 'URL del curso',
  })
  @IsNotEmpty()
  @IsUrl()
  enlace: string;
}
