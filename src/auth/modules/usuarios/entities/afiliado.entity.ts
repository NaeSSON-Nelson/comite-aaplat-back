import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Perfil } from '.';
import { ColumnsAlways, Ubicacion } from 'src/common/inherints-db';
import { Estado, MetodoPago, Monedas } from 'src/interfaces/enum/enum-entityes';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';
import { ColumnNumericTransformer } from 'src/interfaces/class-typeORM';
import { BeneficiarioDescuentos } from 'src/configuraciones-applat/entities/beneficiario-descuentos';

@Entity({
  name: 'afiliados',
})
export class Afiliado extends ColumnsAlways {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('numeric',{
    precision:8,
    scale:2,
    transformer: new ColumnNumericTransformer(),
  })
  montoAfiliacion:number;
  @Column({
    type:'enum',
    enum:Monedas,
  })
  monedaAfiliacion:Monedas;

  @ManyToMany(()=>BeneficiarioDescuentos,{cascade:true})
  @JoinTable()
  descuentos:BeneficiarioDescuentos[]; // PARA ADULTOS MAYORES Y/O PERSONAS CON DISCAPACIDAD
 
  @Column(() => Ubicacion)
  ubicacion:Ubicacion;
  @OneToMany(() => MedidorAsociado, (asociacion) => asociacion.afiliado)
  medidorAsociado:MedidorAsociado [];

  @OneToOne(() => Perfil,(perfil)=>perfil.afiliado,{nullable:false})
  @JoinColumn()
  perfil: Perfil;

 
}
