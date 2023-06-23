import { Estado } from 'src/interfaces/Entityes/entityes.res';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';
import { ItemMenu } from '../../items-menu/entities/item-menu.entity';

@Entity()
export class ItemToMenu {
    constructor(
        menuId:number,itemMenuId:number
    ){
        this.menuId=menuId;
        this.itemMenuId=itemMenuId;
    }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  menuId: number;
  @Column()
  itemMenuId: number;
  @Column({
    default: Estado.ACTIVO,
  })
  estado: number;

  @ManyToOne(() => Menu, (menu) => menu.menu)
  menu: Menu;
  @ManyToOne(() => ItemMenu, (itemMenu) => itemMenu.itemToMenu)
  itemMenu: ItemMenu;
}
