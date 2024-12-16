import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AsociacionesService } from './asociaciones.service';
import { CreateMedidorAsociadoDto } from './dto/create-medidor-asociado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateMedidorAsociadoDto } from './dto/update-medidor-asociado.dto';
import { CreateGestionMedidorAsociadoDto } from './dto/create-gestion-medidor-asociacion.dto';
import { UpdateStatusGestion } from './dto/update-status-planilla.dto';
import { Authentication, Authorization, AuthorizationResource } from 'src/auth/decorators';
import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';
import { ItemMenuProtected, MenusProtected } from 'src/auth/decorators/valid-protected.decorator';
import { UpdatePlanillaMedidorDto } from './dto/update-planilla-medidor.dto';
import { CreatePlanillaMedidorDto } from './dto/create-planilla-medidor.dto';
import { MultasVariosDto } from './dto/multas-varios.dto';
import { UpdateMultasVariosDto } from './dto/update-multas-varios.dto';
import { MotivoReconexionDto } from './dto/motivo-corte.dto';

@Controller('asociaciones')
@AuthorizationResource()
@Authorization()
@Authentication()
export class AsociacionesController {
  constructor(private readonly asociacionesService: AsociacionesService) {}
  
  @Post()
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionRegister)
  create(@Body() createMedidorAsociado:CreateMedidorAsociadoDto){
    return this.asociacionesService.create(createMedidorAsociado);
  }
  @Post('gestion')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  createGestion(@Body() createGestionMedidorAsociado:CreateGestionMedidorAsociadoDto){
    return this.asociacionesService.createGestionActual(createGestionMedidorAsociado)
  }
    
  @Post('planilla')
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  createPanilla(@Body() createPlanillaMedidorDto:CreatePlanillaMedidorDto){
    return this.asociacionesService.createPlanillaMedidor(createPlanillaMedidorDto);
  }

  //CREAR MULTA TIPO VARIOS
  // @Post('multas')
  // createMultaTipoVarios(@Body() multaDto:MultasVariosDto){
  //   return this.asociacionesService.registrarMultaVarios(multaDto);
  // }
  @Get()
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionList)
  getAfiliados(@Query() paginationDto: PaginationDto){
    return this.asociacionesService.findAll(paginationDto);
  }
  @Get('list/gestiones/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  getGestiones(@Param('id', ParseIntPipe) id: number,@Query() paginationDto: PaginationDto){
    return this.asociacionesService.findGestiones(id,paginationDto)
  }
  @Get('sin-asociaciones')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionList)
  medidoresWithoutAsociacion(@Query() paginationDto: PaginationDto){
    return this.asociacionesService.findMedidoresWithoutAsociacion(paginationDto);
  } 
  @Get('perfil/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionesAfiliadoDetails)
  findPerfilAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.findOnePerfil(id);
  } 
  @Get('gestiones/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  getGestionesLecturasAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getGestionesLecturasAsociacion(id);
  }
  @Get('afiliado/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionList)
  findAllAsociacionesAfiliado(@Param('id', ParseIntPipe) id: number) {
    return this.asociacionesService.getAsociacionesAfiliado(id);
  }
  @Get('afiliado/:id')
  findAllMedidoresOfAfiliado(@Param('id', ParseIntPipe) id: number) {
    return this.asociacionesService.findAllMedidorOneAfiliado(id);
  }
  @Get('lectura/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionLecturas)
  getLecturaAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getLecturaDetails(id);
  }
  @Get('lecturas/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionLecturas)
  getLecturasAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getLecturasAsociacion(id);
  }
  @Get('medidor/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionList)
  findMedidorWithAsociationById(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.findMedidorWithAsociation(id);
  }
  @Get('gestion/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  verificarGestion(@Param('id', ParseIntPipe) id:number){
    return this.asociacionesService.verificarGestion(id);
  }
  @Get('gestion/:id/:gestion')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  findGestionByIdAsociacion(@Param('id', ParseIntPipe) id:number,
  @Param('gestion', ParseIntPipe) gestion:number){
    return this.asociacionesService.findGestionById(id,gestion);
  }
  @Get('comprobantes-lectura/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionLecturas)
  ObtenerComprobante(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.ComprobanteDetalles(id);
  }
//MULTAS A ASOCICAION ENTRE MEDIDOR DE AGUA Y AFILIADO
  @Get('multas/:id')
  listarMultasDeAsociacion(
    @Param('id', ParseIntPipe) id: number,@Query() paginationDto: PaginationDto
  ){
    return this.asociacionesService.listarMultasAsociacion(id,paginationDto);
  }

  @Get('multa/:id')
  getMultaAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.getMultaAsociacion(id);
  }

  //HISTORIAL DE CORTES DE ASOCIACION
  @Get('historial-conexiones/:id')
  obtenerHistorialCortes(@Param('id', ParseIntPipe) id: number,@Query() paginationDto: PaginationDto){
    return this.asociacionesService.obtenerHistorialConexiones(id,paginationDto)
  }
  
  @Get(':id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionDetails)
  findAsociacion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.findOne(id);
  }
  
  @Patch('status/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionUpdateStatus)
  updateStatusAsociacion(@Param('id', ParseIntPipe) id: number,@Body() updateMedidorAsociadoDto:UpdateMedidorAsociadoDto){
    return this.asociacionesService.updateStatus(id,updateMedidorAsociadoDto);
  }
  @Patch('gestion/:id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  updateStatusGestion(@Param('id', ParseIntPipe) id: number,@Body() updateStatusGestion:UpdateStatusGestion){
    return this.asociacionesService.updateStatusGestion(id,updateStatusGestion)
  }
  
  @Patch('planilla/:id')
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  updatePanilla(@Param('id', ParseIntPipe) id: number,@Body() updatePlanillaMedidorDto:UpdatePlanillaMedidorDto){
    return this.asociacionesService.updatePlanillaMedidor(id,updatePlanillaMedidorDto);
  }
  @Patch('planilla/:id')
  @ItemMenuProtected(ValidItemMenu.asociacionGestiones)
  updateStatusPanilla(@Param('id', ParseIntPipe) id: number,@Body() updatePlanillaMedidorDto:UpdatePlanillaMedidorDto){
    return this.asociacionesService.updateStatusPlanillaMedidor(id,updatePlanillaMedidorDto);
  }
  //ACTUALIZACION DE DATOS DE MULTA
  @Patch('multas/:id')
  updateMulta(@Param('id', ParseIntPipe) id: number,@Body() updateMultaDto:UpdateMultasVariosDto){
    return this.asociacionesService.updateMultaAsociado(id,updateMultaDto);
  }

  //SOBRE SOLICIUTED DE CORTES Y RECONECCIONES DEL SERVICIO
  @Patch('solicitar-corte/:id')
  solitudCorte(@Param('id', ParseIntPipe) id: number,@Body() motivoCorteDto:MotivoReconexionDto){
    return this.asociacionesService.solicitudCorte(id,motivoCorteDto)
  }
  @Get('corte-cancelar/:id')
  cancelarSolicitudCorte(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.cancelarCorteServicio(id);
  }
  @Patch('solicitar-reconexion/:id')
  realizarReconexion(@Param('id', ParseIntPipe) id: number,@Body() motivoReconexion:MotivoReconexionDto){
    return this.asociacionesService.realizarSolicitudReconexion(id,motivoReconexion);
  }
  @Get('reconexion-cancelar/:id')
  cancelarSolicitudReconexion(@Param('id', ParseIntPipe) id: number){
    return this.asociacionesService.cancelarReconexion(id);
  }
  @Patch(':id')
  @MenusProtected(ValidMenu.asociaciones)
  @ItemMenuProtected(ValidItemMenu.asociacionUpdate)
  updateAsociacion(@Param('id', ParseIntPipe) id: number,@Body() updst: UpdateMedidorAsociadoDto){
    return this.asociacionesService.update(id,updst);
  }
}
