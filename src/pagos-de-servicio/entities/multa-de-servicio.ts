import { Monedas, TipoMulta } from "src/interfaces/enum/enum-entityes";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { ComprobanteDePagoDeMultas } from "./comprobante-de-pago-de-multas";
import { MedidorAsociado } from "src/asociaciones/entities/medidor-asociado.entity";
import { ColumnsAlways } from "src/common/inherints-db";
import { PlanillaMesLectura } from "src/medidores-agua/entities/planilla-mes-lectura.entity";
import { ColumnNumericTransformer } from "src/interfaces/class-typeORM";
import { TarifaMultaPorRetrasosPagos } from "src/configuraciones-applat/entities/tarifa-multa-por-retrasos-pagos";

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
        precision:5,
        transformer: new ColumnNumericTransformer(),
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
    @Column({
        type:'enum',
        nullable:false,
        enum:TipoMulta
    })
    tipoMulta:TipoMulta;
    // @OneToMany(() => MultaToPlanillaLecturas, multaToPlanillasLecturas => multaToPlanillasLecturas.multaServicio)
    // multasToPlanillas: MultaToPlanillaLecturas[];
    // @OneToMany(() => PlanillaMesLectura, lecturas =>lecturas.multa)
    // lecturasMultadas:PlanillaMesLectura[];
    @OneToOne(()=>ComprobanteDePagoDeMultas,(comprobante)=>comprobante.multaServicio,{nullable:false})
    comprobante:ComprobanteDePagoDeMultas;
    @ManyToOne(()=>MedidorAsociado,(medidor)=>medidor.multasAsociadas,{nullable:false})
    medidorAsociado:MedidorAsociado;
    @ManyToOne(()=>TarifaMultaPorRetrasosPagos,(tarifa)=>tarifa.multasRetrasos)
    tarifaRetraso:TarifaMultaPorRetrasosPagos
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