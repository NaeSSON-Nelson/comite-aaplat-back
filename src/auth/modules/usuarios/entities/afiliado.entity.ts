import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfil } from '.';
import { Medidor } from 'src/medidores-agua/entities/medidor.entity';
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';

@Entity({
  name: 'afiliados',
})
export class Afiliado extends ColumnsAlways {
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  @Column(() => Ubicacion)
  ubicacion:Ubicacion;
  @OneToMany(() => Medidor, (medidor) => medidor.afiliado)
  medidores: Medidor[];

  @OneToOne(() => Perfil)
  @JoinColumn()
  perfil: Perfil;
}