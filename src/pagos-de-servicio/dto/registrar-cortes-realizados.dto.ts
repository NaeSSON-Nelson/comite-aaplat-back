import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsIn, IsNumber, Min, ValidateNested } from "class-validator";

export class RegistrarCortesRealizadosDto{

    @ValidateNested({each:true})
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => AsociacionForm)
    medidoresCortados:AsociacionForm[];
}

class AsociacionForm{

    @IsNumber()
    @Min(1)
    id:number;
    @IsIn(['MULTA','CIERRE'])
    tipoCorte:'MULTA'|'CIERRE';
}