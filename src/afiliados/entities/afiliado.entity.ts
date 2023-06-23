import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Medidor } from '../medidores/entities/medidor.entity';

@Entity({
  name: 'afiliados',
})
export class Afiliado {
  @PrimaryGeneratedColumn('increment')
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
    nullable: true,
  })
  profesion?: string;

  @Column({
    name: 'fecha_nacimiento',
    type: 'text',
    nullable: false,
  })
  fechaNacimiento: Date;

  @Column({
    name: 'estado',
    type: 'integer',
    nullable: false,
  })
  estado: number;

  @OneToMany(() => Medidor, (medidor) => medidor.afiliado)
  medidores: Medidor[];

  @BeforeInsert()
  CrearNuevoAfiliado() {
    this.nombrePrimero = this.nombrePrimero.toLocaleLowerCase().trim();
    if (this.nombreSegundo)
      this.nombreSegundo = this.nombreSegundo.toLocaleLowerCase().trim();
    this.apellidoPrimero = this.apellidoPrimero.toLocaleLowerCase().trim();
    if (this.apellidoSegundo)
      this.apellidoSegundo = this.apellidoSegundo.toLocaleLowerCase().trim();
    if (this.profesion)
      this.profesion = this.profesion.toLocaleLowerCase().trim();
  }
  @BeforeUpdate()
  actualizarAfiliado() {
    this.CrearNuevoAfiliado();
  }
}
