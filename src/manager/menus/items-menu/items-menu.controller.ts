import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateItemMenuDto } from './dto/create-Item-menu.dto';
import { UpdateItemMenuDto } from './dto/update-item-menu.dto';
import { ItemsMenuService } from './items-menu.service';

@Controller('items-menu')
export class ItemsMenuController {

  constructor(private readonly itemsMenuService: ItemsMenuService) {}
  
  @Post('')
  createItemMenu(@Body() createItemMenuDto: CreateItemMenuDto) {
    return this.itemsMenuService.create(createItemMenuDto);
  }
  @Get('')
  findAll() {
    //TODO: AÑADIR PARAMETROS DE BUSQUEDA
    return this.itemsMenuService.findAll();
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
