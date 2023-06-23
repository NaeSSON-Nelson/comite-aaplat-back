import { Controller, Get, Post, Body, Patch, Param, Delete,ParseIntPipe } from '@nestjs/common';
import { MedidoresService } from './medidores.service';
import { CreateMedidorDto } from './dto/create-medidor.dto';
import { UpdateMedidorDto } from './dto/update-medidor.dto';
import { CreateLecturaMedidorDto } from './dto/create-lectura-medidor.dto';
import { RegistrarLecturasDto } from './dto/registrar-lecturas.dto';

@Controller('medidores')
export class MedidoresController {
  constructor(private readonly medidoresService: MedidoresService) {}

  @Post()
  create(@Body() createMedidoreDto: CreateMedidorDto) {
    return this.medidoresService.create(createMedidoreDto);
  }
  @Post()
  registrarLectura(@Body() createLecturaMedidorDto: CreateLecturaMedidorDto) {
    return this.medidoresService.registerLectura(createLecturaMedidorDto);
  }
  @Post()
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

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.medidoresService.findOne(id);
  }
  @Get('afiliado/:id')
  findAllMedidoresOfAfiliado(@Param('id',ParseIntPipe) id: number) {
    return this.medidoresService.findAllMedidorOneAfiliado(id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateMedidoreDto: UpdateMedidorDto) {
    return this.medidoresService.update(id, updateMedidoreDto);
  }

  @Patch('status/:id')
  updateStatus(@Param('id',ParseIntPipe) id: number,@Body() updateMedidoreDto: UpdateMedidorDto) {
    return this.medidoresService.updateStatus(id,updateMedidoreDto);
  }
}
