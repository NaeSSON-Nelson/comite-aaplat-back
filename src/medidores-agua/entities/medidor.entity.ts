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
import { LecturaMedidor } from './lectura-medidor.entity';
import { Afiliado } from '../../auth/modules/usuarios/entities/afiliado.entity';
import { Barrio } from 'src/interfaces/enum/enum-entityes';
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';

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
    name: 'fecha_instalacion',
    type: 'text',
    nullable: false,
  })
  fechaInstalacion: Date;

  @Column(() => Ubicacion)
  ubicacion:Ubicacion;

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
  ultimaLectura: number;


  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  marca: string;

  @OneToMany(() => LecturaMedidor, (lecturaMedidor) => lecturaMedidor.medidor)
  lecturas: LecturaMedidor[];

  @ManyToOne(() => Afiliado, (afiliado) => afiliado.medidores)
  afiliado: Afiliado;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    select:false
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    select:false
  })
  updated_at: Date;
  
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
