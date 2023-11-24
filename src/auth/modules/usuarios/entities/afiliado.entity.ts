import {
  BeforeInsert,
  BeforeUpdate,
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
import { Estado } from 'src/interfaces/enum/enum-entityes';

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

  @OneToOne(() => Perfil,(perfil)=>perfil.afiliado)
  @JoinColumn()
  perfil: Perfil;

  @BeforeInsert()
  addColumns(){
    if(this.estado === Estado.ACTIVO){
      this.isActive=true;
    }else{
      this.isActive=false;
    } 
  }
  @BeforeUpdate()
  updateAfiliado(){
    this.addColumns();
  }
}
