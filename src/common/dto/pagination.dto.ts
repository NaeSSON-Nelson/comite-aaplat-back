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
import { Barrio } from 'src/interfaces/enum/Entities.enum';
import { patternTextLine } from 'src/interfaces/validators';

export class PaginationDto {
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
  @MinLength(1)
  @Matches(patternTextLine, {
    message: 'El query contiene caracteres no validos',
  })
  q?: string; //PALABRAS DE BUSQUEDA

  @IsIn([
    'mendez-fortaleza',
    '20-de-marzo',
    'san-antonio',
    'verde-olivo',
    'primavera',
  ])
  @IsString()
  @IsOptional()
  barrio?: string;
}
