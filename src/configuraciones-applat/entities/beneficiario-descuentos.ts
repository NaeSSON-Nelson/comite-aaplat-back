import { ColumnsAlways } from "src/common/inherints-db";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class BeneficiarioDescuentos extends ColumnsAlways{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({
        type:'text',
        nullable:false
    })
    tipoBeneficiario:string;
    @Column({
        type:'text',
        nullable:true
    })
    detalles:string;
    @Column({
        type:'integer',
        nullable:false
    })
    descuento:number;
}