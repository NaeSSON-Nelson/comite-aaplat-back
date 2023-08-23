import { IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, Min, ValidateNested } from "class-validator";
import { Medidor } from "../entities/medidor.entity";
import { Type } from "class-transformer";
import { Estado } from "src/interfaces/enum/enum-entityes";
export class MedidorForm{

    @IsNumber()
    @Min(1)
    id:number;
}
export class CreatePlanillaMedidorDto {
    @IsNumber({allowNaN:false,})
    @Min(2000,{message:'Debe ser un año en el cual el comite haya iniciado'})
    @IsNotEmpty()
    gestion:number;

    @ValidateNested()
    @Type(()=>MedidorForm)
    medidor:MedidorForm;

    @IsEnum(Estado)
    @IsNotEmpty()
    @IsOptional()
    estado?:Estado;
}