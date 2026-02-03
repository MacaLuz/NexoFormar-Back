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
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  categoria_id: number;

  @IsNotEmpty()
  @IsUrl()
  enlace: string;
}
