import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, Min } from "class-validator";
import { Monedas, TipoMulta } from "src/interfaces/enum/enum-entityes";

export class NuevaTarifaMultaPorRetrasosPagosDto{
    @IsNumber({allowInfinity:false,maxDecimalPlaces:2,allowNaN:false})
    @Min(1)
    monto:number;
    @IsEnum(Monedas)
    moneda:Monedas;
    
    @IsNumber({allowInfinity:false,maxDecimalPlaces:2,allowNaN:false})
    @Min(1)
    mesesDemora:number;
    @IsDate()
    @Type(()=>Date)
    vigencia:Date;

    @IsEnum(TipoMulta)
    tipoMulta:TipoMulta
}