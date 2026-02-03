import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RecoveryDto } from './dto/recovery.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.correo, dto.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken() {
    return { valid: true };
  }

  @Post('recovery')
  async solicitarCodigo(@Body() dto: RecoveryDto) {
    return this.authService.generarCodigoRecuperacion(dto.correo);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.cambiarPasswordConCodigo(
      dto.correo,
      dto.codigo,
      dto.nuevaPass,
    );
  }
}
