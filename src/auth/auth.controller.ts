import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Headers,UseGuards, Request } from '@nestjs/common';
import {ParseIntPipe} from '@nestjs/common/pipes'
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './decorators/get-user.decorator';
import { ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';
import { IncomingHttpHeaders } from 'http';
import { Usuario } from './modules/usuarios/entities';
import { Authentication } from './decorators/authentication.decorator';
import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
// import { LocalAuthGuard } from './guards/jwt-refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseGuards(LocalAuthGuard)
  @Post('login')
  loginUser(@Body() loginDto: LoginUserDto) {
    return this.authService.loginUser(loginDto);
  }

  //TODO: TESTEAR AUTHENTICATION Y AUTHORIZATION
  @Get('user')
  @Authentication()
  // @MenuValid(ValidMenu.itemsMenu)
  user(@GetUser() usuario:Usuario){
    const {username,roleToUsuario,perfil} = usuario;
    return {
      message:'user',
      OK:true,
      data:{
        username,
        perfil,
        roles:roleToUsuario.map(toUsuario=>{
          const {menuToRole,roleToUsuario,updated_at,created_at,...dataRole}=toUsuario.role;
          return{
            ...dataRole,
            menus:menuToRole.map(toRole=>{
              const {created_at,updated_at,...dataMenu}=toRole.menu
              return{
                ...dataMenu
              }
            })
          }
        })
      }
      // usuario
    }
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  // @Authentication()
  refreshTokens(@Req() req: Request, @GetUser() user:Usuario) {
    console.log(user);
		const userId = req['user'].sub
    // console.log(req);
		return this.authService.refreshTokens(userId);
	}
  @Get('roles/:id')
  @Authentication()
  findOneAuth(@Param('id',ParseIntPipe) id: number,
  @GetUser() user:Usuario,
  ) {
    return this.authService.findOneUserRolesMenus(id,user);
  }
}
