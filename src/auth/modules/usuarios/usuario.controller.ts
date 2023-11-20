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
    @Get('medidores/deudas/:nro')
    ObtenerDeudas(@GetUser() user:Usuario,@Param('nro') nro: string){
        return this.perfilService.obtenerComprobantesPorPagar(user,nro);
    }
    @Get('medidores/planillas/:id')
    obtenerLecturasMedidor(@Param('id',ParseIntPipe) id: number){
        return this.perfilService.lecturasPlanilla(id);
    }
    @Get('medidores/lecturas/:id')
    obtenerLectura(@Param('id',ParseIntPipe) id: number){
        return this.perfilService.lecturaDetails(id)
    }
    @Get('medidores/:nro')
    ObtenerDetallesMedidor(@GetUser() user:Usuario,@Param('nro') nro: string){
        return this.perfilService.medidorAfiliadoDetails(user,nro);
    }
    @Get('profile')
    obtenerPerfil(@GetUser() user:Usuario){
        return this.perfilService.profileUser(user);
    }
}
