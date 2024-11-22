import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { RoleToUsuario } from "../roles-to-usuario/entities/role-to-usuario.entity";
import { Perfil } from ".";
import { ColumnsAlways } from "src/common/inherints-db/column-always";
import { Estado } from "src/interfaces/enum/enum-entityes";

@Entity({
    name:'usuarios'
})
export class Usuario  extends ColumnsAlways{
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        name:'user_name',
        type:'varchar',
        length:50,
        unique:true,
        nullable:false,
    })
    username:string;
    @Column({
        type:'varchar',
        length:200,
        nullable:false,
        select:false
    })
    password:string;
    @Column({
        type:"text",
        nullable:true,
        unique:true,
    })
    correo:string;
    @Column({
        name:'correo_verificado',
        type:'bool',
        default:false,
    })
    correoVerify:boolean;

    @OneToOne(() => Perfil, (perfil) => perfil.usuario,{nullable:false})
    @JoinColumn()
    perfil: Perfil;
  
    @OneToMany(()=>RoleToUsuario,(roleToUsuario)=>roleToUsuario.usuario)
    roleToUsuario:RoleToUsuario[];


    @BeforeInsert()
    estadosUsuario(){
        if(this.estado === Estado.ACTIVO){
            this.isActive=true;
        } else if(this.estado === Estado.DESHABILITADO){
            this.isActive=false;
        }
    }
    @BeforeUpdate()
    checkEstados(){
        if(this.estado === Estado.ACTIVO){
            this.isActive=true;
        } else if(this.estado === Estado.DESHABILITADO){
            this.isActive=false;
        }
    }
    

}
