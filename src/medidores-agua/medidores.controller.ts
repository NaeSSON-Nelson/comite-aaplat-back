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
import { Authentication } from '../auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('medidores')
@Authentication()
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}

  @Post()
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
  findAll() {
    return this.medidoresService.findAll();
  }

  @Get('afiliados')
  findAllMedidoresWidthAfiliados() {
    return this.medidoresService.findAllMedidoresWithAfiliados();
  }
  @Get('lecturas')
  findAllLecturas() {
    return this.medidoresService.findAllLecturas();
  }
  @Get('barrio')
  findAllMedidoresbyBarrio(@Query() paginationDto: PaginationDto) {
    return this.medidoresService.findMedidoresWithAfiliadoByBarrio(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findOne(id);
  }

  @Get('afiliado/:id')
  findAllMedidoresOfAfiliado(@Param('id', ParseIntPipe) id: number) {
    return this.medidoresService.findAllMedidorOneAfiliado(id);
  }

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
}
