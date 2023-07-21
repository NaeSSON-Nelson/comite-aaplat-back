import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { Authentication } from '../../decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from './entities';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('usuarios')
@Authentication()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('create')
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.usuariosService.findAll(paginationDto);
  }
  @Get('user/:id')
  findOneUser(@Param('id',ParseIntPipe) id: number) {
    return this.usuariosService.findOneUserComplete(id);
  }

  @Get('email/:term')
  findOneUserByEmail(@Param('term') term: string) {
    return this.usuariosService.findUserByEmail(term);
  }
  @Get('code/:term')
  findOneUserByPostalCode(@Param('term') term: string) {
    return this.usuariosService.findUserByPostalCode(term);
  }
  
  @Get(':id')
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
  updateProfile(@Param('id',ParseIntPipe) id: number, @Body() updatePerfilUsuarioDto: UpdatePerfilUsuarioDto) {
    return this.usuariosService.updateProfile(id, updatePerfilUsuarioDto);
  }
  @Patch('asignar-roles/:id')
  asignRoles(@Param('id',ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.asignarRoles(id, updateUsuarioDto);
  }
  @Patch('status/:id')
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
