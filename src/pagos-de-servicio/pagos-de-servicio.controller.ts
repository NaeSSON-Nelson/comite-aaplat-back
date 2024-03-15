import { Controller, Get, Post, Body, Patch, Param, Delete,Query } from '@nestjs/common';
import {ParseIntPipe} from '@nestjs/common/pipes'
import { PagosDeServicioService } from './pagos-de-servicio.service';
import { CreatePagosDeServicioDto } from './dto/create-pagos-de-servicio.dto';
import { UpdatePagosDeServicioDto } from './dto/update-pagos-de-servicio.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Authentication } from 'src/auth/decorators';
import { PagosServicesDto } from './dto/pagos-services.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';

@Controller('pagos-de-servicio')
@Authentication()
export class PagosDeServicioController {
  constructor(private readonly pagosDeServicioService: PagosDeServicioService) {}

  
  @Get('comprobantes/generar')
  GenerarComprobantes()
  {
    return this.pagosDeServicioService.generarComprobantes(); 
  }
  @Get('perfiles')
  perfiles(@Query() paginationDto:SearchPerfil){
    return this.pagosDeServicioService.findAllPefiles(paginationDto)
  }
  @Get('perfiles/:id')
  perfilMedidores(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.findPerfil(id);
  }
  @Get('medidores/:idPerfil/:nroMedidor')
  PlanillasCobrosMedidor(@Param('idPerfil', ParseIntPipe) idPerfil: number,@Param('nroMedidor') nroMedidor: string){
    return this.pagosDeServicioService.findPerfilMedidorHistory(idPerfil,nroMedidor);
  }
  @Get('cobros/historial/:nroMedidor/:idPlanilla')
  historialCobrosMedidor(@Param('nroMedidor') nroMedidor: string,@Param('idPlanilla',ParseIntPipe) idPlanilla: number){
    return this.pagosDeServicioService.historialCobros(nroMedidor,idPlanilla);
  }

  @Get('comprobantes/perfiles/:id')
  obtenerComprobantesPerfil(@Param('id', ParseIntPipe) id: number)
  {
   return this.pagosDeServicioService.comprobantesPorPagarPerfil(id) 
  }
  @Get('comprobantes-pagar/perfiles/:id')
  obtenerComprobantesPorPagarPerfil(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.comprobantesPorPagarAfiliado(id)
  }
  @Get('comprobantes/:id')
  ObtenerComprobante(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.ComprobanteDetalles(id);
  }
  @Post('register')
  registerPagoComprobantes(@Body() pagosAfiliado: PagosServicesDto){
    return this.pagosDeServicioService.pagarComprobantes(pagosAfiliado);
  }
}
