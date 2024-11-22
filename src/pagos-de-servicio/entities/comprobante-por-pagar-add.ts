import { Estado, Monedas } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComprobantePorPago } from "./comprobante-por-pagar";
import { ComprobantePago } from "./comprobante-de-pago";
import { PorPagarToPagado } from "./por-pagar-to-pagado";

@Entity('comprobante_por_pagar_adicional')
export class ComprobantePorPagoAdicional{
    
    @PrimaryGeneratedColumn()
    id:number;
    @Column('integer',{
        nullable:false,
    })
    monto:number;
    @Column('enum',{
        enum:Monedas,
        nullable:false,
    })
    moneda:Monedas;
    @Column('text',{
        nullable:false,
    })
    metodoRegistro:string;
    @Column('text',{
        nullable:false,
    })
    motivo:string;
    @Column('enum',{
        enum:Estado,
        default:Estado.ACTIVO,
        nullable:false,
    })
    estado:Estado;
    @Column('bool',{
        default:false,
    })
    pagado:boolean;
    @Column({
        type:'text',
        default: 'SIN PAGAR',
        name:'estado_comprobate'
    })
    estadoComprobate:string;
    @Column('text',{
        nullable:true,
        name:'fecha_pagada'
    })
    fechaPagada:Date;

    // @OneToOne(()=>ComprobantePorPago,(comprobante)=>comprobante.comprobantesAdd,{nullable:false,})
    // @JoinColumn()
    // primerComprobante:ComprobantePorPago;

    // @OneToOne(()=>ComprobantePago,(pagado)=>pagado.comprobantePorPagarAdd)
    // comprobante:ComprobantePago;

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
