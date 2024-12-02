import { Controller, Get, Param, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes'
import { Authentication, GetUser } from 'src/auth/decorators';
import { Usuario } from './entities';
import { UserService } from './usuario.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('user')
@Authentication()
export class UsuarioController {
    constructor(private userService:UserService){}
    @Get('medidores')
    ObtenerSelectMedidores(@GetUser() user:Usuario){
        return this.userService.medidoresAfiliadoInSelect(user);
    }
    @Get('medidores/deudas/:nro')
    ObtenerDeudas(@GetUser() user:Usuario,@Param('nro') nro: string){
        return this.userService.obtenerComprobantesPorPagar(user,nro);
    }
    @Get('medidores/planillas/:id')
    obtenerLecturasMedidor(@Param('id',ParseIntPipe) id: number){
        return this.userService.lecturasPlanilla(id);
    }
    @Get('medidores/lecturas/:id')
    obtenerLectura(@Param('id',ParseIntPipe) id: number){
        return this.userService.lecturaDetails(id)
    }
    @Get('medidores/detalles/:id')
    ObtenerDetallesMedidor(@GetUser() user:Usuario,@Param('id') id: number){
        return this.userService.medidorAsociadoDetalles(user,id);
    }
    @Get('medidores/asociacion/:id')
    ObtenerMultasAsociacion(@GetUser() user:Usuario,@Param('id') id: number, @Query() paginationDto:PaginationDto){
        return this.userService.multasMedidorAsociado(user,id,paginationDto);
    }
    @Get('medidores/:nro')
    ObtenerMedidorAsociado(@GetUser() user:Usuario,@Param('nro') nro: string){
        return this.userService.medidorAsociadoSelect(user,nro);
    }
    @Get('profile')
    obtenerPerfil(@GetUser() user:Usuario){
        return this.userService.profileUser(user);
    }
}
