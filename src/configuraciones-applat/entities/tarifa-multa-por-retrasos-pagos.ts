import { ColumnsAlways } from "src/common/inherints-db";
import { ColumnNumericTransformer } from "src/interfaces/class-typeORM";
import { Monedas, TipoMulta } from "src/interfaces/enum/enum-entityes";
import { MultaServicio } from "src/pagos-de-servicio/entities";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class TarifaMultaPorRetrasosPagos extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id:number;
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
        nullable:false
    })
    moneda:Monedas;
    @Column({
        type:'integer',
        nullable:false,
    })
    mesesDemora:number;
    @Column({
        type:'text',
        nullable:false,
    })
    vigencia:Date;
    @Column({
        type:'enum',
        nullable:false,
        enum:TipoMulta
    })
    tipoMulta:TipoMulta;
    @OneToMany(()=>MultaServicio,(multa)=>multa.tarifaRetraso)
    multasRetrasos:MultaServicio[]
}