import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuToRole } from "../../menu-to-role/entities/menuToRole.entity";
import { RoleToUsuario } from "src/auth/modules/usuarios/roles-to-usuario/entities/role-to-usuario.entity";
import { ColumnsAlways } from "src/common/inherints-db";
import { Nivel } from "src/interfaces/enum/enum-entityes";

@Entity({
    name:'Rol_usuario'
})
export class Role extends ColumnsAlways{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type:'varchar',
        length:100,
        nullable:false,
        unique:true
    })
    nombre:string;

    @OneToMany(()=>MenuToRole,menuToRole=>menuToRole.role)
    menuToRole:MenuToRole[];
    @OneToMany(()=>RoleToUsuario,roleToUsuario=>roleToUsuario.role)
    roleToUsuario:RoleToUsuario[];
    @Column({
        name:'nivel_prioridad',
        type:'enum',
        enum:Nivel,
        default:Nivel.afiliado,
        nullable:false,
    })
    nivel:Nivel;
    
    @BeforeInsert()
    CrearNuevoRole(){
        this.nombre=this.nombre.toLocaleLowerCase().trim();
    }
    @BeforeUpdate()
    actualizarRole(){
        this.CrearNuevoRole();
    }
}
