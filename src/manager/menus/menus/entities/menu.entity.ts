import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuToRole } from '../../../roles/menu-to-role/entities/menuToRole.entity';
import { ColumnsAlways } from "src/common/inherints-db";
import { Estado } from "src/interfaces/enum/enum-entityes";
import { ItemMenu } from "../../items-menu/entities/item-menu.entity";

@Entity({
    name:'menus'
})
export class Menu extends ColumnsAlways{
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


    @OneToMany(()=>MenuToRole,(menuToRole)=>menuToRole.menu)
    menu:MenuToRole[];
    
    // @OneToMany(()=>ItemToMenu,(itemToMenu)=>itemToMenu.menu)
    // itemMenu:ItemToMenu[];
    @OneToMany(()=>ItemMenu,(itemMenu)=>itemMenu.menu)
    itemMenu:ItemMenu[];

    @Column({
        type:'integer',
        nullable:false,
        default:1,
    })
    prioridad:number;
    @BeforeInsert()
    CrearNuevoMenu(){
        // this.nombre=this.nombre.toLocaleLowerCase().trim();
        if(this.linkMenu)
        this.linkMenu=this.linkMenu.toLocaleLowerCase().trim();
        if(this.estado === Estado.ACTIVO){
            this.isActive=true;
          }else{
            this.isActive=false;
          } 
    }
    @BeforeUpdate()
    actualizarMenu(){
        this.CrearNuevoMenu();
    }
}
