import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Menu } from './entities/menu.entity';
import { And, DataSource, Like, Repository } from 'typeorm';
import { UpdateItemMenuDto } from '../items-menu/dto/update-item-menu.dto';
import { CreateItemMenuDto } from '../items-menu/dto/create-Item-menu.dto';
import { CommonService } from '../../../common/common.service';
import { ItemMenu } from '../items-menu/entities/item-menu.entity';
import { ItemToMenu } from '../items-to-menu/entities/item-to-menu.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(ItemToMenu)
    private readonly itemToMenuRepository: Repository<ItemToMenu>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async createMenu(createMenuDto: CreateMenuDto) {
    const { itemsMenu: idsItemsMenu, ...dataMenu } = createMenuDto;
    const queryRunner = this.dataSource.createQueryRunner();
    const menu = this.menuRepository.create(dataMenu);
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(menu);
      if (idsItemsMenu && idsItemsMenu.length > 0) {
        const themItemsMenu = idsItemsMenu.map((id) =>
          this.itemToMenuRepository.create({
            menuId: menu.id,
            itemMenuId: id,
          }),
        );

        await queryRunner.manager.save(themItemsMenu);
      }
      await queryRunner.commitTransaction();
      // console.log(menu);
      return {
        OK: true,
        msg: 'menu creado con exito',
        data: {
          menu,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  //TODO: MEJORAR ASIGNAR ITEMS AL MENU
  async updateMenu(idMenu: number, updateMenuDto: UpdateMenuDto) {
    const { itemsMenu, estado, ...dataMenu } = updateMenuDto;
    const menu = await this.menuRepository.preload({ id: idMenu, ...dataMenu });

    if (!menu)
      throw new NotFoundException(`El menu con Id: ${idMenu} no existe`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (itemsMenu) {
      if (itemsMenu.length === 0)
        throw new BadRequestException('No contiene ningun item para asignar');

      await queryRunner.manager.delete(ItemToMenu, { menu: { id: menu.id } });

      const thems = itemsMenu.map((id) =>
        this.itemToMenuRepository.create({
          itemMenuId: id,
          menuId: menu.id,
        }),
      );

      await queryRunner.manager.save(thems);
      // menu.itemMenu=thems;
    }
    try {
      await queryRunner.manager.save(menu);
      await queryRunner.commitTransaction();
      return {
        OK: true,
        msg: 'Items menu asignados correctamente',
        data: this.findOnePlaneMenu(menu.id),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.commonService.handbleDbErrors(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    const { '0': data, '1': size } = await this.menuRepository.findAndCount({
      where: [{ nombre: Like(`%${q}%`) }],
      skip: offset,
      take: limit,
      order: {
        id: order,
      },
    });
    return {
      OK: true,
      msg: 'Listado de Menus',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }

  async findOneMenu(id: number) {
    let menu = await this.menuRepository.findOne({
      where: { id },
      relations: { itemMenu: { itemMenu: true } },
    });
    if (!menu) throw new NotFoundException(`Menu not found with Id:${id}`);
    return {
      OK: true,
      msg: 'Menu encontrado',
      data: await this.findOnePlaneMenu(id),
    };
  }
  async findOneByLink(term: string) {
    const item = await this.menuRepository.findOne({
      where: { linkMenu:term },
      select:{linkMenu:true,id:true}
    });
    return {
      OK: true,
      msg: 'data con linkMenu',
      data: item,
    };
  }
  // findOne(id: number) {
  //   return `This action returns a #${id} menu`;
  // }

  async updateStatusMenu(id: number, updateMenuDto: UpdateMenuDto) {
    const { estado, ...dataNotPermit } = updateMenuDto;
    const menuPreload = await this.menuRepository.preload({ id, estado });

    if (!menuPreload)
      throw new NotFoundException(`Menu width id: ${id} not found`);

    try {
      await this.menuRepository.save(menuPreload);
      return {
        OK: true,
        msg: `Menu ${menuPreload.estado ? 'habilitado' : 'inhabilitado'}`,
        data: await this.findOnePlaneMenu(menuPreload.id),
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }

  async findOnePlaneMenu(id: number) {
    const { itemMenu, menu, ...data } = await this.menuRepository.findOne({
      where: { id },
      relations: { itemMenu: { itemMenu: true } },
    });
    return {
      ...data,
      itemsMenu:itemMenu.map((item) => item.itemMenu),
    };
  }
  // remove(id: number) {
  //   return `This action removes a #${id} menu`;
  // }
}
