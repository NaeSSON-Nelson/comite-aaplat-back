import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNumber, Max, Min } from "class-validator";
import { Monedas } from "src/interfaces/enum/enum-entityes";

export class NuevaTarifaPorConsumoAguaDto{
    
    @IsNumber({allowInfinity:false,maxDecimalPlaces:2,allowNaN:false})
    @Min(1)
    tarifaMinima:number;
    @IsNumber()
    @Min(1)
    lecturaMinima:number;
    @IsNumber({allowInfinity:false,maxDecimalPlaces:2,allowNaN:false})
    @Min(1)
    tarifaAdicional:number;
    @IsEnum(Monedas)
    moneda:Monedas;
    @IsNumber()
    @Min(20)
    @Max(27)
    diaLimitePago:number;
    @IsDate()
    @Type(()=>Date)
    vigencia:Date;
}