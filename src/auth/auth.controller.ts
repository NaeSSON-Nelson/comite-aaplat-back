import { Controller, Get, Post, Body, Patch, Param, Delete, Header, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Auth, MenuValid } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';
import { IncomingHttpHeaders } from 'http';
import { Usuario } from 'src/manager/usuarios/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginUser(@Body() loginDto: LoginUserDto) {
    return this.authService.loginUser(loginDto);
  }

  @Get('private1')
  @Auth(ValidRole.root)
  // @MenuValid(ValidMenu.itemsMenu)
  prueba1(@GetUser() usuario:Usuario,@Headers() headers:IncomingHttpHeaders){
    return {
      msg:'private 1',
      OK:true,
      usuario,
      headers
    }
  }

  @Get('refresh')
  @Auth()
  validToken(@Headers() headers:IncomingHttpHeaders){
    return this.authService.tokenRefresh(headers.authorization.split(' ')[1]);
  }

}
