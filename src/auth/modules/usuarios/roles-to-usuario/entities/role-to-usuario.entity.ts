import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { Role } from '../../../../../manager/roles/roles/entities/role.entity';
import { ColumnsAlways } from 'src/common/inherints-db';

@Entity()
export class RoleToUsuario extends ColumnsAlways{

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roleId: number;
  @Column()
  usuarioId: number;

  @ManyToOne(() => Role, (role) => role.menuToRole)
  role: Role;
  @ManyToOne(() => Usuario, (usuario) => usuario.roleToUsuario)
  usuario: Usuario;
}
