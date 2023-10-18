import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { ComprobantePorPago } from "./";


@Entity('comprobante_de_pago')
export class ComprobantePago{

    @PrimaryColumn()
    id:number;
    @Column('text',{default:false})
    fechaEmitida:Date;
    @Column('text',{nullable:false,})
    metodoPago:string;
    @Column('numeric',{scale:2,precision:8,nullable:false,})
    montoPagado:number;
    @Column('varchar',{length:100,nullable:false,})
    entidadPago:string;
    @Column('text',{nullable:true,})
    nroRecibo:string;

    @OneToOne(()=>ComprobantePorPago,{nullable:false,})
    @JoinColumn()
    comprobantePorPagar:ComprobantePorPago;
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