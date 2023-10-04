import { Estado } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PlanillaPagos } from "./planillas-pagos";

@Entity('pago_servicio')
export class PagoServicio{

    @PrimaryGeneratedColumn()
    id:number;
    @Column('integer',{
        nullable:false,
    })
    monto:number;
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
    @Column('text',{
        nullable:true,
        name:'fecha_pagada'
    })
    fechaPagada:Date;

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