import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  
} from 'class-validator';
import { Barrio } from 'src/interfaces/enum/enum-entityes';
import { aptternTextLineQuery, patternTextLine } from 'src/interfaces/validators';

export  abstract class PaginationDto {
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  limit?: number; //EL LIMITE DE OBJETOS DEVUELTOS

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  offset?: number; //EN QUE NUMERO EMPEZARA A DEVOLVER LA LISTA

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  @IsString()
  order?: 'ASC' | 'DESC'; //EL ORDEN QUE VENDRAN

  @IsOptional()
  @IsString()
  sort?:string; // POR EL TIPO DE CAMPO A ORDENAR

  @IsOptional()
  @IsString({})
  @MinLength(1)
  @Matches(aptternTextLineQuery, {
    message: (str=>{
      
      return `${str.value}, contiene caracteres no validos`;
    }),

  })
  q?: string; //PALABRAS DE BUSQUEDA

}
