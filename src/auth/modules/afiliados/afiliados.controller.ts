import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
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
  @Get('ci')
  findCiAfiliado(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findByCi(paginationDto);
  }
  @Get('usuarios')
  findAllAfiliadosSinUsuario(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findAllAfiliadosUnAsignedUser(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: string,@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: string, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadosService.update(+id, updateAfiliadoDto);
  }

  @Patch('status/:id')
  updateStatus(@Param('id',ParseIntPipe) id:string,@Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadosService.updateStatus(+id,updateAfiliadoDto);
  }
}
