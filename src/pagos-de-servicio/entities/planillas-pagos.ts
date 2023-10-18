import { Afiliado } from "src/auth/modules/usuarios/entities";
import { Estado } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ComprobantePorPago } from "./";

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
    @ManyToOne(() => Afiliado, (afiliado) => afiliado.planillasPagos)
    @JoinColumn()
    afiliado:Afiliado;

    @OneToMany(()=>ComprobantePorPago,(comprobantePorPagar)=>comprobantePorPagar.planilla)
    pagos:ComprobantePorPago[];
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
