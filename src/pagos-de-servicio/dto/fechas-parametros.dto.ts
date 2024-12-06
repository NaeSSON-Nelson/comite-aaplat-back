import { IsDate, IsDateString, IsNumberString, Min } from "class-validator";


export class FechasParametrosDto{

    @IsDateString()
    fechaInicio:Date;
    @IsDateString()
    fechaFin:Date;
}