import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ColumnsAlways } from "src/common/inherints-db";
import { Estado } from "src/interfaces/enum/enum-entityes";
import { Menu } from "../../menus/entities/menu.entity";

@Entity('menu-items')
export class ItemMenu extends ColumnsAlways{
    @PrimaryGeneratedColumn()
    id: number;

    
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
    @Column({
        type:'varchar',
        length:100,
        nullable:false,
        unique:true,
    })
    linkMenu:string;

    // @Column({
    //     type:'bool',
    //     default:true,
    // })
    // visible:boolean;
    // @OneToMany(()=>ItemToMenu,(itemToMenu)=>itemToMenu.itemMenu)
    // itemToMenu?:ItemToMenu[];
    @ManyToOne(()=>Menu,(menu)=>menu.itemMenu,{cascade:true})
    menu:Menu;

    @BeforeInsert()
    CrearNuevoItemMenu(){
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
        this.CrearNuevoItemMenu();
    }
}