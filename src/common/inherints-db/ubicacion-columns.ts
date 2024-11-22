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

  @Column({ type: 'numeric', nullable: true,scale:20,precision:100 })
  longitud?: string;
  
  @Column({ type: 'numeric', nullable: true,scale:20,precision:100 })
  latitud?: string;
}
