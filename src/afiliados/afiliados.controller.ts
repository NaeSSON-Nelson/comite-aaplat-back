import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';

@Controller('afiliados')
export class AfiliadosController {
  constructor(private readonly afiliadosService: AfiliadosService) {}

  @Post()
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadosService.create(createAfiliadoDto);
  }

  @Get()
  findAll() {
    return this.afiliadosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.afiliadosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadosService.update(+id, updateAfiliadoDto);
  }

  @Patch('status/:id')
  updateStatus(@Param('id') id:string,@Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadosService.updateStatus(+id,updateAfiliadoDto);
  }
}
