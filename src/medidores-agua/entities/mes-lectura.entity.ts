import { ColumnsAlways } from "src/common/inherints-db";
import { Medicion, Mes } from "src/interfaces/enum/enum-entityes";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlanillaLecturas } from "./planilla-lecturas.entity";
import { ComprobantePorPago } from "src/pagos-de-servicio/entities";

@Entity('mes_lecturas')
export class MesLectura extends ColumnsAlways{
    
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type:"integer",
        nullable:false,
    })
    lectura:number;
    @Column({
        type:"text",
        nullable:true,

    })
    estadoMedidor?:string;
    @Column({
        type:"integer",
        nullable:false,
    })
    consumoTotal:number;
    @Column({
        type:'enum',
        enum:Medicion,
        default:Medicion.mt3,
        nullable:false,
    })
    medicion:Medicion;
    @Column({
        type:'bool',
        nullable:false,
        default:true,
    })
    editable:boolean;
    @Column({
        type:"enum",
        enum:Mes,
        nullable:false,
    })
    mesLecturado:Mes;

    @ManyToOne(()=>PlanillaLecturas,(planillaLecturas)=>planillaLecturas.lecturas)
    planilla:PlanillaLecturas;
    
    @OneToOne(()=>ComprobantePorPago,(comprobante)=>comprobante.lectura)
    pagar:ComprobantePorPago;
}