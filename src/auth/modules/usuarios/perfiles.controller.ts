import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";

import { PerfilesService } from './perfiles.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ItemMenuProtected, MenusProtected, RoleProtected } from 'src/auth/decorators/valid-protected.decorator';
import {Authentication,Authorization,AuthorizationResource} from '../../decorators'

import { ValidItemMenu, ValidMenu, ValidRole } from 'src/interfaces/valid-auth.enum';

import { Usuario } from './entities';
import { CreateAfiliadoDto, CreatePerfilDto, CreateUsuarioDto, UpdateAfiliadoDto, UpdatePerfilDto, UpdateUsuarioDto } from './dto';
import { SearchPerfil } from './querys/search-perfil';


@Controller('perfiles')
// @Authorization()
// @AuthorizationResource()
@Authentication()
export class PerfilController {
  constructor(private readonly perfilService: PerfilesService) {}

  @Post()
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  create(@Body() createPerfilDto: CreatePerfilDto) {
    return this.perfilService.create(createPerfilDto);
  }
  @Post('afiliado/:id')
  createAfiliado(@Param('id',ParseIntPipe) id: number, @Body() createAfiliadoDto: CreateAfiliadoDto){
    return this.perfilService.createAfiliado(id,createAfiliadoDto);
  }

  @Post('usuario/:id')
  createUsuario(@Param('id',ParseIntPipe) id: number, @Body() createUsuarioDto: CreateUsuarioDto){
    return this.perfilService.createUsuario(id,createUsuarioDto);
  }

  @Get()
  @RoleProtected(ValidRole.admin,ValidRole.administrativo)
  @MenusProtected(ValidMenu.perfiles)
  // @ItemMenuProtected(ValidItemMenu.usuarioList)
  findAll(@Query() paginationDto:SearchPerfil) {
    return this.perfilService.findAll(paginationDto);
  }
  @Get('usuario/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOnePerfilUser(@Param('id',ParseIntPipe) id: number) {
    return this.perfilService.findOnePerfilUsuario(id);
  }
  @Get('afiliado/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOnePerfilAfiliado(@Param('id',ParseIntPipe) id: number) {
    return this.perfilService.findOnePerfilAfiliado(id);
  }


  @Get('usuario/email/:term')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  findOneUserByEmail(@Param('term') term: string) {
    return this.perfilService.findUserByEmail(term);
  }
  
  @Get(':id')
  // @MenusProtected(ValidMenu.perfilservice)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.perfilService.findOne(id);
  }
  
  
  @Patch('usuario/roles/:id') 
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdate)
  asignarRoles(@Param('id',ParseIntPipe) id: number, @Body() updateUsuario: UpdateUsuarioDto) {
    return this.perfilService.updateRolesUser(id, updateUsuario);
  }

  @Patch('afiliado/:id')
  updateAfiliado(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoDto: UpdateAfiliadoDto){
    return this.perfilService.updateAfiliado(id,updateAfiliadoDto);
  }

  @Patch('usuario/:id')
  updateUsuario(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto){
    return this.perfilService.updateUsuario(id,updateUsuarioDto);
  }
  @Patch('status/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.perfilServicetatus)
  updatePerfilStatus(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfilService.updateStatus(id, updatePerfilDto);
  }
  @Patch('usuario/status/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.perfilServicetatus)
  updatePerfilServicetatus(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.perfilService.updateProfile(id, updateUsuarioDto);
  }
  @Patch('afiliado/status/:id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.perfilServicetatus)
  updateAfiliadoStatus(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.perfilService.updateAfiliadoStatus(id, updateAfiliadoDto);
  }
  @Patch(':id')
  // @MenusProtected(ValidMenu.perfilservice)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdateProfile)
  updateProfile(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfilService.updateProfile(id, updatePerfilDto);
  }
  // @Get('menus/:id')
  // findMenusWidthUsuarioByRoles(@Param('id',ParseIntPipe) id:number){
  //   return this.perfilService.findMenusWidthUsuarioByRoles(id);
  // }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.perfilService.remove(+id);
  // }
}
