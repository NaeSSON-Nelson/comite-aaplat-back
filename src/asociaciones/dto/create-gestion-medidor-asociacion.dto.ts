import { IsBoolean, IsNotEmptyObject, IsNumber, Min, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

export class CreateGestionMedidorAsociadoDto {

    @IsNumber()
    asociacion: number;
}