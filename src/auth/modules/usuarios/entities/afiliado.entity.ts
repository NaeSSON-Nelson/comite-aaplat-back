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
import { Estado, MetodoPago, Monedas } from 'src/interfaces/enum/enum-entityes';
import { MedidorAsociado } from 'src/asociaciones/entities/medidor-asociado.entity';
import { ColumnNumericTransformer } from 'src/interfaces/class-typeORM';

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
  // @Column({
  //   type:'bool',
  //   default:false,
  // })
  // pagado:boolean;
  // @Column({
  //   type:'enum',
  //   enum:MetodoPago,
  //   nullable:true,
  // })
  // metodoPago:MetodoPago;
  // @Column({
  //   type:'varchar',
  //   length:100,
  //   nullable:true
  // })
  // entidad:string;
  // @Column({
  //   type:'varchar',
  //   length:100,
  //   nullable:true
  // })
  // nroRecibo:string;
  // @Column({
  //   type:'varchar',
  //   length:100,
  //   nullable:true
  // })
  // remitente:string;
  // @Column({
  //   type:'varchar',
  //   length:100,
  //   nullable:true
  // })
  // nroCuenta:string;
  // @Column('numeric',{
  //   precision:8,
  //   scale:2,
  //   transformer: new ColumnNumericTransformer(),
  //   nullable:true,
  // })
  // montoRecibido:number;
  // @Column({
  //   type:'enum',
  //   enum:Monedas,
  //   nullable:true,
  // })
  // monedaRecibido:Monedas;

  // @Column({
  //   type:'text',
  //   nullable:true
  // })
  // fechaPago:Date;

  @Column(() => Ubicacion)
  ubicacion:Ubicacion;
  @OneToMany(() => MedidorAsociado, (asociacion) => asociacion.afiliado)
  medidorAsociado:MedidorAsociado [];

  @OneToOne(() => Perfil,(perfil)=>perfil.afiliado,{nullable:false})
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
