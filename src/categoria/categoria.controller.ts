import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiCreatedResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoriaService } from './categoria.service';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Categoria')
@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una categoría (solo admin)' })
  @ApiCreatedResponse({ description: 'Categoría creada correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  create(@Body() dto: CreateCategoriaDto) {
    return this.categoriaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  @ApiOkResponse({ description: 'Listado de categorías.' })
  findAll() {
    return this.categoriaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Categoría encontrada.' })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar categoría (solo admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Categoría actualizada correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos o ID inválido.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriaService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar categoría (solo admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Categoría eliminada correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaService.remove(id);
  }
}
