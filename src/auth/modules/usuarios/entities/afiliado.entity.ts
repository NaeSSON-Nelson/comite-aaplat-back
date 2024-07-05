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
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';
import { Estado } from 'src/interfaces/enum/enum-entityes';
import { MedidorAsociado } from 'src/medidores-agua/entities/medidor-asociado.entity';

@Entity({
  name: 'afiliados',
})
export class Afiliado extends ColumnsAlways {
  @PrimaryGeneratedColumn('increment')
  id: number;
  
  @Column(() => Ubicacion)
  ubicacion:Ubicacion;
  @OneToMany(() => MedidorAsociado, (asociacion) => asociacion.afiliado)
  medidorAsociado:MedidorAsociado [];

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
