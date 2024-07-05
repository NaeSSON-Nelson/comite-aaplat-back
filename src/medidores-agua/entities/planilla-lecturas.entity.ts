import { ColumnsAlways } from "src/common/inherints-db";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Medidor } from "./medidor.entity";
import { MesLectura } from "./mes-lectura.entity";
import { MedidorAsociado } from "./medidor-asociado.entity";

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
    @ManyToOne(()=>MedidorAsociado,(asociado)=>asociado.planillas)
    medidor:MedidorAsociado;

    @OneToMany(()=>MesLectura,(mesLectura)=>mesLectura.planilla)
    lecturas:MesLectura[];
}