import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './createCatDto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
