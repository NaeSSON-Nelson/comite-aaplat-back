import { IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { Monedas } from "src/interfaces/enum/enum-entityes";

export class UpdatePagoAfiliacionDto{
    @IsNumber()
    @Min(0)
    @IsOptional()
    monto?:number;
    @IsEnum(Monedas)
    @IsOptional()
    moneda?:Monedas;
}