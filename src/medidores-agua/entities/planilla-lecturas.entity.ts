import { ColumnsAlways } from "src/common/inherints-db";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Medidor } from "./medidor.entity";
import { MesLectura } from "./mes-lectura.entity";

@Entity('planillas_lecturas')
export class PlanillaLecturas extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id:number;

    @Column({
        nullable:false,
        type:"integer",
    })
    gestion:number;

    @ManyToOne(()=>Medidor,(medidor)=>medidor.planillas)
    medidor:Medidor;

    @OneToMany(()=>MesLectura,(mesLectura)=>mesLectura.planilla)
    lecturas:MesLectura[];
}