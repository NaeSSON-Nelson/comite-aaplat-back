import { Controller, Get, Post, Body, Patch, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ConfiguracionesApplatService } from './configuraciones-applat.service';
import { Authentication, Authorization, AuthorizationResource } from 'src/auth/decorators';
import { NuevaTarifaPorConsumoAguaDto } from './dto/nueva-tarifa-por-consumo-agua.dto';
import { NuevaTarifaMultaPorRetrasosPagosDto } from './dto/nueva-tarifa-multa-por-retrasos-pagos.dto';
import { NuevoBeneficiarioDescuentoDto } from './dto/nuevo-beneficiario-descuentos.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateBeneficiarioDescuentosDto } from './dto/update-beneficiario-descuentos.dto';
import { ModificarTarifaPorConsumoDto } from './dto/modificar-tarifa-por-consumo-agua.dto';
import { ModificarTarifaMultaPorRetrasoPagosDto } from './dto/modificar-tarifa-multa-por-retrasos-pagos.dto';
@Controller('configuraciones-applat')
@AuthorizationResource()
@Authorization()
@Authentication()
export class ConfiguracionesApplatController {
  constructor(private readonly configuracionesApplatService: ConfiguracionesApplatService) {}

  @Post('tarifa-agua')
  nuevaTarifaPorConsumoAgua(@Body() nuevaTarifaDto:NuevaTarifaPorConsumoAguaDto){
    return this.configuracionesApplatService.createNuevaTarifaPorConsumoAgua(nuevaTarifaDto);
  }
  @Post('tarifa-multas-retrasos-pagos')
  nuevaTarifaMultasRetrasosPagos(@Body() nuevaTarifaDto:NuevaTarifaMultaPorRetrasosPagosDto){
    return this.configuracionesApplatService.createNuevaTarifaMultaPorRetrasosPagos(nuevaTarifaDto);
  }
  @Post('beneficiarios')
  nuevoTipoBeneficiario(@Body() nuevoBeneficiarioDto:NuevoBeneficiarioDescuentoDto){
    return this.configuracionesApplatService.registrarNuevoBeneficiarioDescuentos(nuevoBeneficiarioDto);
  }
  @Get('tarifa-agua')
  listarTarifasPorConsumoAgua(@Query() paginationDto:PaginationDto){
    return this.configuracionesApplatService.listarTarifasPorConsumoAgua(paginationDto);
  }
  @Get('tarifa-multas-retrasos-pagos')
  listarTarifasMultasRetrasos(@Query() paginationDto:PaginationDto){
    return this.configuracionesApplatService.listarTarifasMultasPorRetrasosPagos(paginationDto);
  }
  @Get('beneficiarios')
  listarTiposBeneficiarios(@Query() paginationDto:PaginationDto){
    return this.configuracionesApplatService.listarTiposBeneficiarios(paginationDto);
  }
  // @Get('beneficiarios/:id')
  // obtenerTipoBeneficiario(@Param('id', ParseIntPipe) id:number){
  //   return this.configuracionesApplatService.obtenerTipoBeneficiario(id);
  // }
  @Patch('beneficiarios/:id')
  updateTipoBeneficiario(@Param('id', ParseIntPipe) id:number,@Body() updateDto:UpdateBeneficiarioDescuentosDto){
    return this.configuracionesApplatService.updateBeneficiario(id,updateDto)
  }
  @Get('beneficiarios/status/:id')
  updateStatusTipoBeneficiario(@Param('id', ParseIntPipe) id:number){
    return this.configuracionesApplatService.updateStatusBeneficiario(id)
  }
  @Get('tarifa-agua/status/:id')
  updateStatusTarifaPorConsumoAgua(@Param('id', ParseIntPipe) id:number){
    return this.configuracionesApplatService.updateStatusTarifaPorConsumoAgua(id);
  }
  @Get('tarifa-multas-retrasos-pagos/status/:id')
  updateStatusTarifaMultaRetrasoPagos(@Param('id', ParseIntPipe) id:number){
    return this.configuracionesApplatService.updateStatusTarifaMultaPorRetrasoPagos(id);
  }
  @Patch('tarifa-agua/:id')
  updateTarifaPorConsumoAgua(@Param('id', ParseIntPipe) id:number,@Body() updateDto:ModificarTarifaPorConsumoDto){
    return this.configuracionesApplatService.modificarTarifaPorConsumoAgua(id,updateDto);
  }
  @Patch('tarifa-multas-retrasos-pagos/:id')
  updateTarifaMultaRetrasoPagos(@Param('id', ParseIntPipe) id:number,@Body() updateDto:ModificarTarifaMultaPorRetrasoPagosDto){
    return this.configuracionesApplatService.modificarTarifaMultaPorRetrasosPagos(id,updateDto);
  }
}
