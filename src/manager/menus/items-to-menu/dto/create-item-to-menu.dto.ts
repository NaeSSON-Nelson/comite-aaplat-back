import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { Estado } from "src/interfaces/enum/enum-entityes";

export class CreateItemToMenuDto {
  
    @IsString()
    @MinLength(2)
    nombre: string;
    
    @IsEnum(Estado)
    @IsOptional()
    estado?: Estado;
  
    @IsBoolean()
    @IsOptional()
    visible?:boolean;
    
  }