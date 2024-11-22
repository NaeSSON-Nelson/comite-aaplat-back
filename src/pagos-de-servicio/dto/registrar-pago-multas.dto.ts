import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsNumber, Min, ValidateNested } from "class-validator";

class MultaForm{
    @IsNumber()
    @Min(1)
    multaId:number;
    @IsNumber()
    @Min(1)
    medidorAsociadoId:number;
    @ValidateNested({each:true})
    @IsArray()
    @ArrayMinSize(3)
    @Type(() => LecturasForm)
    lecturasMultadas:LecturasForm[];
}
class LecturasForm{
    @IsNumber()
    @Min(1)
    lecturaId:number;
}
export class RegistrarPagoMultasDto{
    @IsNumber()
    @Min(1)
    perfilId:number;
    
    @ValidateNested({each:true})
    @ArrayMinSize(1) 
    @IsArray()
    @Type(() => MultaForm)
    multas:MultaForm[];
}