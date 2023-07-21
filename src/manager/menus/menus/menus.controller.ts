import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ValidRole } from 'src/interfaces/valid-auth.enum';
import { Authentication } from '../../../auth/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('menus')
@Authentication()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.createMenu(createMenuDto);
  }


  @Get()
  findAll(@Query() paginationDto:PaginationDto) {
    return this.menusService.findAll(paginationDto);
  }
  @Get('link/:term')
  findOneByLink(@Param('term') term:string) {
    return this.menusService.findOneByLink(term);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.menusService.findOneMenu(id);
  }
  
 

  @Patch(':id')
  updateMenu(@Param('id',ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.updateMenu(id, updateMenuDto);
  }
  

  @Patch('status/:id')
  updateMenuStatus(
    @Param('id',ParseIntPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.updateStatusMenu(+id, updateMenuDto);
  }
  
 
}
