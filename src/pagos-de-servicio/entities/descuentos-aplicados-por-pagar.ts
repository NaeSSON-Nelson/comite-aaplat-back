
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ComprobantePorPago } from "./comprobante-por-pagar";

@Entity()
export class DescuentosAplicadosPorPagar{
    @PrimaryGeneratedColumn()
    id:number;
    @Column({
        type:'text',
        nullable:false
    })
    tipoDescuentoBeneficiario:string;
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

    @ManyToOne(()=>ComprobantePorPago,(comprobante)=>comprobante.descuentos)
    comprobante:ComprobantePorPago;
}