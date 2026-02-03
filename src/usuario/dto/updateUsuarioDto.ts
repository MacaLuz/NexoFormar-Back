import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './createUsuarioDto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
