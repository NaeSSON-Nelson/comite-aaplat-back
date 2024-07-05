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
  IsEnum,
  IsBoolean,
} from 'class-validator';

import { Type } from 'class-transformer';
import { MenuItemsC } from 'src/interfaces/menuItems-c.interface';
import { Estado } from 'src/interfaces/enum/enum-entityes';
import { ItemToMenu } from '../../items-to-menu/entities/item-to-menu.entity';
class itemToMenuForm{
  @IsNumber()
  @Min(1)
  itemMenuId:number;

  @IsString()
  nombre:string;

  @IsBoolean()
  @IsOptional()
  visible?:boolean;

}
export class CreateMenuDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(2)
  linkMenu: string;

  @IsEnum(Estado)
  @IsOptional()
  estado?: Estado;

  @IsArray()
  @IsOptional()
  @ValidateNested()
  @Type(()=>itemToMenuForm)
  itemsMenu?: itemToMenuForm[];
}
