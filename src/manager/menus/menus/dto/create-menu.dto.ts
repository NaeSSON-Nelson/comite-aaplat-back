import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  Length,
  IsNumber,
  IsObject,
  IsNotEmptyObject,
  IsDefined,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { MenuItemsC } from 'src/interfaces/menuItems-c.interface';

export class CreateMenuDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  linkMenu?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estado?: number;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  itemsMenu?: number[];
}
