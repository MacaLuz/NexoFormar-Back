import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  correo: string;

  @IsString()
  @Length(6, 6)
  codigo: string;

  @IsString()
  @MinLength(6)
  nuevaPass: string;
}
