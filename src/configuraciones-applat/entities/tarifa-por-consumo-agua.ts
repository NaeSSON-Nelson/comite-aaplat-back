import { ColumnsAlways } from "src/common/inherints-db";
import { Monedas } from "src/interfaces/enum/enum-entityes";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ComprobantePorPago } from '../../pagos-de-servicio/entities/comprobante-por-pagar';
import { ColumnNumericTransformer } from "src/interfaces/class-typeORM";


@Entity()
export class TarifaPorConsumoAgua extends ColumnsAlways{

    @PrimaryGeneratedColumn()
    id:number;
    @Column({
        nullable:false,
        type:'numeric',
        scale:2,
        precision:5,
        transformer: new ColumnNumericTransformer(),
    })
    tarifaMinima:number;
    @Column({
        type:'integer'
    })
    lecturaMinima:number;
    @Column({
        nullable:false,
        type:'numeric',
        scale:2,
        precision:5,
        transformer: new ColumnNumericTransformer(),
    })
    tarifaAdicional:number;
    @Column({
        type:'enum',
        enum:Monedas
    })
    moneda:Monedas;
    @Column({
        type:'integer',
        nullable:false,
    })
    diaLimitePago:number;
    @Column({
        type:'text',
        nullable:false
    })
    vigencia:Date;

    @OneToMany(()=>ComprobantePorPago,(comprobante)=>comprobante.tarifaConsumoCalculo)
    comprobantesLecturas:ComprobantePorPago[];
}