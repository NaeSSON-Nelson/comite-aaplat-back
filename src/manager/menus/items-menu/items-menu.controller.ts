import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateItemMenuDto } from './dto/create-Item-menu.dto';
import { UpdateItemMenuDto } from './dto/update-item-menu.dto';
import { ItemsMenuService } from './items-menu.service';
import { Authentication } from '../../../auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('items-menu')
@Authentication()
export class ItemsMenuController {

  constructor(private readonly itemsMenuService: ItemsMenuService) {}
  
  @Post()
  createItemMenu(@Body() createItemMenuDto: CreateItemMenuDto) {
    return this.itemsMenuService.create(createItemMenuDto);
  }
  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.itemsMenuService.findAll(paginationDto);
  }
  @Get('link/:term')
  findOneByLink(@Param('term') term:string) {
    return this.itemsMenuService.findOneByLink(term);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsMenuService.findOne(id);
  }
  @Patch(':id')
  updateItemMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemMenuDto: UpdateItemMenuDto,
  ) {
    return this.itemsMenuService.update(id, updateItemMenuDto);
  }
  @Patch('status/:id')
  updateItemMenuStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemMenuDto: UpdateItemMenuDto,
  ) {
    return this.itemsMenuService.updateStatus(id, updateItemMenuDto);
  }
}
