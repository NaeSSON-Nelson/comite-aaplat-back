import { IsBoolean, IsEnum, IsIn, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Barrio, TipoPerfil } from "src/interfaces/enum/enum-entityes";


export class SearchPerfil extends PaginationDto{

    
  @IsEnum(Barrio)
  @IsOptional()
  barrio?: Barrio;
  
  @IsBoolean()
  @IsOptional()
  accessAccount?:boolean;
  
  @IsIn(['MASCULINO','FEMENINO'])
  @IsOptional()
  genero?:string;
  
  @IsEnum(TipoPerfil)
  @IsOptional()
  tipoPerfil?:TipoPerfil;

}