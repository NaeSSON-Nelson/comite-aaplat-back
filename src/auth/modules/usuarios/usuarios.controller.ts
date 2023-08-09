import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";

import { UsuariosService } from './usuarios.service';
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
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  create(@Body() createPerfilDto: CreatePerfilDto) {
    return this.usuariosService.create(createPerfilDto);
  }
  @Post('afiliado/:id')
  createAfiliado(@Param('id',ParseIntPipe) id: number, @Body() createAfiliadoDto: CreateAfiliadoDto){
    return this.usuariosService.createAfiliado(id,createAfiliadoDto);
  }

  @Post('usuario/:id')
  createUsuario(@Param('id',ParseIntPipe) id: number, @Body() createUsuarioDto: CreateUsuarioDto){
    return this.usuariosService.createUsuario(id,createUsuarioDto);
  }

  @Get()
  @RoleProtected(ValidRole.admin,ValidRole.administrativo)
  @MenusProtected(ValidMenu.perfiles)
  // @ItemMenuProtected(ValidItemMenu.usuarioList)
  findAll(@Query() paginationDto:SearchPerfil) {
    return this.usuariosService.findAll(paginationDto);
  }
  @Get('usuario/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOnePerfilUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOnePerfilUsuario(id);
  }
  @Get('afiliado/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOnePerfilAfiliado(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOnePerfilAfiliado(id);
  }


  @Get('usuario/email/:term')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  findOneUserByEmail(@Param('term') term: string) {
    return this.usuariosService.findUserByEmail(term);
  }
  
  @Get(':id')
  // @MenusProtected(ValidMenu.usuarios)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }
  
  
  @Patch('usuario/roles/:id') 
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdate)
  asignarRoles(@Param('id',ParseIntPipe) id: number, @Body() updateUsuario: UpdateUsuarioDto) {
    return this.usuariosService.updateRolesUser(id, updateUsuario);
  }

  @Patch('afiliado/:id')
  updateAfiliado(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoDto: UpdateAfiliadoDto){
    return this.usuariosService.updateAfiliado(id,updateAfiliadoDto);
  }

  @Patch('usuario/:id')
  updateUsuario(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto){
    return this.usuariosService.updateUsuario(id,updateUsuarioDto);
  }
  @Patch('status/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioStatus)
  updatePerfilStatus(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.usuariosService.updateStatus(id, updatePerfilDto);
  }
  @Patch('usuario/status/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioStatus)
  updateUsuarioStatus(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.updateUsuarioStatus(id, updateUsuarioDto);
  }
  @Patch('afiliado/status/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioStatus)
  updateAfiliadoStatus(@Param('id',ParseIntPipe) id: number, @Body() updateAfiliadoDto: UpdateAfiliadoDto) {
    return this.usuariosService.updateAfiliadoStatus(id, updateAfiliadoDto);
  }
  @Patch(':id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdateProfile)
  updateProfile(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.usuariosService.updateProfile(id, updatePerfilDto);
  }
  // @Get('menus/:id')
  // findMenusWidthUsuarioByRoles(@Param('id',ParseIntPipe) id:number){
  //   return this.usuariosService.findMenusWidthUsuarioByRoles(id);
  // }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usuariosService.remove(+id);
  // }
}
