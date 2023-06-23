import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { Estado } from "src/interfaces/Entityes/entityes.res";
import { Menu } from "../../../menus/menus/entities/menu.entity";
import { Role } from "../../roles/entities/role.entity";

@Entity()
export class MenuToRole{

    constructor(menuId:number,roleId:number){
        this.menuId=menuId;
        this.roleId=roleId;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    menuId:number;
    @Column()
    roleId:number;
    @Column({
        default:Estado.ACTIVO
    })
    estado:number;

    @ManyToOne(()=>Menu,(menu)=>menu.menu)
    menu:Menu;
    @ManyToOne(()=>Role,(role)=>role.menuToRole)
    role:Role;
}