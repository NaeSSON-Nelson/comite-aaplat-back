import { PartialType } from "@nestjs/mapped-types";
import { MultasVariosDto } from "./multas-varios.dto";
import { Estado } from "src/interfaces/enum/enum-entityes";
import { IsEnum, IsOptional } from "class-validator";

export class UpdateMultasVariosDto extends PartialType(MultasVariosDto) {


    @IsOptional()
    @IsEnum(Estado)
    estado?:Estado
}

