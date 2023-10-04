import { Afiliado } from "src/auth/modules/usuarios/entities";
import { Estado } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PagoServicio } from "./pago-servicio";

@Entity('planillas_pagos')
export class PlanillaPagos {
    @PrimaryGeneratedColumn()
    id:number;
    @Column('integer',{
        nullable:false,

    })
    gestion:number;
    @Column('enum',{
        enum:Estado,
        default:Estado.ACTIVO,
        nullable:false,
    })
    estado:Estado;
    @OneToOne(()=>Afiliado,{nullable:false})
    @JoinColumn()
    afiliado:Afiliado;

    @OneToMany(()=>PagoServicio,(pagoServicio)=>pagoServicio.planilla)
    pagos:PagoServicio[];
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
