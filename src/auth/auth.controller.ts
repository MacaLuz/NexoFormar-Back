import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RecoveryDto } from './dto/recovery.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { RequestRegisterCodeDto } from './dto/request-register-code.dto';
import { ConfirmRegisterDto } from './dto/confirm-register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '(LEGACY) Registrar usuario directo (sin código)' })
  @ApiCreatedResponse({
    description:
      'Este endpoint crea el usuario directamente. El flujo recomendado es: POST /auth/register/request-code y luego POST /auth/register/confirm.',
    schema: {
      example: {
        id: 1,
        nombre: 'Juan',
        correo: 'juan@gmail.com',
        rol: 'NORMAL',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o correo ya registrado.',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/request-code')
  @ApiOperation({ summary: 'Solicitar código para registro' })
  @ApiCreatedResponse({
    description:
      'Si el correo es válido, se envía un código para confirmar el registro.',
    schema: {
      example: {
        message:
          'Si el correo es válido, enviamos un código para crear tu cuenta.',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Correo inválido.' })
  requestRegisterCode(@Body() dto: RequestRegisterCodeDto) {
    return this.authService.generarCodigoRegistro(dto.correo);
  }

  @Post('register/confirm')
  @ApiOperation({ summary: 'Confirmar registro con código' })
  @ApiCreatedResponse({
    description:
      'Registro confirmado. Devuelve el usuario creado (y/o datos asociados).',
    schema: {
      example: {
        id: 1,
        nombre: 'Juan',
        correo: 'juan@gmail.com',
        rol: 'NORMAL',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Código inválido/expirado o datos inválidos.',
  })
  confirmRegister(@Body() dto: ConfirmRegisterDto) {
    return this.authService.confirmarRegistroConCodigo(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({
    description:
      'Login exitoso. Devuelve token JWT y datos básicos del usuario.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          nombre: 'Juan',
          correo: 'juan@gmail.com',
          rol: 'NORMAL',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales incorrectas.' })
  @ApiBadRequestResponse({ description: 'Datos inválidos.' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.correo, dto.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiOkResponse({
    description: 'Token válido.',
    schema: { example: { valid: true } },
  })
  @ApiUnauthorizedResponse({ description: 'Token inválido o ausente.' })
  validateToken() {
    return { valid: true };
  }

  @Post('recovery')
  @ApiOperation({ summary: 'Solicitar código de recuperación de contraseña' })
  @ApiCreatedResponse({
    description: 'Si el correo existe, se envía un código de recuperación.',
    schema: {
      example: {
        message: 'Si el correo es válido, enviamos un código de recuperación.',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Correo inválido.' })
  solicitarCodigo(@Body() dto: RecoveryDto) {
    return this.authService.generarCodigoRecuperacion(dto.correo);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Cambiar contraseña usando código de recuperación' })
  @ApiOkResponse({
    description: 'Contraseña actualizada correctamente.',
    schema: { example: { message: 'Contraseña actualizada correctamente.' } },
  })
  @ApiBadRequestResponse({
    description: 'Código inválido/expirado o datos inválidos.',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.cambiarPasswordConCodigo(
      dto.correo,
      dto.codigo,
      dto.nuevaPass,
    );
  }
}
