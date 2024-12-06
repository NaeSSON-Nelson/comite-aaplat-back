import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MedidoresService } from './medidores.service';
import { CreateMedidorDto } from './dto/create-medidor.dto';
import { UpdateMedidorDto } from './dto/update-medidor.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import {
  Authentication,
  Authorization,
  AuthorizationResource,
  GetUser,
} from '../auth/decorators';
import {
  ItemMenuProtected,
  MenusProtected,
} from 'src/auth/decorators/valid-protected.decorator';
import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';
import { UpdatePlanillaMedidorDto } from '../asociaciones/dto/update-planilla-medidor.dto';
import { registerAllLecturasDto } from './dto/register-all-lecturas.dto';
import { QueryLecturasDto } from './query/queryLecturas';
import { Usuario } from 'src/auth/modules/usuarios/entities';
import { CreateTarifaPorPagarDto } from './dto/create-tarifa-por-pagar.dto';

@Controller('medidores-agua')
@AuthorizationResource()
@Authorization()
@Authentication()
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}
  //TODO: POST
  @Post()
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorRegister)
  create(@Body() createMedidoreDto: CreateMedidorDto) {
    return this.medidoresService.create(createMedidoreDto);
  }
  
  @Post('lecturas')
  @MenusProtected(ValidMenu.lecturas)
  @ItemMenuProtected(ValidItemMenu.lecturasRegistrarLecturasAfiliados)
  registerAll(@Body() registerLecturas:registerAllLecturasDto){
    return this.medidoresService.registrarAllLecturas(registerLecturas);
  }
  // @Post('comprobantes-por-pagar')
  // generarTarifasPorPagar(@Body() createTarifaPorPagarDto:CreateTarifaPorPagarDto){
  //   return this.medidoresService.generarTarfiasPorPagar(createTarifaPorPagarDto);
  // }
  //TODO: GETS
  //TODO: POR VER ¨V¨
  // @Get('afiliado')
  // medidoresAfiliado(@GetUser() user:Usuario){
  //   return this.medidoresService.listarMedidores(user.id);
  // }
  //TODO: POR VER V
  // @Get('afiliados')
  // findAllMedidoresWidthAfiliados(@Query() paginationDto: PaginationDto) {
  //   return this.medidoresService.findAllMedidoresWithAfiliados(paginationDto);
  // }
 
  
  // @Get('planillas')
  // findAllPLanillas(){
  //   return this.medidoresService.findAllPlanillasWidthMedidores();
  // }

  //TODO: POR VER 
  //TODO:V
  //TODO:V
  //TODO:V
  // @Get('planillas/:id')
  // getPlanillas(@Param('id', ParseIntPipe) id: number){
  //   return this.medidoresService.getPlanillasMedidorAsociado(id);
  // }
  
  // @ItemMenuProtected(ValidItemMenu.lecturasRegistrarLecturasAfiliados)
  @Get('gestion/anios-seguimientos')
  @MenusProtected(ValidMenu.medidores)
  aniosSeguimientos(){
    return this.medidoresService.getAniosSeguimientos();
  }
  
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorRegister)
  @Get('nro-medidor/:nro')
  findMedidorByNro(@Param('nro') nro: string) {
    return this.medidoresService.findMedidorByNro(nro);
  }
  
  @Get('lecturas/perfiles')
  @MenusProtected(ValidMenu.lecturas)
  @ItemMenuProtected(ValidItemMenu.lecturasListarAfiliadosPlanillasLecturas)
  getAllLecturas(@Query() query: QueryLecturasDto){
    return this.medidoresService.AllLecturasPerfilesMedidores(query)
  }
  @Get('lecturas/time')
  @MenusProtected(ValidMenu.lecturas)
  limiteDeRegistroLecturas(){
    return this.medidoresService.limiteTiempoRegistrosLecturas();
  }
  @MenusProtected(ValidMenu.lecturas)
  @Get('lecturas/reportes/meses')
  getMesesReportes(@Query() query: QueryLecturasDto){
    return this.medidoresService.getMesesSeguimientos(query);
  }
  @MenusProtected(ValidMenu.lecturas)
  @Get('lecturas/reportes/planillas')
  getPlanillasReportes(@Query() query: QueryLecturasDto){
    return this.medidoresService.getPlanillasRegisters(query);
  }
  
  // @Get('lecturas/comprobantes/perfiles')
  // getLecturasGenerarComprobantes(@Query() paginationDto: PaginationDto){
    //   return this.medidoresService.afiliadosPorGenerarComprobantes(paginationDto);
    // }
    @MenusProtected(ValidMenu.lecturas)
  @Get('lecturas/comprobantes/:id')
  getLecturasWidthComprobante(@Param('id', ParseIntPipe) id: number){
    return this.medidoresService.lecturaDetails(id);
  }
  @MenusProtected(ValidMenu.medidores)
  @Get('asociaciones/:id')
  getAsociacionesMedidor(@Param('id', ParseIntPipe) id:number){
    return this.medidoresService.getAsociacionesMedidor(id);
  }
  @MenusProtected(ValidMenu.medidores)
  @Get('asociacion/:id')
  getAsociacionMedidor(@Param('id', ParseIntPipe) id:number){
    return this.medidoresService.getAsociacionDetails(id);
  }
  @Get('lecturas/export/afiliados')
  @MenusProtected(ValidMenu.lecturas)
  getexportMedidorAsociadosListFilter(){
    return this.medidoresService.exportMedidorAsociadosListFilter();
  }
  @MenusProtected(ValidMenu.lecturas)
  @Get('lecturas/manzanos')
  getMazanosList(){
    return this.medidoresService.findAllManzanos();
  }
  @MenusProtected(ValidMenu.lecturas)
  @Get('lecturas/:id')
  getLecturas(@Param('id', ParseIntPipe) id: number){
    return this.medidoresService.lecturasPlanilla(id);
  }
  @MenusProtected(ValidMenu.lecturas)
  @Get(':id')
  findMedidorById(@Param('id',ParseIntPipe) id:number){
    return this.medidoresService.findMedidorById(id);
  }
  @MenusProtected(ValidMenu.lecturas)
  @ItemMenuProtected(ValidItemMenu.medidorList)
  @Get()
  findMedidores(@Query() query: PaginationDto){
    return this.medidoresService.findMedidores(query);
  }
  
  
  //TODO: PATCH - UPDATES
  @Patch(':id')
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorUpdate)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidoreDto: UpdateMedidorDto,
  ) {
    return this.medidoresService.update(id, updateMedidoreDto);
  }
  
  
  @Patch('status/:id')
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorUpdateStatus)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidoreDto: UpdateMedidorDto,
  ) {
    return this.medidoresService.updateStatus(id, updateMedidoreDto);
  }

}
