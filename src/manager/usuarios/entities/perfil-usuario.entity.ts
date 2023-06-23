import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';
import { Estado } from 'src/interfaces/Entityes/entityes.res';

@Entity()
export class PerfilUsuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', {
    nullable: false,
  })
  nombreUsuario: string;

  @Column('text', {
    nullable: true,
  })
  correo: string;

  @Column('text', {
    nullable: true,
  })
  codigoPostal: string;

  @Column('text', {
    array: true,
    default: [],
  })
  contactos: string[];

  @Column('text', {
    nullable: false,
    default: 'default.png',
  })
  profileImage: string;

  @Column('text', {
    nullable: true,
  })
  direccion: string;

  @Column('integer', {
    default: Estado.ACTIVO,
    nullable: false,
  })
  estado: number;

  //TODO: DATOS GEOGRAFICOS PARA ENCONTRAR AL AFILIADO  POR GOOGLE MAPS
  @Column('text', {
    nullable: true,
  })
  longitud: string;
  @Column('text', {
    nullable: true,
  })
  latitud: string;
}
