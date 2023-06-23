import { Injectable } from '@nestjs/common';
import {  NotFoundException} from "@nestjs/common/exceptions";
import { CreateItemMenuDto } from './dto/create-Item-menu.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from '../../../common/common.service';
import { UpdateItemMenuDto } from './dto/update-item-menu.dto';
import { ItemMenu } from './entities/item-menu.entity';

@Injectable()
export class ItemsMenuService {
    constructor(
        @InjectRepository(ItemMenu)
        private readonly itemsMenuRepository:Repository<ItemMenu>,
        private readonly commonService:CommonService
    ){

    }

    
  async create(createItemMenuDto: CreateItemMenuDto) {
    const itemMenu = this.itemsMenuRepository.create(createItemMenuDto);
    try {
      await this.itemsMenuRepository.save(itemMenu);
      return {
        OK: true,
        msg: 'Item de menu creado correctamente',
        itemMenu,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async findAll() {
    try {
        //todo: parameters
      const itemsMenu = await this.itemsMenuRepository.find();
      return {
        OK: true,
        msg: 'Items de menus',
        data: itemsMenu,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
  async findOne(id: number) {
    const item = await this.itemsMenuRepository.findOneBy({ id });
    if (!item)
      throw new NotFoundException(`El Item con ID: ${id} no se encontró`);
    return {
      OK: true,
      msg: 'Item Menu encontrado',
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
        msg: 'menu item actualizado',
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
        msg: `Menu ${itemMenuPreload.estado ? 'habilitado' : 'inhabilitado'}`,
        data: itemMenuPreload,
      };
    } catch (error) {
      this.commonService.handbleDbErrors(error);
    }
  }
}
