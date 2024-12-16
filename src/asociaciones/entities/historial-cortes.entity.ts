import { ColumnsAlways } from "src/common/inherints-db";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedidorAsociado } from "./medidor-asociado.entity";
import { TipoAccion } from "src/interfaces/enum/enum-entityes";
@Entity('historial_conexiones')
export class HistorialConexiones extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id:number;
    @Column({
        type:'text',
        nullable:false,
        name:'fecha_corte_emitida'
    })
    fechaRealizada:Date;

    @Column({
        type:'text',
        nullable:false,
    })
    motivo:string;
    @Column({
        type:'enum',
        enum:TipoAccion,
        nullable:false,
    })
    tipoAccion:TipoAccion;
    @ManyToOne(()=>MedidorAsociado,(asociado)=>asociado.historial,{nullable:false})
    asociacion:MedidorAsociado;
}