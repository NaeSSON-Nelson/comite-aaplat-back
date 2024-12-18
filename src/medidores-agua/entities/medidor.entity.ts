import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Barrio, Estado, Medicion } from 'src/interfaces/enum/enum-entityes';
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';

@Entity('medidores')
export class Medidor extends ColumnsAlways{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'nro_medidor',
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  nroMedidor: string;

  @Column({
    name: 'lectura_inicial',
    type: 'integer',
    nullable: false,
  })
  lecturaInicial: number;
  @Column({
    name: 'ultima_lectura',
    type: 'integer',
    default: 0,
  })
  lecturaMedidor: number;


  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  marca: string;

  @Column({
    type:'bool',
    nullable:false,
    default:false,
  })
  funcionamiento:boolean;

  @Column({
    type:'enum',
    enum:Medicion,
    // default:Medicion.mt3,
    nullable:false,
  })
  medicion:Medicion;
  @OneToMany(() => MedidorAsociado, (asociado) => asociado.medidor)
  medidorAsociado: MedidorAsociado[];

  
  
  @BeforeInsert()
  registrarNuevoMedidor() {
    this.marca = this.marca.toUpperCase().trim();
    this.nroMedidor = this.nroMedidor.toUpperCase().trim();
    
  }
  @BeforeUpdate()
  actualizarMedidor() {
    this.registrarNuevoMedidor();
  }
}
