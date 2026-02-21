import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({
    example: 'Programación',
    description: 'Nombre de la categoría',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;
}
