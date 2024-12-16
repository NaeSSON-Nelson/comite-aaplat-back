import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MultaServicio } from "./multa-de-servicio";
import { Monedas } from "src/interfaces/enum/enum-entityes";
import { ColumnNumericTransformer } from "src/interfaces/class-typeORM";

@Entity()
export class ComprobanteDePagoDeMultas{
    @PrimaryGeneratedColumn()
    id:number;
    @Column('text',{default:false})
    fechaEmitida:Date;
    @Column('text',{nullable:false,})
    metodoPago:string;
    @Column('numeric',{scale:2,precision:8,nullable:false,
      
      transformer: new ColumnNumericTransformer(),
    })
    montoPagado:number;
    @Column('enum',{
      enum:Monedas,
      nullable:false,
    })
    moneda:Monedas;
    @Column('varchar',{length:100,nullable:false,})
    entidadPago:string;
    @Column('text',{nullable:true,})
    nroRecibo:string;

    @OneToOne(()=>MultaServicio,{nullable:false,})
    @JoinColumn()
    multaServicio:MultaServicio;


    // @OneToMany(()=>PorPagarToPagado,(toPagado)=>toPagado.comprobantePago)
    // comprobantePorPagarToComprobantePagado:PorPagarToPagado;
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
}