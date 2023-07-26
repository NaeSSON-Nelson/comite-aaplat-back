import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';

import { AfiliadosService } from './afiliados.service';

import { CreateAfiliadoDto } from './dto/create-afiliado.dto';
import { UpdateAfiliadoDto } from './dto/update-afiliado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { ValidItemMenu, ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';

import { ItemMenuProtected, MenusProtected, RoleProtected } from '../../decorators/valid-protected.decorator';
import {Authentication,Authorization,AuthorizationResource} from '../../decorators'


@Authentication()
@Authorization()
@AuthorizationResource()
@Controller('afiliados')
export class AfiliadosController {
  constructor(private readonly afiliadosService: AfiliadosService) {}
  
  @Post()
  @MenusProtected(ValidMenu.afiliados)
  @ItemMenuProtected(ValidItemMenu.afiliadoRegister)
  create(@Body() createAfiliadoDto: CreateAfiliadoDto) {
    return this.afiliadosService.create(createAfiliadoDto);
  }
  
  @Get()
  @MenusProtected(ValidMenu.afiliados)
  @ItemMenuProtected(ValidItemMenu.afiliadoList)
  findAll(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findAll(paginationDto);
  }
  @Get('ci')
  @MenusProtected(ValidMenu.afiliados)
  @ItemMenuProtected(ValidItemMenu.afiliadoRegister)
  findCiAfiliado(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findByCi(paginationDto);
  }
  @Get('usuarios')
  @MenusProtected(ValidMenu.afiliados)
  findAllAfiliadosSinUsuario(@Query() paginationDto:PaginationDto) {
    return this.afiliadosService.findAllAfiliadosUnAsignedUser(paginationDto);
  }

  @Get(':id')
  @MenusProtected(ValidMenu.afiliados)
  @ItemMenuProtected(ValidItemMenu.afiliadoDetails)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.afiliadosService.findOne(id);
  }

  @Patch(':id')
  @MenusProtected(ValidMenu.afiliados)
  @ItemMenuProtected(ValidItemMenu.afiliadoUpdate)
  update(@Param('id',ParseIntPipe) id: string, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadosService.update(+id, updateAfiliadoDto);
  }

  @Patch('status/:id')
  @MenusProtected(ValidMenu.afiliados)
  @ItemMenuProtected(ValidItemMenu.afiliadoStatus)
  updateStatus(@Param('id',ParseIntPipe) id:string,@Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.afiliadosService.updateStatus(+id,updateAfiliadoDto);
  }
}
