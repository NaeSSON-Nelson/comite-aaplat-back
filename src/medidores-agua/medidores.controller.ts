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
import { CreateLecturaMedidorDto } from './dto/create-lectura-medidor.dto';
import { RegistrarLecturasDto } from './dto/registrar-lecturas.dto';
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

@Controller('medidores')
@Authentication()
@Authorization()
@AuthorizationResource()
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}

  @Post()
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorRegister)
  create(@Body() createMedidoreDto: CreateMedidorDto) {
    return this.medidoresService.create(createMedidoreDto);
  }
  @Post('lectura')
  registrarLectura(@Body() createLecturaMedidorDto: CreateLecturaMedidorDto) {
    return this.medidoresService.registerLectura(createLecturaMedidorDto);
  }
  @Post('lecturas')
  registrarLecturas(@Body() registrarLecturas: RegistrarLecturasDto) {
    return this.medidoresService.registrarLecturas(registrarLecturas);
  }

  @Get()
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorList)
  findAll() {
    return this.medidoresService.findAll();
  }

  @Get('afiliados')
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorList)
  findAllMedidoresWidthAfiliados(@Query() paginationDto: PaginationDto) {
    return this.medidoresService.findAllMedidoresWithAfiliados(paginationDto);
  }
  @Get('lecturas')
  findAllLecturas() {
    return this.medidoresService.findAllLecturas();
  }
  @Get('barrio')
  findAllMedidoresbyBarrio(@Query() paginationDto: PaginationDto) {
    return this.medidoresService.findMedidoresWithAfiliadoByBarrio(
      paginationDto,
    );
  }
  @Get('nro-medidor/:nro')
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorRegister)
  findMedidorByNro(@Param('nro') nro: string) {
    return this.medidoresService.findMedidorByNro(nro);
  }

  @Get(':id')
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorDetails)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findOne(id);
  }

  @Get('afiliado/:id')
  @MenusProtected(ValidMenu.medidores)
  @ItemMenuProtected(ValidItemMenu.medidorDetails)
  findAllMedidoresOfAfiliado(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findAllMedidorOneAfiliado(id);
  }

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

  //TODO: SERVIRA ESTE CONTROLADOR?
  // @Get('find/afiliado/:id')
  // findAfiliadoByMedidores(@Param('id', ParseIntPipe) id: number){
  //   return this.medidoresService.findAfiliadoByMedidores(id);

  // }
}
