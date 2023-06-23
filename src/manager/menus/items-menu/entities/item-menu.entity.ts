import { Estado } from "src/interfaces/Entityes/entityes.res";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ItemToMenu } from "../../items-to-menu/entities/item-to-menu.entity";

@Entity('menu-items')
export class ItemMenu{
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
        nullable:true,
        
    })
    linkMenu?:string;

    @Column({
        type:'integer',
        nullable:false,
        
        default:Estado.ACTIVO
    })
    estado?:number;

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