import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { CursosService } from './curso.service';
import { CreateCursoDto } from './dto/createCursoDto';
import { UpdateCursoDto } from './dto/updateCursoDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

type JwtReqUser = {
  id: number;
  rol: string;
  correo: string;
  nombre?: string;
};

type RequestWithUser = Request & { user: JwtReqUser };

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear curso (requiere JWT)' })
  @ApiCreatedResponse({ description: 'Curso creado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  create(@Body() dto: CreateCursoDto, @Req() req: RequestWithUser) {
    return this.cursosService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-cursos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis cursos (requiere JWT)' })
  @ApiOkResponse({ description: 'Listado de cursos del usuario autenticado.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  misCursos(@Req() req: RequestWithUser) {
    return this.cursosService.buscarPorUsuario(req.user.id);
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar cursos (con filtros + paginación)' })
  @ApiQuery({ name: 'categoria_id', required: false, example: '1' })
  @ApiQuery({ name: 'keywords', required: false, example: 'excel' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiOkResponse({ description: 'Resultados de búsqueda paginados.' })
  buscar(
    @Query('categoria_id') categoriaId?: string,
    @Query('keywords') busqueda?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cursosService.buscarPersonalizadoPaginado({
      categoriaId,
      texto: busqueda?.toLowerCase(),
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar cursos (con filtros opcionales + paginación)',
  })
  @ApiQuery({ name: 'categoria_id', required: false, example: '1' })
  @ApiQuery({ name: 'usuario_id', required: false, example: '2' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiOkResponse({
    description: 'Listado de cursos (posiblemente filtrado/paginado).',
  })
  findAll(
    @Query('categoria_id') categoriaId?: string,
    @Query('usuario_id') usuarioId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (usuarioId) return this.cursosService.buscarPorUsuario(+usuarioId);
    if (categoriaId) return this.cursosService.buscarPorCategoria(+categoriaId);

    return this.cursosService.findAllPaginado({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener curso por id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Curso encontrado.' })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar curso (dueño o admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Curso actualizado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado (no es dueño/admin).' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o ID inválido.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar curso (dueño o admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Curso eliminado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado (no es dueño/admin).' })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    const user = req.user;
    return this.cursosService.removeSiAutorizado(id, user.id, user.rol);
  }
}
