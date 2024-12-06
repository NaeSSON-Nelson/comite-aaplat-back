import { IsEnum } from "class-validator";
import { RetrasoTipo } from "src/interfaces/enum/enum-entityes";

export class RetrasosPagosDto{
    
    @IsEnum(RetrasoTipo)
    tipo:RetrasoTipo;
}