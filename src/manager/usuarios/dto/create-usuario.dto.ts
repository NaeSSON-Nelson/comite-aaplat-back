import { IsArray, IsEmail, IsInt, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, Min, MinLength } from "class-validator";
import { Afiliado } from '../../../afiliados/entities/afiliado.entity';
import { Type } from "class-transformer";
import { Role } from '../../roles/roles/entities/role.entity';

export class CreateUsuarioDto {
    
    @IsObject()
    @IsNotEmptyObject({})
    @Type(()=>Afiliado)
    afiliado:Afiliado;
    
    @IsArray()
    @IsInt({each:true})
    roles:number[];

    // @IsString()
    // @MinLength(5)
    // @IsNotEmpty()
    // userName:string;
    // @IsString()
    // @MinLength(5)
    // @IsNotEmpty()
    // password:string;
    @IsInt()
    @Min(0)
    @IsOptional()
    estado?:number;
}
