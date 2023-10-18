import { Estado, Monedas } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlanillaPagos } from "./planillas-pagos";
import { MesLectura } from "src/medidores-agua/entities/mes-lectura.entity";

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

    @OneToOne(()=>MesLectura,(mesLectura=>mesLectura.LecturaPorPagar),{nullable:false,})
    @JoinColumn()
    lectura:MesLectura;
    @ManyToOne(()=>PlanillaPagos,(planilla)=>planilla.pagos,{nullable:false,})
    planilla:PlanillaPagos;
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