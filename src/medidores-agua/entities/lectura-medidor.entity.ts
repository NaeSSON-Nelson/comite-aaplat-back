import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Medidor } from './medidor.entity';
import { ColumnsAlways } from 'src/common/inherints-db';

@Entity('lecturas_medidor')
export class LecturaMedidor extends ColumnsAlways{
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  lectura: number;
  
  @Column({
    type: 'integer',
    nullable: false,
  })
  total:  number;
  @Column({
    name: 'estado_medidor',
    type: 'varchar',
    length: 100,
    default:'sin observaciones'
  })
  estadoMedidor?: string;


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

  @ManyToOne(() => Medidor, (medidor) => medidor.lecturas)
  medidor: Medidor;
}
