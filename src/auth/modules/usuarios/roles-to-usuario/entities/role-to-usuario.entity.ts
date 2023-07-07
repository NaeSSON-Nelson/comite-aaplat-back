import { Estado } from 'src/interfaces/Entityes/entityes.res';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { Role } from '../../../../../manager/roles/roles/entities/role.entity';

@Entity()
export class RoleToUsuario {
  constructor(usuarioId: number, roleId: number) {
    this.usuarioId = usuarioId;
    this.roleId = roleId;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roleId: number;
  @Column()
  usuarioId: number;
  @Column({
    default: Estado.ACTIVO,
  })
  estado: number;

  @ManyToOne(() => Role, (role) => role.menuToRole)
  role: Role;
  @ManyToOne(() => Usuario, (usuario) => usuario.roleToUsuario)
  usuario: Usuario;
}
