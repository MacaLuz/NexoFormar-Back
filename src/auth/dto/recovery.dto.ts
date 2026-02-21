import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecoveryDto {
  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo donde se enviará el código de recuperación',
  })
  @IsEmail()
  correo: string;
}
