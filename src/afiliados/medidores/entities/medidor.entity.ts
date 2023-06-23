import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LecturaMedidor } from './lectura-medidor.entity';
import { Estado } from 'src/interfaces/Entityes/entityes.res';
import { Afiliado } from '../../entities/afiliado.entity';

@Entity('medidores')
export class Medidor {
    
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'nro_medidor',
    type: 'varchar',
    length: 100,
    nullable: false,
    unique:true
  })
  nroMedidor: string;

  @Column({
    name: 'fecha_instalacion',
    type: 'text',
    nullable: false,
  })
  fechaInstalacion: Date;

  @Column({
    name: 'lectura_inicial',
    type: 'integer',
    nullable: false,
  })
  lecturaInicial: number;
  @Column({
    name: 'ultima_lectura',
    type: 'integer',
    default:0
  })
  ultimaLectura: number;

  @Column({
    type: 'integer',
    default: Estado.ACTIVO,
  })
  estado: number;
  
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  marca: string;

  @OneToMany(() => LecturaMedidor, (lecturaMedidor) => lecturaMedidor.medidor)
  lecturas: LecturaMedidor[];

  @ManyToOne(()=>Afiliado,(afiliado)=>afiliado.medidores)
  afiliado:Afiliado;

  @BeforeInsert()
  registrarNuevoMedidor(){
    this.marca=this.marca.toUpperCase().trim();
    this.nroMedidor=this.nroMedidor.toUpperCase().trim();
  }
  @BeforeUpdate()
  actualizarMedidor(){
    this.registrarNuevoMedidor();
  }
}
