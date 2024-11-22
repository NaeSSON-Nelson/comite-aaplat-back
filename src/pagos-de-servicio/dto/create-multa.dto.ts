import { Type } from "class-transformer";
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { Monedas } from "src/interfaces/enum/enum-entityes";


class Lectura  {

    @IsNumber()
    @Min(1)
    id:number;
}
export class CreateMultaDto{

    @ValidateNested({each:true})
    @IsArray()
    @ArrayMinSize(3) // MINIMO DE LECTURAS PARA LA MULTA
    @ArrayMaxSize(5) // MAXIMO DE LECTURAS PARA LA MULTA
    @Type(() => Lectura)
    lecturasMultadas:Lectura[];
    @IsNumber()
    @Min(1)
    medidorAsociadoId:number;
    @IsNumber()
    @Min(1)
    perfilMultadoId:number;
    @IsString()
    @MinLength(10)
    motivo:string;
    @IsNumber()
    @Min(5)
    monto:number;
    @IsEnum(Monedas)
    moneda:Monedas;
}