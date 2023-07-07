import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AfiliadosService } from './afiliados.service';
import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { Authentication } from '../../decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('afiliados')
@Authentication()
export class AfiliadosController {
  constructor(private readonly afiliadosService: AfiliadosService) {}

  @Post()
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadosService.create(createAfiliadoDto);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findAll(paginationDto);
  }
  @Get('usuarios')
  findAllAfiliadosSinUsuario(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findAllAfiliadosUnAsignedUser();
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Query() paginationDto:PaginationDto) {
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
