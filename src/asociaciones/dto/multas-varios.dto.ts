import { IsEnum, IsNumber, IsString, Min, MinLength } from "class-validator";
import { Monedas } from "src/interfaces/enum/enum-entityes";


export class MultasVariosDto{
    @IsString()
    @MinLength(2)
    motivo:string;
    @IsNumber()
    @Min(0)
    monto:number;
    @IsEnum(Monedas)
    moneda:Monedas;
    @IsNumber()
    @Min(1)
    idAsociacion:number;
}