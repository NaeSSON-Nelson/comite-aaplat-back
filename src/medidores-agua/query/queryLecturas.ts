import { IsEnum, IsIn, IsNumber, IsNumberString, IsOptional } from 'class-validator';
import { Barrio, Mes } from 'src/interfaces/enum/enum-entityes';

export class QueryLecturasDto {
  @IsNumberString()
  @IsOptional()
  gestion: number;

  // @IsEnum(Barrio)
  @IsIn(['','MENDEZ FORTALEZA','20 DE MARZO','SAN ANTONIO','VERDE OLIVO','PRIMAVERA',])
  @IsOptional()
  barrio: Barrio;

  @IsEnum(Mes)
  @IsOptional()
  mes: Mes;
}
