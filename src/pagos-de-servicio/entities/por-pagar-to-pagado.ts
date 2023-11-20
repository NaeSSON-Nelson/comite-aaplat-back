import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComprobantePorPago } from "./comprobante-por-pagar";
import { ComprobantePago } from "./comprobante-de-pago";

@Entity('comprobante_por_pagar_to_comprobante_pago')
export class PorPagarToPagado{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({type:'integer',unique:true})
    comprobantePorPagarId:number;
    @Column()
    comprobantePagoId:number;
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
    // @ManyToOne(()=>ComprobantePorPago,(comp)=>comp.comprobantePorPagarToComprobantePagar,{nullable:false,})
    // comprobantePorPagar:ComprobantePorPago;
    // @ManyToOne(()=>ComprobantePago,(pago)=>pago.comprobantePorPagarToComprobantePagado,{nullable:false,})
    // comprobantePago:ComprobantePago;
}