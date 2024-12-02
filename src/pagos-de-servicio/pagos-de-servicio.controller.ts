import { Controller, Get, Post, Body, Patch, Param, Delete,Query } from '@nestjs/common';
import {ParseIntPipe} from '@nestjs/common/pipes'
import { PagosDeServicioService } from './pagos-de-servicio.service';
import { CreatePagosDeServicioDto } from './dto/create-pagos-de-servicio.dto';
import { UpdatePagosDeServicioDto } from './dto/update-pagos-de-servicio.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Authentication, Authorization, AuthorizationResource } from 'src/auth/decorators';
import { PagosServicesDto } from './dto/pagos-services.dto';
import { SearchPerfil } from 'src/auth/modules/usuarios/querys/search-perfil';
import { ItemMenuProtected, MenusProtected } from 'src/auth/decorators/valid-protected.decorator';
import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';

@Controller('pagos-de-servicio')
@AuthorizationResource()
@Authorization()
@Authentication()
export class PagosDeServicioController {
  constructor(private readonly pagosDeServicioService: PagosDeServicioService) {}

  
  // @Get('comprobantes/generar')
  // GenerarComprobantes()
  // {
  //   return this.pagosDeServicioService.generarComprobantes(); 
  // }
  @Get('perfiles')
  @MenusProtected(ValidMenu.cobros)
  @ItemMenuProtected(ValidItemMenu.cobrosListarAsociacionesAfiliados)
  perfiles(@Query() paginationDto:SearchPerfil){
    return this.pagosDeServicioService.findAllPefiles(paginationDto)
  }
  @Get('perfiles/:id')
  @MenusProtected(ValidMenu.cobros)
  @ItemMenuProtected(ValidItemMenu.cobrosDeudasPorPagarAsociacion)
  perfilMedidores(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.findPerfil(id);
  }
  @Get('medidores/:idPerfil/:nroMedidor')
  @MenusProtected(ValidMenu.cobros)
  @ItemMenuProtected(ValidItemMenu.cobrosHistorialRegistroDeCobros)
  PlanillasCobrosMedidor(@Param('idPerfil', ParseIntPipe) idPerfil: number,@Param('nroMedidor') nroMedidor: string){
    return this.pagosDeServicioService.findPerfilMedidorHistory(idPerfil,nroMedidor);
  }
  @Get('cobros/historial/:nroMedidor/:idPlanilla')
  @MenusProtected(ValidMenu.cobros)
  @ItemMenuProtected(ValidItemMenu.cobrosHistorialRegistroDeCobros)
  historialCobrosMedidor(@Param('nroMedidor') nroMedidor: string,@Param('idPlanilla',ParseIntPipe) idPlanilla: number){
    return this.pagosDeServicioService.historialCobros(nroMedidor,idPlanilla);
  }
  
  @Get('comprobantes/perfiles/:id')
  @MenusProtected(ValidMenu.cobros)
  @ItemMenuProtected(ValidItemMenu.cobrosHistorialRegistroDeCobros)
  obtenerComprobantesPerfil(@Param('id', ParseIntPipe) id: number)
  {
    return this.pagosDeServicioService.comprobantesPorPagarPerfil(id) 
  }
  @Get('comprobantes-pagar/perfiles/:id')
  @MenusProtected(ValidMenu.cobros)
  obtenerComprobantesPorPagarPerfil(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.comprobantesPorPagarAfiliado(id)
  }
  @Get('comprobantes/:id')
  @MenusProtected(ValidMenu.cobros)
  ObtenerComprobante(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.ComprobanteDetalles(id);
  }
  @Post('register')
  @MenusProtected(ValidMenu.cobros)
  @ItemMenuProtected(ValidItemMenu.cobrosRegistrarPagoDeudas)
  registerPagoComprobantes(@Body() pagosAfiliado: PagosServicesDto){
    return this.pagosDeServicioService.pagarComprobantes(pagosAfiliado);
  }
}
