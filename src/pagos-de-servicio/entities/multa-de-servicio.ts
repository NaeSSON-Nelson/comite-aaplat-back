import { Monedas } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { ComprobanteDePagoDeMultas } from "./comprobante-de-pago-de-multas";
import { MedidorAsociado } from "src/asociaciones/entities/medidor-asociado.entity";
import { ColumnsAlways } from "src/common/inherints-db";
import { PlanillaMesLectura } from "src/medidores-agua/entities/planilla-mes-lectura.entity";

@Entity('multa_servicio')
export class MultaServicio extends ColumnsAlways{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({
        nullable:false,
        type:'text',
    })
    motivo:string;
    @Column({
        nullable:false,
        type:'numeric',
        scale:2,
        precision:5
    })
    monto:number;
    @Column({
        type:'enum',
        enum:Monedas,
        nullable:false,
    })
    moneda:Monedas;
    @Column({
        type:'bool',
        nullable:false,
        default:false,
    })
    pagado:boolean;
    // @OneToMany(() => MultaToPlanillaLecturas, multaToPlanillasLecturas => multaToPlanillasLecturas.multaServicio)
    // multasToPlanillas: MultaToPlanillaLecturas[];
    @OneToMany(() => PlanillaMesLectura, lecturas =>lecturas.multa)
    lecturasMultadas:PlanillaMesLectura[];
    @OneToOne(()=>ComprobanteDePagoDeMultas,(comprobante)=>comprobante.multaServicio,{nullable:false})
    comprobante:ComprobanteDePagoDeMultas;
    @ManyToOne(()=>MedidorAsociado,(medidor)=>medidor.multasAsociadas,{nullable:false})
    medidorAsociado:MedidorAsociado;
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