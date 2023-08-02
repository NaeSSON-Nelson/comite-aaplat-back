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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {Authentication,Authorization,AuthorizationResource} from '../../../auth/decorators'
import { ItemMenuProtected, MenusProtected } from '../../../auth/decorators/valid-protected.decorator';
import { ValidItemMenu, ValidMenu } from 'src/interfaces/valid-auth.enum';
@Controller('menus')

@Authentication()
// @Authorization()
// @AuthorizationResource()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  // @MenusProtected(ValidMenu.menus)
  // @ItemMenuProtected(ValidItemMenu.menuRegister)
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.createMenu(createMenuDto);
  }


  @Get()
  // @MenusProtected(ValidMenu.menus)
  // @ItemMenuProtected(ValidItemMenu.menuList)
  findAll(@Query() paginationDto:PaginationDto) {
    return this.menusService.findAll(paginationDto);
  }
  @Get('link/:term')
  // @MenusProtected(ValidMenu.menus)
  // @ItemMenuProtected(ValidItemMenu.menuRegister)
  findOneByLink(@Param('term') term:string) {
    return this.menusService.findOneByLink(term);
  }

  @Get(':id')
  // @MenusProtected(ValidMenu.menus)
  // @ItemMenuProtected(ValidItemMenu.menuDetails)
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.menusService.findOneMenu(id);
  }
  
 

  @Patch(':id')
  // @MenusProtected(ValidMenu.menus)
  // @ItemMenuProtected(ValidItemMenu.menuUpdate)
  updateMenu(@Param('id',ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.updateMenu(id, updateMenuDto);
  }
  

  @Patch('status/:id')
  // @MenusProtected(ValidMenu.menus)
  // @ItemMenuProtected(ValidItemMenu.menuStatus)
  updateMenuStatus(
    @Param('id',ParseIntPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.updateStatusMenu(+id, updateMenuDto);
  }
  
 
}
