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
import { Estado } from 'src/interfaces/Entityes/entityes.res';
import { Afiliado } from '../../auth/modules/afiliados/entities/afiliado.entity';
import { Barrio } from 'src/interfaces/enum/Entities.enum';

@Entity('medidores')
export class Medidor {
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

  @Column({
    type: 'varchar',
    nullable: false,
    default: Barrio.mendezFortaleza,
  })
  ubicacionBarrio: string;

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
