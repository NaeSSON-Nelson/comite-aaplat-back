import { Controller, Get, Post, Body, Patch, Param, Delete,Query } from '@nestjs/common';
import {ParseIntPipe} from '@nestjs/common/pipes'
import { PagosDeServicioService } from './pagos-de-servicio.service';
import { CreatePagosDeServicioDto } from './dto/create-pagos-de-servicio.dto';
import { UpdatePagosDeServicioDto } from './dto/update-pagos-de-servicio.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Authentication } from 'src/auth/decorators';

@Controller('pagos-de-servicio')
@Authentication()
export class PagosDeServicioController {
  constructor(private readonly pagosDeServicioService: PagosDeServicioService) {}

  
  @Get('comprobantes/generar')
  GenerarComprobantes()
  {
    return this.pagosDeServicioService.generarComprobantes(); 
  }
  @Get('comprobantes/:id')
  ObtenerComprobante(@Param('id', ParseIntPipe) id: number){
    return this.pagosDeServicioService.ComprobanteDetalles(id);
  }
}
