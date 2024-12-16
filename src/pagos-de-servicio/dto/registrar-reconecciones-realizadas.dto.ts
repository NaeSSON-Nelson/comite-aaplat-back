import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, Min, ValidateNested } from "class-validator";

export class RegistrarReconexionesRealizadasDto{

    @ValidateNested({each:true})
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => AsociacionForm)
    reconexionesList:AsociacionForm[];
}
class AsociacionForm{

    @IsNumber()
    @Min(1)
    id:number;
}