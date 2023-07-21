import { Estado } from "src/interfaces/Entityes/entityes.res";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuToRole } from '../../../roles/menu-to-role/entities/menuToRole.entity';
import { ItemToMenu } from "../../items-to-menu/entities/item-to-menu.entity";

@Entity({
    name:'menus'
})
export class Menu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type:'varchar',
        length:100,
        nullable:false,
        
    })
    nombre:string;

    @Column({
        type:'varchar',
        length:100,
        nullable:false,
        unique:true
    })
    linkMenu:string;

    @Column({
        type:'integer',
        nullable:false,
        
        default:Estado.ACTIVO
    })
    estado?:number;

    @OneToMany(()=>MenuToRole,(menuToRole)=>menuToRole.menu)
    menu:MenuToRole[];
    
    @OneToMany(()=>ItemToMenu,(itemToMenu)=>itemToMenu.menu)
    itemMenu:ItemToMenu[];


    @BeforeInsert()
    CrearNuevoMenu(){
        this.nombre=this.nombre.toLocaleLowerCase().trim();
        if(this.linkMenu)
        this.linkMenu=this.linkMenu.toLocaleLowerCase().trim();
    }
    @BeforeUpdate()
    actualizarMenu(){
        this.CrearNuevoMenu();
    }
}
