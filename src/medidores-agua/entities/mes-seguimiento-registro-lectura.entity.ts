import { ColumnsAlways } from "src/common/inherints-db";
import { Mes } from "src/interfaces/enum/enum-entityes";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AnioSeguimientoLectura } from "./anio-seguimiento-lecturas.entity";

@Entity('mes_seguimiento_registro_lectura')
export class MesSeguimientoRegistroLectura extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'enum',enum:Mes,nullable:false})
    mes:Mes;
    @Column({type:'timestamp without time zone',nullable:false,name:'fecha_registro_lecturas'})
    fechaRegistroLecturas:Date;
    @Column({type:'timestamp without time zone',nullable:false,name:'fecha_fin_registro_lecturas'})
    fechaFinRegistroLecturas:Date;

    @ManyToOne(()=>AnioSeguimientoLectura,(anioSeguimientoLectura)=>anioSeguimientoLectura.meses,{nullable:false})
    anioSeguimiento:AnioSeguimientoLectura;
}