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
  
  @Post()
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuRegister)
  createItemMenu(@Body() createItemMenuDto: CreateItemMenuDto) {
    return this.itemsMenuService.create(createItemMenuDto);
  }
  @Get()
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuList)
  findAll(@Query() paginationDto:PaginationDto) {
    return this.itemsMenuService.findAll(paginationDto);
  }
  @Get('link/:term')
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuRegister)
  findOneByLink(@Param('term') term:string) {
    return this.itemsMenuService.findOneByLink(term);
  }
  @Get(':id')
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuDetails)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsMenuService.findOne(id);
  }
  @Patch(':id')
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuUpdate)
  updateItemMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemMenuDto: UpdateItemMenuDto,
  ) {
    return this.itemsMenuService.update(id, updateItemMenuDto);
  }
  @Patch('status/:id')
  // @MenusProtected(ValidMenu.itemsMenu)
  // @ItemMenuProtected(ValidItemMenu.itemMenuStatus)
  updateItemMenuStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemMenuDto: UpdateItemMenuDto,
  ) {
    return this.itemsMenuService.updateStatus(id, updateItemMenuDto);
  }
}
