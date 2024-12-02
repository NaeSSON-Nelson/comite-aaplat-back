import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import {Authentication,Authorization,AuthorizationResource, GetUser} from '../../../auth/decorators'
import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';
import { ItemMenuProtected, MenusProtected } from 'src/auth/decorators/valid-protected.decorator';
import { Usuario } from 'src/auth/modules/usuarios/entities';

@Controller('roles')
@AuthorizationResource()
@Authorization()
@Authentication()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolRegister)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolList)
  findAll(@Query() paginationDto:PaginationDto,@GetUser() user:Usuario) {
    return this.rolesService.findAll(paginationDto,user);
  }
  //TODO: SIN FUNCIONAMIENTO
  // @Get('usuario-roles/:id')
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleRegister)
  // findOneRoleWithMenus(@Param('id',ParseIntPipe) id: number) {
  //   return this.rolesService.findOneRoleWithMenus(id);
  // }
  @Get('name/:term')
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolList)
  findOneByLink(@Param('term') term:string) {
    return this.rolesService.findOneByName(term);
  }
  @Get('menus')
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolList)
  getMenusForForm() {
    return this.rolesService.getMenusForForm();
  }
  @Get(':id')
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolDetails)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }
  @Patch(':id')
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolUpdate)
  update(@Param('id',ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }
  @Patch('status/:id')
  @MenusProtected(ValidMenu.roles)
  @ItemMenuProtected(ValidItemMenu.rolUpdateStatus)
  updateStatus(@Param('id',ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRoleStatus(id, updateRoleDto);
  }
}
