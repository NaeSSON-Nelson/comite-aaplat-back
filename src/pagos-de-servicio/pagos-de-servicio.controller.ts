import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagosDeServicioService } from './pagos-de-servicio.service';
import { CreatePagosDeServicioDto } from './dto/create-pagos-de-servicio.dto';
import { UpdatePagosDeServicioDto } from './dto/update-pagos-de-servicio.dto';

@Controller('pagos-de-servicio')
export class PagosDeServicioController {
  constructor(private readonly pagosDeServicioService: PagosDeServicioService) {}

  @Post()
  create(@Body() createPagosDeServicioDto: CreatePagosDeServicioDto) {
    return this.pagosDeServicioService.create(createPagosDeServicioDto);
  }

  @Get()
  findAll() {
    return this.pagosDeServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagosDeServicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagosDeServicioDto: UpdatePagosDeServicioDto) {
    return this.pagosDeServicioService.update(+id, updatePagosDeServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagosDeServicioService.remove(+id);
  }
}
