import { Estado, Monedas } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { PlanillaMesLectura } from "src/medidores-agua/entities/planilla-mes-lectura.entity";
import { ComprobantePago } from "./comprobante-de-pago";
import { ComprobantePorPagoAdicional } from "./comprobante-por-pagar-add";
import { PorPagarToPagado } from "./por-pagar-to-pagado";

@Entity('comprobante_por_pagar')
export class ComprobantePorPago{

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

    @Column({
        type:'text',
        nullable:false,
    })
    fechaLimitePago:Date;
    @OneToOne(()=>PlanillaMesLectura,{nullable:false})
    @JoinColumn()
    lectura:PlanillaMesLectura;

    // @OneToOne(()=>ComprobantePorPagoAdicional,(pagoAdd)=>pagoAdd.primerComprobante)
    // comprobantesAdd:ComprobantePorPagoAdicional;

    @OneToOne(()=>ComprobantePago,(pagado)=>pagado.comprobantePorPagar)
    comprobante:ComprobantePago;

    // @OneToMany(()=>PorPagarToPagado,(toPagado)=>toPagado.comprobantePorPagar)
    // comprobantePorPagarToComprobantePagar:PorPagarToPagado;
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