import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  
} from 'typeorm';

import { ColumnsAlways } from 'src/common/inherints-db/column-always';
import { Estado, TipoPerfil } from '../../../../interfaces/enum/enum-entityes';
import { Usuario } from './usuario.entity';
import { Afiliado } from './afiliado.entity';

@Entity()
export class Perfil extends ColumnsAlways {
  @PrimaryGeneratedColumn()
  
  id: number;

  @Column({
    name: 'nombre_primero',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombrePrimero: string;

  @Column({
    name: 'nombre_segundo',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  nombreSegundo?: string;

  @Column({
    name: 'apellido_primero',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  apellidoPrimero: string;

  @Column({
    name: 'apellido_segundo',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apellidoSegundo?: string;

  @Column({
    name: 'cedula_identidad',
    type: 'varchar',
    length: 100,
    nullable: false,
    unique:true,
  })
  CI: string;

  @Column({
    name: 'genero',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  genero: string;

  @Column({
    name: 'profesion',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  profesion: string;

  @Column({
    name: 'fecha_nacimiento',
    type: 'text',
    nullable: false,
  })
  fechaNacimiento: Date;

  @Column({
    name: 'tipo_perfil',
    type: 'enum',
    array: true,
    enum:TipoPerfil,
    nullable:false,
  })
  tipoPerfil: TipoPerfil[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  direccion: string;

  @Column({
    type:'text',
    nullable:true
  })
  contacto:string;
  @Column({
    type: 'bool',
    default: false,
  })
  accessAcount: boolean;
  @Column({
    type: 'bool',
    default: false,
  })
  isAfiliado: boolean;

  @Column({
    type:'text',
    default:'default_client',
  })
  profileImageUri:string;
  @Column({
    type:'bool',
    default:true,
  })
  defaultClientImage:boolean;
  @Column({
    type:'text',
    default:'https://res.cloudinary.com/dfdheljso/image/upload/v1725280951/default_client.jpg',
  })
  urlImage:string;
  @OneToOne(() => Usuario, (usuario) => usuario.perfil,{cascade:['insert']}) // specify inverse side as a second parameter
  usuario: Usuario
  @OneToOne(() => Afiliado, (afiliado) => afiliado.perfil,{cascade:['insert']}) // specify inverse side as a second parameter
  afiliado: Afiliado

  
  @BeforeInsert()
  CreatePerfil() {
    this.nombrePrimero = this.nombrePrimero.toLocaleLowerCase().trim();
    if (this.nombreSegundo)
      this.nombreSegundo = this.nombreSegundo.toLocaleLowerCase().trim();
    this.apellidoPrimero = this.apellidoPrimero.toLocaleLowerCase().trim();
    if (this.apellidoSegundo)
      this.apellidoSegundo = this.apellidoSegundo.toLocaleLowerCase().trim();
    if (this.profesion)
      this.profesion = this.profesion.toLocaleLowerCase().trim();
      if(this.estado === Estado.ACTIVO){
        this.isActive=true;
    } else if(this.estado === Estado.DESHABILITADO){
        this.isActive=false;
    }
  }
  @BeforeUpdate()
  actualizarAfiliado() {
    this.CreatePerfil();
  }
}
