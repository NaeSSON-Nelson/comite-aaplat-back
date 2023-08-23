import { ColumnsAlways } from "src/common/inherints-db";
import { Mes } from "src/interfaces/enum/enum-entityes";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PlanillaLecturas } from "./planilla-lecturas.entity";

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
        type:"enum",
        enum:Mes,
        nullable:false,
    })
    mesLecturado:Mes;

    @ManyToOne(()=>PlanillaLecturas,(planillaLecturas)=>planillaLecturas.lecturas)
    planilla:PlanillaLecturas;
}