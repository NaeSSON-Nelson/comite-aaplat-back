import { IsBoolean, IsEnum, IsNumber, Min } from "class-validator";
import { Estado } from "src/interfaces/enum/enum-entityes";

export class UpdateStatusGestion{
    @IsBoolean()
    registrable:boolean;
}