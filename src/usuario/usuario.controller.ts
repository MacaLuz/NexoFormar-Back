import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  BadRequestException,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';

import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdatePerfilDto } from './dto/updatePerfilDto';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EstadoUsuario, RolUsuario } from './entities/usuario.entity';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: { id: number }) {
    return this.usuarioService.getMe(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentUser() user: { id: number }, @Body() dto: UpdatePerfilDto) {
    if (!dto.nombre && !dto.fotoUrl) {
      throw new BadRequestException('Debe enviarse nombre y/o fotoUrl');
    }
    return this.usuarioService.updateMe(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  updateMyPassword(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usuarioService.updateMyPassword(user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAllUsuarios() {
    return this.usuarioService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/rol')
  cambiarRol(
    @Param('id', ParseIntPipe) id: number,
    @Body('rol') rol: RolUsuario,
  ) {
    return this.usuarioService.cambiarRol(id, rol);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: EstadoUsuario,
  ) {
    return this.usuarioService.cambiarEstado(id, estado);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  banearPermanentemente(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.banearPermanentemente(id);
  }
}
