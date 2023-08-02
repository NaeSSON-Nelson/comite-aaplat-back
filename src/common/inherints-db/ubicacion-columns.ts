import { Column } from 'typeorm';
import { Barrio } from '../../interfaces/enum/enum-entityes';

export class Ubicacion {
  @Column({
    type: 'enum',
    enum: Barrio,
    nullable: false,
  })
  barrio: Barrio;

  @Column({ type: 'varchar', length: 50, nullable: true })
  numeroVivienda?: string;

  @Column({ type: 'text', nullable: true })
  longitud?: string;
  
  @Column({ type: 'text', nullable: true })
  latitud?: string;
}
