import { IsEmail } from 'class-validator';

export class RequestRegisterCodeDto {
  @IsEmail()
  correo: string;
}
