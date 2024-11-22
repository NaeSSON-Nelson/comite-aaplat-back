import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, Min, ValidateNested } from "class-validator";

export class CreateTarifaPorPagarDto{

    @ValidateNested({each:true})
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Lectura)
    lecturas:Lectura[];
}
class Lectura  {

    @IsNumber()
    @Min(1)
    id:number;
}