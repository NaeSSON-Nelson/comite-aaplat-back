import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Estado } from 'src/interfaces/enum/enum-entityes';


export class CreateItemMenuDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(2)
  linkMenu: string;
  
  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;

  @IsBoolean()
  @IsOptional()
  visible?:boolean;
}
