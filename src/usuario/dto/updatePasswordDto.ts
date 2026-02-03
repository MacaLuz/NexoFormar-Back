import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  passwordActual: string;

  @IsString()
  @MinLength(6)
  passwordNueva: string;
}
