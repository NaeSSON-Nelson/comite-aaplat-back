import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { Afiliado } from "src/afiliados/entities/afiliado.entity";
import { Estado } from "src/interfaces/Entityes/entityes.res";
import { RoleToUsuario } from "../roles-to-usuario/entities/role-to-usuario.entity";
import { PerfilUsuario } from "./perfil-usuario.entity";

@Entity({
    name:'usuarios'
})
export class Usuario {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({
        name:'user_name',
        type:'varchar',
        length:50,
        unique:true,
        nullable:false,
    })
    userName:string;
    @Column({
        type:'varchar',
        length:200,
        nullable:false,
    })
    password:string;
    @Column({
        type:'integer',
        nullable:false,
        default:Estado.ACTIVO
    })
    estado:number;

    @OneToOne(() => PerfilUsuario)
    @JoinColumn()
    perfil: PerfilUsuario;
  
    @OneToMany(()=>RoleToUsuario,(roleToUsuario)=>roleToUsuario.usuario)
    roleToUsuario:RoleToUsuario[];

    @OneToOne(()=> Afiliado)
    @JoinColumn()
    afiliado: Afiliado;
}
