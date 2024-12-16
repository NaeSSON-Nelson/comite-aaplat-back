import {IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class NuevoBeneficiarioDescuentoDto{
    @IsString()
    @MinLength(1)
    tipoBeneficiario:string;
    @IsString()
    @IsOptional()
    detalles:string;
    @IsNumber()
    @Min(0)
    descuento:number;
}