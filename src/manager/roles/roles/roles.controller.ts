import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import {  ParseIntPipe} from "@nestjs/common/pipes";
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Authentication } from '../../../auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';


@Controller('roles')
@Authentication()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.rolesService.findAll(paginationDto);
  }
  @Get('usuario-roles/:id')
  findOneRoleWithMenus(@Param('id',ParseIntPipe) id: number) {
    return this.rolesService.findOneRoleWithMenus(id);
  }

  @Get('name/:term')
  findOneByLink(@Param('term') term:string) {
    return this.rolesService.findOneByName(term);
  }
  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }
  @Patch('status/:id')
  updateStatus(@Param('id',ParseIntPipe) id: number, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.updateRoleStatus(id, updateRoleDto);
  }
}
