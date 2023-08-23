import { ColumnsAlways } from "src/common/inherints-db";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MesSeguimientoRegistroLectura } from "./mes-seguimiento-registro-lectura.entity";

@Entity('anio_seguimiento_lectura')
export class AnioSeguimientoLectura extends ColumnsAlways{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({type:'integer',nullable:false,unique:true})
    anio:number;

    @OneToMany(()=>MesSeguimientoRegistroLectura,(mesSeguimientoRegistroLectura)=>mesSeguimientoRegistroLectura.anioSeguimiento)
    meses:MesSeguimientoRegistroLectura[];
}