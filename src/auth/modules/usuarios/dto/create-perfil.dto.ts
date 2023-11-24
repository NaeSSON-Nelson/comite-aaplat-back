import { IsArray, IsDate, IsEnum, IsIn, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, Matches, MinLength, ValidateNested } from "class-validator";
import { Barrio, Estado, TipoPerfil } from '../../../../interfaces/enum/enum-entityes';
import { Type } from "class-transformer";
import { Usuario } from "../entities";
import { CreateAfiliadoDto } from "./create-afiliado.dto";
import { CreateUsuarioDto } from "./create-usuario.dto";
import { patternTextLine } from "src/interfaces/validators";

export class CreatePerfilDto {


    @IsString()
    @MinLength(2)
    @Matches(patternTextLine)
    @IsNotEmpty()
    nombrePrimero: string;
    
    @IsString()
    @Matches(patternTextLine)
    @IsOptional()
    nombreSegundo?: string;
    
    @IsString()
    @Matches(patternTextLine)
    @MinLength(2)
    @IsNotEmpty()
    apellidoPrimero: string;
    
    @IsString()
    @Matches(patternTextLine)
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
    
    @IsString()
    @IsOptional()
    direccion?: string;

    // @IsArray()
    // @IsEnum(TipoPerfil,{each:true})
    // @IsNotEmpty({each:true})
    // tipoPerfil: TipoPerfil[];

    @IsNotEmpty()
    @IsDate()
    @Type(()=>Date)
    fechaNacimiento: Date;
    
    @IsString()
    @IsNotEmpty()
    @Matches(/^\+[591]{3}\s[0-9]{6,8}$/gs,{message:'Debe ser un numero telefonico de bolivia valido, example: "+591 {de 6 a 8 digitos}"'})
    @IsOptional()
    contacto?: string;
    
    @IsEnum(Estado)
    @IsNotEmpty()
    @IsOptional()
    estado?: Estado;

    // @IsNotEmptyObject({})
    @ValidateNested()
    @Type(()=>CreateUsuarioDto)
    @IsOptional()
    usuarioForm?:CreateUsuarioDto;
    
    @ValidateNested()
    @Type(()=>CreateAfiliadoDto)
    @IsOptional()
    afiliadoForm?:CreateAfiliadoDto;
  
}
