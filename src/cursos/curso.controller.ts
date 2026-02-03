import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { CursosService } from './curso.service';
import { CreateCursoDto } from './dto/createCursoDto';
import { UpdateCursoDto } from './dto/updateCursoDto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

type JwtReqUser = {
  id: number;
  rol: string;
  correo: string;
  nombre?: string;
};

type RequestWithUser = Request & { user: JwtReqUser };

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCursoDto, @Req() req: RequestWithUser) {
    return this.cursosService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-cursos')
  misCursos(@Req() req: RequestWithUser) {
    return this.cursosService.buscarPorUsuario(req.user.id);
  }

  @Get('buscar')
  buscar(
    @Query('categoria_id') categoriaId?: string,
    @Query('keywords') busqueda?: string,
  ) {
    return this.cursosService.buscarPersonalizado({
      categoriaId,
      texto: busqueda?.toLowerCase(),
    });
  }

  @Get()
  findAll(
    @Query('categoria_id') categoriaId?: string,
    @Query('usuario_id') usuarioId?: string,
  ) {
    if (usuarioId) return this.cursosService.buscarPorUsuario(+usuarioId);
    if (categoriaId) return this.cursosService.buscarPorCategoria(+categoriaId);
    return this.cursosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.cursosService.updateSiAutorizado(id, dto, user.id, user.rol);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.cursosService.removeSiAutorizado(id, user.id, user.rol);
  }
}
