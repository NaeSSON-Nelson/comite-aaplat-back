import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";

import { UsuariosService } from './usuarios.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ItemMenuProtected, MenusProtected } from 'src/auth/decorators/valid-protected.decorator';
import {Authentication,Authorization,AuthorizationResource} from '../../decorators'

import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';

import { Usuario } from './entities';
import { CreateAfiliadoDto, CreatePerfilDto, CreateUsuarioDto, UpdateAfiliadoDto, UpdatePerfilDto, UpdateUsuarioDto } from './dto';
import { SearchPerfil } from './querys/search-perfil';


@Controller('perfiles')
// @Authentication()
// @Authorization()
// @AuthorizationResource()
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
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioList)
  findAll(@Query() paginationDto:SearchPerfil) {
    return this.usuariosService.findAll(paginationDto);
  }
  @Get('user/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOneUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOneUserComplete(id);
  }

  @Get('email/:term')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  findOneUserByEmail(@Param('term') term: string) {
    return this.usuariosService.findUserByEmail(term);
  }
  //TODO: BUSCAR POR CODIGO POSTAL
  // @Get('code/:term')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  // findOneUserByPostalCode(@Param('term') term: string) {
  //   return this.usuariosService.findUserByPostalCode(term);
  // }
  
  @Get(':id')
  // @MenusProtected(ValidMenu.usuarios)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }
  @Get('roles/:id')
  findOneAuth(@Param('id',ParseIntPipe) id: number,
  @GetUser() user:Usuario,
  ) {
    return this.usuariosService.findOneUserRolesMenus(id,user);
  }
  @Patch('profile/:id')
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdateProfile)
  updateProfile(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.usuariosService.updateProfile(id, updatePerfilDto);
  }
  @Patch('asignar-roles/:id') 
  // @MenusProtected(ValidMenu.usuarios)
  // @ItemMenuProtected(ValidItemMenu.usuarioUpdate)
  asignarRoles(@Param('id',ParseIntPipe) id: number, @Body() updateUsuario: UpdateUsuarioDto) {
    return this.usuariosService.asignarRoles(id, updateUsuario);
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

  // @Get('menus/:id')
  // findMenusWidthUsuarioByRoles(@Param('id',ParseIntPipe) id:number){
  //   return this.usuariosService.findMenusWidthUsuarioByRoles(id);
  // }


  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usuariosService.remove(+id);
  // }
}
