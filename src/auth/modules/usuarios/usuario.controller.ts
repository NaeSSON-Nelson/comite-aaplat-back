import { Controller, Get, Param } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes'
import { Authentication, GetUser } from 'src/auth/decorators';
import { Usuario } from './entities';
import { PerfilesService } from './perfiles.service';

@Controller('user')
@Authentication()
export class UsuarioController {
    constructor(private perfilService:PerfilesService){}
    @Get('medidores')
    ObtenerSelectMedidores(@GetUser() user:Usuario){
        return this.perfilService.medidoresAfiliadoInSelect(user);
    }
    @Get('deudas')
    ObtenerDeudas(@GetUser() user:Usuario){
        return {message:'building'}
    }
    @Get('medidores/:id')
    ObtenerLecturasMedidor(@GetUser() user:Usuario,@Param('id', ParseIntPipe) id: number){
        return this.perfilService.medidorAfiliadoDetails(user,id);
    }
    @Get('profile')
    obtenerPerfil(@GetUser() user:Usuario){
        return this.perfilService.profileUser(user);
    }
}
