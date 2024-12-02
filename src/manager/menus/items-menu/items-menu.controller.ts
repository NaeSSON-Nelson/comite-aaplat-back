import { Controller, Post, Body, Get, Param, Patch, Query } from '@nestjs/common';
import { ParseIntPipe } from '@nestjs/common/pipes';
import { CreateItemMenuDto } from './dto/create-Item-menu.dto';
import { UpdateItemMenuDto } from './dto/update-item-menu.dto';
import { ItemsMenuService } from './items-menu.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {Authentication,Authorization,AuthorizationResource} from '../../../auth/decorators'
import { ValidItemMenu, ValidMenu } from '../../../interfaces/valid-auth.enum';
import { ItemMenuProtected, MenusProtected } from '../../../auth/decorators/valid-protected.decorator';

@Controller('items-menu')
@Authentication()
// @Authorization()
// @AuthorizationResource()
export class ItemsMenuController {

  constructor(private readonly itemsMenuService: ItemsMenuService) {}
  
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuRegister)
  // @Post()
  // createItemMenu(@Body() createItemMenuDto: CreateItemMenuDto) {
  //   return this.itemsMenuService.create(createItemMenuDto);
  // }
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuList)
  // @Get()
  // findAll(@Query() paginationDto:PaginationDto) {
  //   return this.itemsMenuService.findAll(paginationDto);
  // }
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuRegister)
  // @Get('link/:term')
  // findOneByLink(@Param('term') term:string) {
  //   return this.itemsMenuService.findOneByLink(term);
  // }
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuDetails)
  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.itemsMenuService.findOne(id);
  // }
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuUpdate)
  // @Patch(':id')
  // updateItemMenu(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateItemMenuDto: UpdateItemMenuDto,
  // ) {
  //   return this.itemsMenuService.update(id, updateItemMenuDto);
  // }
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuStatus)
  // @Patch('status/:id')
  // updateItemMenuStatus(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateItemMenuDto: UpdateItemMenuDto,
  // ) {
  //   return this.itemsMenuService.updateStatus(id, updateItemMenuDto);
  // }
}
