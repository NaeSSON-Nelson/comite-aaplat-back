import { IsEnum, IsIn, IsNumber, IsNumberString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Barrio, Mes } from 'src/interfaces/enum/enum-entityes';

export class QueryLecturasDto extends PaginationDto{
  @IsNumberString()
  @IsOptional()
  gestion?: number;

  // @IsEnum(Barrio)
  @IsIn(['MENDEZ FORTALEZA','20 DE MARZO','SAN ANTONIO','VERDE OLIVO','PRIMAVERA',])
  @IsOptional()
  barrio?: Barrio;
  @IsString()
  @MinLength(1)
  @MaxLength(1)
  @IsOptional()
  manzano?:string;
  @IsEnum(Mes)
  @IsOptional()
  mes?: Mes;
}
