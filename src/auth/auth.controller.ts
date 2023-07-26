import { Controller, Get, Post, Body, Patch, Param, Delete, Header, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';
import { IncomingHttpHeaders } from 'http';
import { Usuario } from './modules/usuarios/entities';
import { Authentication } from './decorators/authentication.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginUser(@Body() loginDto: LoginUserDto) {
    return this.authService.loginUser(loginDto);
  }

  //TODO: TESTEAR AUTHENTICATION Y AUTHORIZATION
  @Get('private1')
  @Authentication(ValidRole.root)
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
  @Authentication()
  validToken(@GetUser() user:Usuario){

    return this.authService.tokenRefresh(user);
  }

  // @Get('access-valid')
  // @Authentication()
  // accessResourse(@GetUser() user:Usuario,@Headers() headers:IncomingHttpHeaders ){
  //   console.log(headers);
  //   return this.authService.accessResource(user);
  // }
}
