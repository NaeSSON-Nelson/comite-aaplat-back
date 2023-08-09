import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemToMenu } from "../../items-to-menu/entities/item-to-menu.entity";
import { ColumnsAlways } from "src/common/inherints-db";

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
        type:'varchar',
        length:100,
        nullable:false,
        unique:true,
    })
    linkMenu:string;

    @Column({
        type:'bool',
        default:true,
    })
    visible:boolean;
    @OneToMany(()=>ItemToMenu,(itemToMenu)=>itemToMenu.itemMenu)
    itemToMenu?:ItemToMenu[];

    @BeforeInsert()
    CrearNuevoItemMenu(){
        this.nombre=this.nombre.toLocaleLowerCase().trim();
        if(this.linkMenu)
        this.linkMenu=this.linkMenu.toLocaleLowerCase().trim();
    }
    @BeforeUpdate()
    actualizarMenu(){
        this.CrearNuevoItemMenu();
    }
}