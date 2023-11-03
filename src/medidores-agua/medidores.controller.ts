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
import { CreatePlanillaMedidorDto } from './dto/create-planilla-medidor.dto';
import { UpdatePlanillaMedidorDto } from './dto/update-planilla-medidor.dto';
import { registerAllLecturasDto } from './dto/register-all-lecturas.dto';
import { QueryLecturasDto } from './query/queryLecturas';
import { Usuario } from 'src/auth/modules/usuarios/entities';

@Controller('medidores-agua')
@Authentication()
// @Authorization()
// @AuthorizationResource()
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}
  //TODO: POST
  @Post()
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorRegister)
  create(@Body() createMedidoreDto: CreateMedidorDto) {
    return this.medidoresService.create(createMedidoreDto);
  }
  
  @Post('planilla')
  createPanilla(@Body() createPlanillaMedidorDto:CreatePlanillaMedidorDto){
    return this.medidoresService.createPlanillaMedidor(createPlanillaMedidorDto);
  }
  @Post('lecturas')
  registerAll(@Body() registerLecturas:registerAllLecturasDto){
    return this.medidoresService.registrarAllLecturas(registerLecturas);
  }
  
  //TODO: GETS
  
  @Get('afiliado')
  medidoresAfiliado(@GetUser() user:Usuario){
    return this.medidoresService.listarMedidores(user.id);
  }
  
  @Get('afiliado/:id')
  findAllMedidoresOfAfiliado(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findAllMedidorOneAfiliado(id);
  }
  @Get('afiliados')
  findAllMedidoresWidthAfiliados(@Query() paginationDto: PaginationDto) {
    return this.medidoresService.findAllMedidoresWithAfiliados(paginationDto);
  }
  @Get('planillas')
  findAllPLanillas(){
    return this.medidoresService.findAllPlanillasWidthMedidores();
  }
  @Get('planillas/:id')
  getPlanillas(@Param('id', ParseIntPipe) id: number){
    return this.medidoresService.getPlanillasMedidor(id);
  }
  @Get('gestion/anios-seguimientos')
  aniosSeguimientos(){
    return this.medidoresService.getAniosSeguimientos();
  }
  
  @Get('nro-medidor/:nro')
  findMedidorByNro(@Param('nro') nro: string) {
    return this.medidoresService.findMedidorByNro(nro);
  }
  
  @Get('lecturas/perfiles')
  getAllLecturas(@Query() query: QueryLecturasDto){
    return this.medidoresService.AllLecturasPerfilesMedidores(query)
  }
  @Get('lecturas/reportes/meses')
  getMesesReportes(@Query() query: QueryLecturasDto){
    return this.medidoresService.getMesesSeguimientos(query);
  }
  @Get('lecturas/reportes/planillas')
  getPlanillasReportes(@Query() query: QueryLecturasDto){
    return this.medidoresService.getPlanillasRegisters(query);
  }
  @Get('lecturas/:id')
  getLecturas(@Param('id', ParseIntPipe) id: number){
    return this.medidoresService.lecturasPlanilla(id);
  }
  @Get('lecturas/comprobantes/perfiles')
  getLecturasGenerarComprobantes(@Query() query: QueryLecturasDto){
    return this.medidoresService.afiliadosPorGenerarComprobantes(query);
  }
  @Get('lecturas/comprobantes/:id')
  getLecturasWidthComprobante(@Param('id', ParseIntPipe) id: number){
    return this.medidoresService.lecturaDetails(id);
  }
  
  //TODO: PATCH - UPDATES
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidoreDto: UpdateMedidorDto,
  ) {
    return this.medidoresService.update(id, updateMedidoreDto);
  }

  @Patch('status/:id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidoreDto: UpdateMedidorDto,
  ) {
    return this.medidoresService.updateStatus(id, updateMedidoreDto);
  }

  @Patch('planilla/:id')
  updatePanilla(@Param('id', ParseIntPipe) id: number,@Body() updatePlanillaMedidorDto:UpdatePlanillaMedidorDto){
    return this.medidoresService.updatePlanillaMedidor(id,updatePlanillaMedidorDto);
  }
  @Patch('planilla/:id')
  updateStatusPanilla(@Param('id', ParseIntPipe) id: number,@Body() updatePlanillaMedidorDto:UpdatePlanillaMedidorDto){
    return this.medidoresService.updateStatusPlanillaMedidor(id,updatePlanillaMedidorDto);
  }
}
