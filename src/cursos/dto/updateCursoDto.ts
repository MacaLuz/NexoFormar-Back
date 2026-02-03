import { IsInt, IsOptional, IsString, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCursoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagenes?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoria_id?: number;

  @IsOptional()
  @IsUrl()
  enlace?: string;
}
