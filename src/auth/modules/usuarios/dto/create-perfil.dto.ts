import { IsArray, IsDate, IsEnum, IsIn, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, Matches, MinLength } from "class-validator";
import { Barrio, Estado, TipoPerfil } from '../../../../interfaces/enum/enum-entityes';
import { Type } from "class-transformer";
import { Usuario } from "../entities";
import { CreateAfiliadoDto } from "./create-afiliado.dto";
import { CreateUsuarioDto } from "./create-usuario.dto";

export class CreatePerfilDto {


    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    nombrePrimero: string;
    
    @IsString()
    @MinLength(2)
    @IsOptional()
    nombreSegundo?: string;
    
    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    apellidoPrimero: string;
    
    @IsString()
    @MinLength(2)
    @IsOptional()
    apellidoSegundo?: string;
    
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    CI: string;
    
    @IsString()
    @IsNotEmpty()
    @IsIn(['MASCULINO','FEMENINO'])
    genero: string;
    
    @IsString()
    @MinLength(2)
    @IsNotEmpty()
    profesion: string;

    @IsEnum(TipoPerfil,{each:true})
    @IsArray()
    @IsNotEmpty({each:true})
    tipoPerfil: TipoPerfil[];

    @IsNotEmpty()
    @IsDate()
    @Type(()=>Date)
    fechaNacimiento: Date;
    
    @IsArray()
    @IsString({each:true})
    @IsNotEmpty({each:true})
    @Matches(/^\+[591]{3}\s[0-9]{6,8}$/gs,{each:true,message:'Debe ser un numero telefonico de bolivia valido, example: "+591 {de 6 a 8 digitos}"'})
    @IsOptional()
    contactos?: string[];
    
    @IsEnum(Estado)
    @IsNotEmpty()
    @IsOptional()
    estado?: Estado;

    @Type(()=>CreateUsuarioDto)
    @IsNotEmptyObject({})
    @IsOptional()
    usuarioForm?:CreateUsuarioDto;

    @Type(()=>CreateAfiliadoDto)
    @IsNotEmptyObject({})
    @IsOptional()
    afiliadoForm?:CreateAfiliadoDto;
  
}
