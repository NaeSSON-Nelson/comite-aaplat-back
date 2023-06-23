import { Estado } from "src/interfaces/Entityes/entityes.res";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuToRole } from "../../menu-to-role/entities/menuToRole.entity";
import { RoleToUsuario } from '../../../usuarios/roles-to-usuario/entities/role-to-usuario.entity';

@Entity({
    name:'Rol_usuario'
})
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type:'varchar',
        length:100,
        nullable:false,
        unique:true
    })
    nombre:string;
    
    @Column({
        type:'integer',
        nullable:false,
        default:Estado.ACTIVO
    })
    estado:number;

    @OneToMany(()=>MenuToRole,menuToRole=>menuToRole.role)
    menuToRole:MenuToRole[];
    @OneToMany(()=>RoleToUsuario,roleToUsuario=>roleToUsuario.role)
    roleToUsuario:RoleToUsuario[];

    
    @BeforeInsert()
    CrearNuevoRole(){
        this.nombre=this.nombre.toLocaleLowerCase().trim();
    }
    @BeforeUpdate()
    actualizarRole(){
        this.CrearNuevoRole();
    }
}
