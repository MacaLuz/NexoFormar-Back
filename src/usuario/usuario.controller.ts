import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePerfilDto } from './dto/updatePerfilDto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EstadoUsuario, RolUsuario } from './entities/usuario.entity';

@ApiTags('Usuario')
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi perfil (requiere JWT)' })
  @ApiOkResponse({ description: 'Datos del usuario autenticado.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  getMe(@CurrentUser() user: { id: number }) {
    return this.usuarioService.getMe(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar mi perfil (nombre y/o fotoUrl)' })
  @ApiOkResponse({ description: 'Perfil actualizado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiBadRequestResponse({
    description: 'Debe enviarse nombre y/o fotoUrl, o datos inválidos.',
  })
  updateMe(@CurrentUser() user: { id: number }, @Body() dto: UpdatePerfilDto) {
    if (!dto.nombre && !dto.fotoUrl) {
      throw new BadRequestException('Debe enviarse nombre y/o fotoUrl');
    }
    return this.usuarioService.updateMe(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuarios (solo admin)' })
  @ApiOkResponse({ description: 'Listado de usuarios.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  findAllUsuarios() {
    return this.usuarioService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/rol')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar rol de un usuario (solo admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Rol actualizado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  @ApiBadRequestResponse({ description: 'ID inválido o rol inválido.' })
  cambiarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body('rol') rol: RolUsuario,
  ) {
    return this.usuarioService.cambiarRol(id, rol);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/estado')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar estado de un usuario (solo admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Estado actualizado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  @ApiBadRequestResponse({ description: 'ID inválido o estado inválido.' })
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: EstadoUsuario,
  ) {
    return this.usuarioService.cambiarEstado(id, estado);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Banear permanentemente un usuario (solo admin)' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Usuario baneado correctamente.' })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  @ApiForbiddenResponse({ description: 'No autorizado por rol.' })
  @ApiBadRequestResponse({ description: 'ID inválido.' })
  banearPermanentemente(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.banearPermanentemente(id);
  }
}
