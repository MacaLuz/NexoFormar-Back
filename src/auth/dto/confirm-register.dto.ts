import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ConfirmRegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @Length(6, 6)
  codigo: string;
}
