import { ColumnsAlways } from "src/common/inherints-db";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Medidor } from "./medidor.entity";
import { PlanillaMesLectura } from "./planilla-mes-lectura.entity";
import { MedidorAsociado } from "src/asociaciones/entities/medidor-asociado.entity";

@Entity('planillas_lecturas')
export class PlanillaLecturas extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        nullable:false,
        type:"integer",
    })
    gestion:number;
    @Column({
        type:'bool',
        nullable:false,
        default:true,
    })
    registrable:boolean;
   
    @ManyToOne(()=>MedidorAsociado,(asociado)=>asociado.planillas,{nullable:false})
    medidor:MedidorAsociado;

    @OneToMany(()=>PlanillaMesLectura,(mesLectura)=>mesLectura.planilla)
    lecturas:PlanillaMesLectura[];
}