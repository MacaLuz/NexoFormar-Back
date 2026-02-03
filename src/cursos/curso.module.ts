import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Curso } from './entities/curso.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Categoria } from 'src/categoria/entities/categoria.entity';

import { CursosService } from './curso.service';
import { CursosController } from './curso.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Usuario, Categoria])],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursoModule {}
