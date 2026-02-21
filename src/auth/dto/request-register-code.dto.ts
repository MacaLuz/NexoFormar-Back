import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestRegisterCodeDto {
  @ApiProperty({
    example: 'juan@gmail.com',
    description:
      'Correo donde se enviará el código de verificación para registro',
  })
  @IsEmail()
  correo: string;
}
