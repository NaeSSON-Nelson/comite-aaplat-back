import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

import {Authentication,Authorization,AuthorizationResource} from '../../../auth/decorators'
import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';
import { ItemMenuProtected, MenusProtected } from 'src/auth/decorators/valid-protected.decorator';
@Controller('roles')

// @Authentication()
// @Authorization()
// @AuthorizationResource()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleRegister)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleList)
  findAll(@Query() paginationDto:PaginationDto) {
    return this.rolesService.findAll(paginationDto);
  }
  //TODO: SIN FUNCIONAMIENTO
  // @Get('usuario-roles/:id')
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleRegister)
  // findOneRoleWithMenus(@Param('id',ParseIntPipe) id: number) {
  //   return this.rolesService.findOneRoleWithMenus(id);
  // }

  @Get('name/:term')
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleRegister)
  findOneByLink(@Param('term') term:string) {
    return this.rolesService.findOneByName(term);
  }
  @Get(':id')
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleDetails)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }
  @Patch(':id')
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleUpdate)
  update(@Param('id',ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }
  @Patch('status/:id')
  // @MenusProtected(ValidMenu.roles)
  // @ItemMenuProtected(ValidItemMenu.roleUpdateStatus)
  updateStatus(@Param('id',ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRoleStatus(id, updateRoleDto);
  }
}
