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

@Controller('medidores-agua')
@Authentication()
// @Authorization()
// @AuthorizationResource()
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}
  
  @Post()
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorRegister)
  create(@Body() createMedidoreDto: CreateMedidorDto) {
    return this.medidoresService.create(createMedidoreDto);
  }
  
  @Get()
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorList)
  findAll() {
    return this.medidoresService.findAll();
  }

  @Get('afiliados')
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorList)
  findAllMedidoresWidthAfiliados(@Query() paginationDto: PaginationDto) {
    return this.medidoresService.findAllMedidoresWithAfiliados(paginationDto);
  }
  // @Get('barrio')
  // findAllMedidoresbyBarrio(@Query() paginationDto: PaginationDto) {
  //   return this.medidoresService.findMedidoresWithAfiliadoByBarrio(
  //     paginationDto,
  //   );
  // }
  @Get('nro-medidor/:nro')
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorRegister)
  findMedidorByNro(@Param('nro') nro: string) {
    return this.medidoresService.findMedidorByNro(nro);
  }
  @Get('planillas')
  findAllPLanillas(){
    return this.medidoresService.findAllPlanillasWidthMedidores();
  }
  @Get(':id')
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorDetails)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findOne(id);
  }

  @Get('afiliado/:id')
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorDetails)
  findAllMedidoresOfAfiliado(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findAllMedidorOneAfiliado(id);
  }

  @Patch(':id')
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorUpdate)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidoreDto: UpdateMedidorDto,
  ) {
    return this.medidoresService.update(id, updateMedidoreDto);
  }

  @Patch('status/:id')
  // @MenusProtected(ValidMenu.medidores)
  // @ItemMenuProtected(ValidItemMenu.medidorUpdateStatus)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMedidoreDto: UpdateMedidorDto,
  ) {
    return this.medidoresService.updateStatus(id, updateMedidoreDto);
  }

  //TODO: SERVIRA ESTE CONTROLADOR?
  // @Get('find/afiliado/:id')
  // findAfiliadoByMedidores(@Param('id', ParseIntPipe) id: number){
  //   return this.medidoresService.findAfiliadoByMedidores(id);

  // }


  //TODO: CRUD DE PLANILLAS DE LECTURA
  
  @Post('planilla')
  createPanilla(@Body() createPlanillaMedidorDto:CreatePlanillaMedidorDto){
    return this.medidoresService.createPlanillaMedidor(createPlanillaMedidorDto);
  }
  @Patch('planilla/:id')
  updatePanilla(@Param('id', ParseIntPipe) id: number,@Body() updatePlanillaMedidorDto:UpdatePlanillaMedidorDto){
    return this.medidoresService.updatePlanillaMedidor(id,updatePlanillaMedidorDto);
  }
  @Patch('planilla/:id')
  updateStatusPanilla(@Param('id', ParseIntPipe) id: number,@Body() updatePlanillaMedidorDto:UpdatePlanillaMedidorDto){
    return this.medidoresService.updateStatusPlanillaMedidor(id,updatePlanillaMedidorDto);
  }

  //TODO: LECTURAS DE MEDIDORES

  @Post('lecturas')
  registerAll(@Body() registerLecturas:registerAllLecturasDto){
    return this.medidoresService.registrarAllLecturas(registerLecturas);
  }
  @Get('lecturas/perfiles')
  getAllLecturas(@Query() query: QueryLecturasDto){
    return this.medidoresService.AllLecturasPerfilesMedidores(query)
  }
}
