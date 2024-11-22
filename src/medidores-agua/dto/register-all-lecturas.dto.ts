import { Medicion, Mes } from "src/interfaces/enum/enum-entityes";
import { ArrayMinSize, IsArray, IsEnum,  IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class planillaForm{
    @IsNumber()
    @Min(1)
    id:number;
}
class Lectura  {

    @IsNumber()
    @Min(1)
    id:number;
    @IsNumber()
    @Min(1)
    lectura:number;
    
    @IsEnum(Medicion)
    medicion:Medicion;
    @IsString()
    @IsOptional()
    estadoMedidor?:string;
    @ValidateNested()
    @Type(()=>planillaForm)
    planilla:planillaForm;
}

export class registerAllLecturasDto{

    @ValidateNested({each:true})
    @IsArray()
    @ArrayMinSize(1)
    @Type(() => Lectura)
    registros:Lectura[];

    // @IsEnum(Mes)
    // @IsNotEmpty()
    // mes:Mes;
       
    // @IsNumber()
    // @Min(2000)
    // anio:number;
}