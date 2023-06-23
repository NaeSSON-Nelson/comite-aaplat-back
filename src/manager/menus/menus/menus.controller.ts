import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ValidRole } from 'src/interfaces/valid-auth.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.createMenu(createMenuDto);
  }


  @Get()
  findAll() {
    //TODO: AÑADIR PARAMETROS DE BUSQUEDA
    return this.menusService.findAll();
  }
 

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.menusService.findOneMenu(+id);
  }
  
 

  @Patch(':id')
  updateMenu(@Param('id',ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.updateMenu(id, updateMenuDto);
  }
  

  @Patch('status/:id')
  updateMenuStatus(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.updateStatusMenu(+id, updateMenuDto);
  }
  
 
}
