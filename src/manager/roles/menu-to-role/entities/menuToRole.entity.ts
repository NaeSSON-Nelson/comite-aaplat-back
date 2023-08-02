import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Menu } from "../../../menus/menus/entities/menu.entity";
import { Role } from "../../roles/entities/role.entity";
import { ColumnsAlways } from "src/common/inherints-db";

@Entity()
export class MenuToRole extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    menuId:number;
    @Column()
    roleId:number;

    @ManyToOne(()=>Menu,(menu)=>menu.menu)
    menu:Menu;
    @ManyToOne(()=>Role,(role)=>role.menuToRole)
    role:Role;
}