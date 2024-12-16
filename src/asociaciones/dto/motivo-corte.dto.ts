import { IsString, MinLength } from "class-validator";

export class MotivoReconexionDto{
    @IsString()
    @MinLength(5)
    motivo:string;
}