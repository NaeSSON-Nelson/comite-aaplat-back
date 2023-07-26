import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";

import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ItemMenuProtected, MenusProtected } from 'src/auth/decorators/valid-protected.decorator';
import {Authentication,Authorization,AuthorizationResource} from '../../decorators'

import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';

import { Usuario } from './entities';


@Controller('usuarios')
@Authentication()
@Authorization()
@AuthorizationResource()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('create')
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioList)
  findAll(@Query() paginationDto:PaginationDto) {
    return this.usuariosService.findAll(paginationDto);
  }
  @Get('user/:id')
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioDetails)
  findOneUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOneUserComplete(id);
  }

  @Get('email/:term')
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  findOneUserByEmail(@Param('term') term: string) {
    return this.usuariosService.findUserByEmail(term);
  }
  @Get('code/:term')
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioRegister)
  findOneUserByPostalCode(@Param('term') term: string) {
    return this.usuariosService.findUserByPostalCode(term);
  }
  
  @Get(':id')
  @MenusProtected(ValidMenu.usuarios)
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
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioUpdateProfile)
  updateProfile(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilUsuarioDto: UpdatePerfilUsuarioDto) {
    return this.usuariosService.updateProfile(id, updatePerfilUsuarioDto);
  }
  @Patch('asignar-roles/:id') 
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioUpdate)
  asignRoles(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.asignarRoles(id, updateUsuarioDto);
  }
  @Patch('status/:id')
  @MenusProtected(ValidMenu.usuarios)
  @ItemMenuProtected(ValidItemMenu.usuarioStatus)
  updateStatus(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.updateStatus(id, updateUsuarioDto);
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
