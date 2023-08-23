import { IsEnum, IsNumber, IsNumberString, IsOptional } from 'class-validator';
import { Barrio, Mes } from 'src/interfaces/enum/enum-entityes';

export class QueryLecturasDto {
  @IsNumberString()
  @IsOptional()
  gestion: number;

  @IsEnum(Barrio)
  @IsOptional()
  barrio: Barrio;

  @IsEnum(Mes)
  @IsOptional()
  mes: Mes;
}
