import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nombre?: string;

  @IsOptional()
  @IsUrl()
  fotoUrl?: string;
}
