import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { CreateItemMenuDto } from './dto/create-Item-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CommonService } from '../../../common/common.service';
import { UpdateItemMenuDto } from './dto/update-item-menu.dto';
import { ItemMenu } from './entities/item-menu.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class ItemsMenuService {
  constructor(
    @InjectRepository(ItemMenu)
    private readonly itemsMenuRepository: Repository<ItemMenu>,
    private readonly commonService: CommonService,
  ) {}

  async create(createItemMenuDto: CreateItemMenuDto) {
    const itemMenu = this.itemsMenuRepository.create(createItemMenuDto);
    try {
      await this.itemsMenuRepository.save(itemMenu);
      return {
        OK: true,
        message: 'Item de menu creado correctamente',
        itemMenu,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const { offset = 0, limit = 10, order = 'ASC', q = '' } = paginationDto;
    //todo: parameters
    const { '0': data, '1': size } =
      await this.itemsMenuRepository.findAndCount({
        where: [{ nombre: Like(`%${q}%`) }],
        skip: offset,
        take: limit,
        order: {
          id: order,
        },
      });
    return {
      OK: true,
      message: 'Listado de items de Menu',
      data: {
        data,
        size,
        offset,
        limit,
        order,
      },
    };
  }
  async findOne(id: number) {
    const item = await this.itemsMenuRepository.findOneBy({ id });
    if (!item)
      throw new NotFoundException(`El Item con ID: ${id} no se encontró`);
    return {
      OK: true,
      message: 'Item Menu encontrado',
      data: item,
    };
  }

  async findOneByLink(term: string) {
    const item = await this.itemsMenuRepository.findOne({
      where: { linkMenu:term },
      select:{linkMenu:true,id:true}
    });
    return {
      OK: true,
      message: 'data con linkMenu',
      data: item,
    };
  }
  async update(id: number, updateItemMenuDto: UpdateItemMenuDto) {
    const { estado, ...dataMenu } = updateItemMenuDto;
    const itemMenuPreload = await this.itemsMenuRepository.preload({
      id,
      ...dataMenu,
    });
    if (!itemMenuPreload)
      throw new NotFoundException(`Item Menu width id ${id} not found`);
    try {
      await this.itemsMenuRepository.save(itemMenuPreload);
      return {
        OK: true,
        message: 'menu item actualizado',
        data: itemMenuPreload,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async updateStatus(id: number, updateItemMenuDto: UpdateItemMenuDto) {
    const { estado } = updateItemMenuDto;
    const itemMenuPreload = await this.itemsMenuRepository.preload({
      id,
      estado,
    });

    if (!itemMenuPreload)
      throw new NotFoundException(`Menu width id: ${id} not found`);

    try {
      await this.itemsMenuRepository.save(itemMenuPreload);
      return {
        OK: true,
        message: `Menu ${itemMenuPreload.estado ? 'habilitado' : 'inhabilitado'}`,
        data: itemMenuPreload,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
}
