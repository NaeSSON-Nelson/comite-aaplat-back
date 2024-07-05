import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Menu } from '../../menus/entities/menu.entity';
import { ItemMenu } from '../../items-menu/entities/item-menu.entity';
import { ColumnsAlways } from 'src/common/inherints-db';

@Entity()
export class ItemToMenu extends ColumnsAlways{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  menuId: number;
  @Column()
  itemMenuId: number;
  
  @Column({
    type:'varchar',
    length:100,
    nullable:false,
  })
  nombre:string;
  @Column({
    type:'bool',
    default:true,
  })
  visible:boolean;
  
  @ManyToOne(() => Menu, (menu) => menu.menu)
  menu: Menu;
  @ManyToOne(() => ItemMenu, (itemMenu) => itemMenu.itemToMenu)
  itemMenu: ItemMenu;
}
