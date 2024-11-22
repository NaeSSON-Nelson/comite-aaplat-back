import { ColumnsAlways } from "src/common/inherints-db";
import { Medicion, Mes } from "src/interfaces/enum/enum-entityes";
import { AfterUpdate, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlanillaLecturas } from "./planilla-lecturas.entity";
import { ComprobantePorPago, MultaServicio } from "src/pagos-de-servicio/entities";

@Entity('mes_lecturas')
export class PlanillaMesLectura extends ColumnsAlways{
    
    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        type:"integer",
        nullable:true,
    })
    lectura:number;
    @Column({
        type:"text",
        nullable:true,

    })
    estadoMedidor:string;
    @Column({
        type:"integer",
        nullable:true,
    })
    consumoTotal:number;
    @Column({
        type:'enum',
        enum:Medicion,
        // default:Medicion.mt3,
        nullable:true,
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
    PlanillaMesLecturar:Mes;

    @Column({
        type:'bool',
        default:true,
        nullable:false,
    })
    registrable:boolean;
    @Column({
        type:'bool',
        default:false,
        nullable:false
    })
    registrado:boolean;
    @Column({
        type:'bool',
        nullable:true
    })
    tarifaGenerada:boolean;
    @Column({
        type:'bool',
        nullable:false,
        default:false,
    })
    isMulta:boolean;

    @ManyToOne(()=>PlanillaLecturas,(planillaLecturas)=>planillaLecturas.lecturas,{nullable:false})
    planilla:PlanillaLecturas;
    
    @OneToOne(()=>ComprobantePorPago,(comprobante)=>comprobante.lectura,)
    pagar:ComprobantePorPago;

    // @OneToMany(() => MultaToPlanillaLecturas,multasToPlanillaLecturas  => multasToPlanillaLecturas.planillaMesLectura)
    // multasToPlanillas: MultaToPlanillaLecturas[];
    @ManyToOne(() => MultaServicio, multa => multa.lecturasMultadas)
    multa:MultaServicio;
}